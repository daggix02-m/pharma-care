import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

const DEFAULT_DELEGATION_HOURS = 24;

function normalizeText(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

async function getActorWithPharmacy(ctx: any, sessionToken?: string) {
  const actor = await getAuthenticatedUser(ctx, sessionToken);
  if (!actor) throw new Error("Unauthorized");
  if (!actor.pharmacyId) throw new Error("User is not linked to a pharmacy");
  return actor;
}

async function ensureBranchInPharmacy(
  ctx: any,
  branchId: string,
  pharmacyId: string,
) {
  const branch = await ctx.db.get(branchId);
  if (!branch || branch.pharmacyId !== pharmacyId) {
    throw new Error("Branch does not belong to your pharmacy");
  }
  return branch;
}

function canManagerApprove(actor: any): boolean {
  return Boolean(
    actor.role === "manager" &&
    actor.canApproveStockTransfers &&
    actor.stockApprovalDelegationExpiresAt &&
    actor.stockApprovalDelegationExpiresAt > Date.now(),
  );
}

export const getTransferFormOptions = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActorWithPharmacy(ctx, args.sessionToken);
    if (!["owner", "manager", "pharmacist"].includes(actor.role)) {
      throw new Error("Unauthorized");
    }

    const branches = await ctx.db
      .query("branches")
      .withIndex("by_pharmacy", (q: any) =>
        q.eq("pharmacyId", actor.pharmacyId),
      )
      .collect();

    const availableSourceBranchIds =
      actor.role === "pharmacist" && actor.branchId
        ? [actor.branchId]
        : branches.map((branch: any) => branch._id);

    const medicinesBySource: Record<string, any[]> = {};
    for (const branchId of availableSourceBranchIds) {
      const medicines = await ctx.db
        .query("medicines")
        .withIndex("by_branch", (q: any) => q.eq("branchId", branchId))
        .collect();
      medicinesBySource[String(branchId)] = medicines.map((medicine: any) => ({
        _id: medicine._id,
        name: medicine.name,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        barcode: medicine.barcode,
        genericName: medicine.genericName,
        price: medicine.price,
        stock: medicine.stock,
      }));
    }

    return {
      actorRole: actor.role,
      actorBranchId: actor.branchId || null,
      canApproveAsManager: canManagerApprove(actor),
      delegationExpiresAt: actor.stockApprovalDelegationExpiresAt || null,
      branches: branches.map((branch: any) => ({
        _id: branch._id,
        name: branch.name,
        status: branch.status,
      })),
      medicinesBySource,
    };
  },
});

export const requestStockTransfer = mutation({
  args: {
    fromBranchId: v.id("branches"),
    toBranchId: v.id("branches"),
    sourceMedicineId: v.id("medicines"),
    quantity: v.number(),
    urgency: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    reason: v.string(),
    notes: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActorWithPharmacy(ctx, args.sessionToken);
    if (!["manager", "pharmacist"].includes(actor.role)) {
      throw new Error("Only managers and pharmacists can request transfers");
    }

    if (args.quantity <= 0) throw new Error("Quantity must be greater than 0");
    if (args.fromBranchId === args.toBranchId) {
      throw new Error("Source and destination branches must be different");
    }

    const fromBranch = await ensureBranchInPharmacy(
      ctx,
      args.fromBranchId,
      actor.pharmacyId,
    );
    await ensureBranchInPharmacy(ctx, args.toBranchId, actor.pharmacyId);

    if (
      actor.role === "pharmacist" &&
      actor.branchId &&
      actor.branchId !== args.fromBranchId
    ) {
      throw new Error(
        "Pharmacists can only request transfers from their branch",
      );
    }

    const sourceMedicine = await ctx.db.get(args.sourceMedicineId);
    if (!sourceMedicine || sourceMedicine.branchId !== args.fromBranchId) {
      throw new Error("Selected medicine is not in the source branch");
    }

    if (sourceMedicine.stock < args.quantity) {
      throw new Error("Insufficient stock in source branch");
    }

    const requestId = await ctx.db.insert("stock_transfer_requests", {
      pharmacyId: actor.pharmacyId,
      requesterUserId: actor._id,
      requesterRole: actor.role,
      fromBranchId: args.fromBranchId,
      toBranchId: args.toBranchId,
      sourceMedicineId: args.sourceMedicineId,
      medicineSnapshot: {
        name: sourceMedicine.name,
        category: sourceMedicine.category,
        manufacturer: sourceMedicine.manufacturer,
        barcode: sourceMedicine.barcode,
        genericName: sourceMedicine.genericName,
        price: sourceMedicine.price,
      },
      quantity: args.quantity,
      urgency: args.urgency,
      reason: args.reason,
      notes: args.notes,
      status: "pending_owner",
    });

    await ctx.db.insert("audit_logs", {
      userId: actor._id,
      action: "request_stock_transfer",
      entityId: String(requestId),
      entityType: "stock_transfer_request",
      details: `Requested transfer of ${args.quantity} ${sourceMedicine.name} from ${fromBranch.name}`,
      timestamp: Date.now(),
    });

    return { success: true, requestId };
  },
});

export const getTransferRequestsForPharmacy = query({
  args: {
    sessionToken: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActorWithPharmacy(ctx, args.sessionToken);
    if (!["owner", "manager", "pharmacist"].includes(actor.role)) {
      throw new Error("Unauthorized");
    }

    const requests = await ctx.db
      .query("stock_transfer_requests")
      .withIndex("by_pharmacy", (q: any) =>
        q.eq("pharmacyId", actor.pharmacyId),
      )
      .order("desc")
      .take(200);

    const filtered = args.status
      ? requests.filter((request: any) => request.status === args.status)
      : requests;

    const hydrated = await Promise.all(
      filtered.map(async (request: any) => {
        const requester = (await ctx.db.get(request.requesterUserId)) as any;
        const approver = request.approvedByUserId
          ? ((await ctx.db.get(request.approvedByUserId)) as any)
          : null;
        const rejector = request.rejectedByUserId
          ? ((await ctx.db.get(request.rejectedByUserId)) as any)
          : null;
        const fromBranch = (await ctx.db.get(request.fromBranchId)) as any;
        const toBranch = (await ctx.db.get(request.toBranchId)) as any;

        return {
          ...request,
          requesterName: requester?.full_name || "Unknown",
          requesterEmail: requester?.email || "",
          approverName: approver?.full_name || null,
          rejectorName: rejector?.full_name || null,
          fromBranchName: fromBranch?.name || "Unknown",
          toBranchName: toBranch?.name || "Unknown",
        };
      }),
    );

    if (actor.role === "pharmacist") {
      return hydrated.filter(
        (request: any) => request.requesterUserId === actor._id,
      );
    }

    return hydrated;
  },
});

export const setManagerStockApprovalDelegation = mutation({
  args: {
    managerId: v.id("users"),
    enabled: v.boolean(),
    durationHours: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await getActorWithPharmacy(ctx, args.sessionToken);
    if (owner.role !== "owner") {
      throw new Error("Only owners can manage delegation");
    }

    const manager = await ctx.db.get(args.managerId);
    if (!manager || manager.role !== "manager") {
      throw new Error("Target user is not a manager");
    }
    if (manager.pharmacyId !== owner.pharmacyId) {
      throw new Error("Manager is not in your pharmacy");
    }

    const now = Date.now();
    const duration = Math.max(
      1,
      Math.min(args.durationHours ?? DEFAULT_DELEGATION_HOURS, 168),
    );

    await ctx.db.patch(args.managerId, {
      canApproveStockTransfers: args.enabled,
      stockApprovalDelegatedBy: args.enabled ? owner._id : undefined,
      stockApprovalDelegatedAt: args.enabled ? now : undefined,
      stockApprovalDelegationExpiresAt: args.enabled
        ? now + duration * 60 * 60 * 1000
        : undefined,
    });

    await ctx.db.insert("audit_logs", {
      userId: owner._id,
      action: args.enabled
        ? "enable_manager_stock_transfer_approval"
        : "disable_manager_stock_transfer_approval",
      entityId: String(args.managerId),
      entityType: "user",
      details: args.enabled
        ? `Delegated stock transfer approval to ${manager.full_name} for ${duration}h`
        : `Revoked stock transfer approval from ${manager.full_name}`,
      timestamp: now,
    });

    return {
      success: true,
      expiresAt: args.enabled ? now + duration * 60 * 60 * 1000 : null,
    };
  },
});

export const getDelegationManagers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await getActorWithPharmacy(ctx, args.sessionToken);
    if (owner.role !== "owner") {
      throw new Error("Only owners can view delegation settings");
    }

    const managers = await ctx.db
      .query("users")
      .withIndex("by_pharmacy", (q: any) =>
        q.eq("pharmacyId", owner.pharmacyId),
      )
      .collect();

    return managers
      .filter((manager: any) => manager.role === "manager")
      .map((manager: any) => ({
        _id: manager._id,
        full_name: manager.full_name,
        email: manager.email,
        canApproveStockTransfers: Boolean(manager.canApproveStockTransfers),
        stockApprovalDelegationExpiresAt:
          manager.stockApprovalDelegationExpiresAt || null,
      }));
  },
});

export const approveStockTransferRequest = mutation({
  args: {
    requestId: v.id("stock_transfer_requests"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActorWithPharmacy(ctx, args.sessionToken);
    const isOwner = actor.role === "owner";
    const isDelegatedManager = canManagerApprove(actor);

    if (!isOwner && !isDelegatedManager) {
      throw new Error("You are not authorized to approve transfer requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Transfer request not found");
    if (request.pharmacyId !== actor.pharmacyId) {
      throw new Error("Transfer request is not in your pharmacy");
    }
    if (request.status !== "pending_owner") {
      throw new Error("Transfer request is no longer pending approval");
    }

    const fromBranch = await ensureBranchInPharmacy(
      ctx,
      request.fromBranchId,
      actor.pharmacyId,
    );
    await ensureBranchInPharmacy(ctx, request.toBranchId, actor.pharmacyId);

    const sourceMedicine = await ctx.db.get(request.sourceMedicineId);
    if (!sourceMedicine || sourceMedicine.branchId !== request.fromBranchId) {
      throw new Error("Source medicine is no longer valid");
    }
    if (sourceMedicine.stock < request.quantity) {
      throw new Error("Insufficient source stock at approval time");
    }

    const destinationMedicines = await ctx.db
      .query("medicines")
      .withIndex("by_branch", (q: any) => q.eq("branchId", request.toBranchId))
      .collect();

    const targetMedicine = destinationMedicines.find((medicine: any) => {
      return (
        normalizeText(medicine.name) ===
          normalizeText(request.medicineSnapshot.name) &&
        normalizeText(medicine.category) ===
          normalizeText(request.medicineSnapshot.category) &&
        normalizeText(medicine.manufacturer) ===
          normalizeText(request.medicineSnapshot.manufacturer) &&
        normalizeText(medicine.barcode) ===
          normalizeText(request.medicineSnapshot.barcode) &&
        normalizeText(medicine.genericName) ===
          normalizeText(request.medicineSnapshot.genericName) &&
        medicine.price === request.medicineSnapshot.price
      );
    });

    if (targetMedicine) {
      await ctx.db.patch(targetMedicine._id, {
        stock: targetMedicine.stock + request.quantity,
      });
    } else {
      await ctx.db.insert("medicines", {
        branchId: request.toBranchId,
        name: sourceMedicine.name,
        category: sourceMedicine.category,
        stock: request.quantity,
        price: sourceMedicine.price,
        minStock: sourceMedicine.minStock,
        type: sourceMedicine.type,
        manufacturer: sourceMedicine.manufacturer,
        barcode: sourceMedicine.barcode,
        expiryDate: sourceMedicine.expiryDate,
        status: sourceMedicine.status,
        genericName: sourceMedicine.genericName || sourceMedicine.name,
        brandNames: sourceMedicine.brandNames || [],
        usageInstructions: sourceMedicine.usageInstructions,
        sideEffects: sourceMedicine.sideEffects,
        warnings: sourceMedicine.warnings,
        storageRequirements: sourceMedicine.storageRequirements,
        costPrice: sourceMedicine.costPrice,
        priceChangeHistory: sourceMedicine.priceChangeHistory || [],
        supplierId: sourceMedicine.supplierId,
        supplierName: sourceMedicine.supplierName,
        batches: sourceMedicine.batches || [],
        prescriptionRequired: Boolean(sourceMedicine.prescriptionRequired),
        controlledSubstance: Boolean(sourceMedicine.controlledSubstance),
        dosageLimit: sourceMedicine.dosageLimit,
      });
    }

    await ctx.db.patch(request.sourceMedicineId, {
      stock: sourceMedicine.stock - request.quantity,
    });

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: "fulfilled",
      approvedByUserId: actor._id,
      approvedByRole: isOwner ? "owner" : "manager",
      approvedAt: now,
      fulfilledAt: now,
      fulfillmentAuditId: `${actor._id}_${now}`,
    });

    await ctx.db.insert("audit_logs", {
      userId: actor._id,
      action: "approve_and_fulfill_stock_transfer",
      entityId: String(args.requestId),
      entityType: "stock_transfer_request",
      details: `Transferred ${request.quantity} units of ${sourceMedicine.name} from ${fromBranch.name}`,
      timestamp: now,
    });

    return { success: true };
  },
});

export const rejectStockTransferRequest = mutation({
  args: {
    requestId: v.id("stock_transfer_requests"),
    rejectionReason: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActorWithPharmacy(ctx, args.sessionToken);
    const isOwner = actor.role === "owner";
    const isDelegatedManager = canManagerApprove(actor);

    if (!isOwner && !isDelegatedManager) {
      throw new Error("You are not authorized to reject transfer requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Transfer request not found");
    if (request.pharmacyId !== actor.pharmacyId) {
      throw new Error("Transfer request is not in your pharmacy");
    }
    if (request.status !== "pending_owner") {
      throw new Error("Transfer request is no longer pending approval");
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      rejectedByUserId: actor._id,
      rejectedByRole: isOwner ? "owner" : "manager",
      rejectedAt: now,
      rejectionReason: args.rejectionReason,
    });

    await ctx.db.insert("audit_logs", {
      userId: actor._id,
      action: "reject_stock_transfer_request",
      entityId: String(args.requestId),
      entityType: "stock_transfer_request",
      details: `Rejected transfer request: ${args.rejectionReason}`,
      timestamp: now,
    });

    return { success: true };
  },
});

export const cancelStalePendingTransferRequests = mutation({
  args: {
    staleAfterHours: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getAuthenticatedUser(ctx, args.sessionToken);
    if (!actor || actor.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const hours = Math.max(1, Math.min(args.staleAfterHours ?? 72, 720));

    const result = await runStaleTransferCleanup(ctx, {
      staleAfterHours: hours,
      reasonPrefix: "Auto-cancelled after",
    });

    await ctx.db.insert("audit_logs", {
      userId: actor._id,
      action: "cancel_stale_stock_transfer_requests",
      entityId: String(actor._id),
      entityType: "stock_transfer_request",
      details: `Cancelled ${result.cancelled} stale pending transfer requests (${hours}h threshold)`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      cancelled: result.cancelled,
      staleAfterHours: hours,
    };
  },
});

async function runStaleTransferCleanup(
  ctx: any,
  args: { staleAfterHours: number; reasonPrefix: string },
) {
  const hours = Math.max(1, Math.min(args.staleAfterHours, 720));
  const now = Date.now();
  const cutoff = now - hours * 60 * 60 * 1000;

  const pendingRequests = await ctx.db
    .query("stock_transfer_requests")
    .withIndex("by_status", (q: any) => q.eq("status", "pending_owner"))
    .collect();

  let cancelled = 0;
  for (const request of pendingRequests) {
    if (request._creationTime <= cutoff) {
      await ctx.db.patch(request._id, {
        status: "cancelled",
        rejectionReason: `${args.reasonPrefix} ${hours}h without approval`,
        rejectedAt: now,
      });
      cancelled += 1;
    }
  }

  return { cancelled, staleAfterHours: hours };
}

export const cancelStalePendingTransferRequestsInternal = internalMutation({
  args: {
    staleAfterHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return runStaleTransferCleanup(ctx, {
      staleAfterHours: Math.max(1, Math.min(args.staleAfterHours ?? 72, 720)),
      reasonPrefix: "Auto-cancelled after",
    });
  },
});
