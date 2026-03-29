// @ts-ignore
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const updateStaff = mutation({
  args: {
    id: v.id("users"),
    data: v.object({
      full_name: v.optional(v.string()),
      role: v.optional(v.string()),
      branchId: v.optional(v.id("branches")),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const staffMember = await ctx.db.get(args.id);
    if (!staffMember) throw new Error("Staff member not found");

    // Ensure the staff member belongs to the same pharmacy
    if (staffMember.pharmacyId !== manager.pharmacyId) {
      throw new Error(
        "Unauthorized: Staff member belongs to a different pharmacy",
      );
    }

    await ctx.db.patch(args.id, args.data);
    return { success: true };
  },
});

export const removeStaff = mutation({
  args: { id: v.id("users") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const staffMember = await ctx.db.get(args.id);
    if (!staffMember) throw new Error("Staff member not found");

    if (staffMember.pharmacyId !== manager.pharmacyId) {
      throw new Error(
        "Unauthorized: Staff member belongs to a different pharmacy",
      );
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const requestBranch = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager" || !manager.pharmacyId) {
      throw new Error("Unauthorized: Manager only");
    }

    const branchId = await ctx.db.insert("branches", {
      name: args.name,
      address: args.address || "",
      pharmacyId: manager.pharmacyId,
      managerId: manager._id,
      status: "pending", // Requires admin approval
    });

    return { success: true, branchId };
  },
});

export const updateBranch = mutation({
  args: {
    id: v.id("branches"),
    data: v.object({
      name: v.optional(v.string()),
      address: v.optional(v.string()),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const branch = await ctx.db.get(args.id);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Branch not found or unauthorized");
    }

    await ctx.db.patch(args.id, args.data);

    return { success: true };
  },
});

export const removeBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const branch = await ctx.db.get(args.id);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Branch not found or unauthorized");
    }

    // In a real app, we might want to check if there are medicines or sales attached
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const addMedicine = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    stock: v.number(),
    price: v.number(),
    branchId: v.id("branches"),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    // Verify manager owns the branch
    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Unauthorized: Branch does not belong to your pharmacy");
    }

    const medicineId = await ctx.db.insert("medicines", {
      name: args.name,
      category: args.category,
      stock: args.stock,
      price: args.price,
      branchId: args.branchId,
    });

    return { success: true, medicineId };
  },
});

export const updateMedicineStock = mutation({
  args: {
    id: v.id("medicines"),
    stock: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const medicine = await ctx.db.get(args.id);
    if (!medicine) throw new Error("Medicine not found");

    const branch = await ctx.db.get(medicine.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { stock: args.stock });
    return { success: true };
  },
});

export const removeMedicine = mutation({
  args: { id: v.id("medicines") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const medicine = await ctx.db.get(args.id);
    if (!medicine) throw new Error("Medicine not found");

    const branch = await ctx.db.get(medicine.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const createSale = mutation({
  args: {
    branchId: v.id("branches"),
    items: v.array(
      v.object({
        medicineId: v.id("medicines"),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
    totalAmount: v.number(),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    paymentMethod: v.string(),
    chapaTransactionId: v.optional(v.string()),
    chapaPaymentMethod: v.optional(v.string()),
    chapaReference: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const cashier = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!cashier) {
      throw new Error("Unauthorized");
    }

    // Deduct inventory
    for (const item of args.items) {
      const medicine = await ctx.db.get(item.medicineId);
      if (!medicine) throw new Error(`Medicine ${item.medicineId} not found`);
      if (medicine.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}`);
      }
      await ctx.db.patch(medicine._id, {
        stock: medicine.stock - item.quantity,
      });
    }

    const saleId = await ctx.db.insert("sales", {
      branchId: args.branchId,
      cashierId: cashier._id,
      totalAmount: args.totalAmount,
      status: "completed",
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      paymentMethod: args.paymentMethod,
      chapaTransactionId: args.chapaTransactionId,
      chapaPaymentMethod: args.chapaPaymentMethod,
      chapaStatus: args.chapaTransactionId ? "success" : undefined,
      chapaReference: args.chapaReference,
      items: args.items,
    });

    return { success: true, saleId };
  },
});

export const createStaff = mutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    role: v.union(v.literal("pharmacist"), v.literal("cashier")),
    branchId: v.id("branches"),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    // Verify the branch belongs to this manager's pharmacy
    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Unauthorized: Branch does not belong to your pharmacy");
    }

    // Create the user in Convex as pending
    const userId = await ctx.db.insert("users", {
      full_name: args.full_name,
      email: args.email,
      role: args.role,
      branchId: args.branchId,
      pharmacyId: manager.pharmacyId,
      status: "pending",
      tokenIdentifier: `pending_${args.email}`,
      clerkId: "pending",
    });

    return { success: true, userId };
  },
});

export const createManager = mutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    branchId: v.id("branches"),
  },
  handler: async (_ctx: any, _args: any) => {
    throw new Error(
      "Manager account creation is disabled. Owners can create accounts.",
    );
  },
});

export const resetStaffPassword = mutation({
  args: {
    userId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const staffMember = await ctx.db.get(args.userId);
    if (!staffMember || staffMember.pharmacyId !== manager.pharmacyId) {
      throw new Error(
        "Unauthorized: Staff member not found or not in your pharmacy",
      );
    }

    // Note: Password reset is handled by Clerk
    await ctx.db.insert("audit_logs", {
      userId: manager._id,
      action: "password_reset",
      entityId: args.userId,
      entityType: "user",
      details: `Password reset requested for ${staffMember.email}`,
      timestamp: Date.now(),
    });

    return { success: true, message: "Password reset initiated via Clerk" };
  },
});

export const importMedicinesExcel = mutation({
  args: {
    medicines: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        stock: v.number(),
        price: v.number(),
        type: v.optional(v.string()),
        manufacturer: v.optional(v.string()),
        barcode: v.optional(v.string()),
        expiryDate: v.optional(v.number()),
        prescriptionRequired: v.optional(v.boolean()),
      }),
    ),
    branchId: v.id("branches"),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Unauthorized: Branch does not belong to your pharmacy");
    }

    const importedMedicines = [];
    for (const medicineData of args.medicines) {
      const medicineId = await ctx.db.insert("medicines", {
        ...medicineData,
        branchId: args.branchId,
      });
      importedMedicines.push(medicineId);
    }

    await ctx.db.insert("audit_logs", {
      userId: manager._id,
      action: "import_medicines",
      entityId: args.branchId,
      entityType: "branch",
      details: `Imported ${args.medicines.length} medicines from Excel`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      count: importedMedicines.length,
      medicineIds: importedMedicines,
    };
  },
});

export const restockMedicine = mutation({
  args: {
    medicineId: v.id("medicines"),
    quantity: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const medicine = await ctx.db.get(args.medicineId);
    if (!medicine) throw new Error("Medicine not found");

    const branch = await ctx.db.get(medicine.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error("Unauthorized: Medicine not in your pharmacy");
    }

    await ctx.db.patch(args.medicineId, {
      stock: medicine.stock + args.quantity,
    });

    await ctx.db.insert("audit_logs", {
      userId: manager._id,
      action: "restock_medicine",
      entityId: args.medicineId,
      entityType: "medicine",
      details: `Restocked ${medicine.name} with ${args.quantity} units`,
      timestamp: Date.now(),
    });

    return { success: true, newStock: medicine.stock + args.quantity };
  },
});

export const transferStock = mutation({
  args: {
    fromBranchId: v.id("branches"),
    toBranchId: v.id("branches"),
    medicineId: v.id("medicines"),
    quantity: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager") {
      throw new Error("Unauthorized: Manager only");
    }

    const medicine = await ctx.db.get(args.medicineId);
    if (!medicine) throw new Error("Medicine not found");

    const fromBranch = await ctx.db.get(args.fromBranchId);
    const toBranch = await ctx.db.get(args.toBranchId);

    if (!fromBranch || !toBranch) {
      throw new Error("Branch not found");
    }

    if (
      fromBranch.pharmacyId !== manager.pharmacyId ||
      toBranch.pharmacyId !== manager.pharmacyId
    ) {
      throw new Error("Unauthorized: Branches do not belong to your pharmacy");
    }

    if (medicine.branchId !== args.fromBranchId) {
      throw new Error("Medicine is not in the source branch");
    }

    if (medicine.stock < args.quantity) {
      throw new Error("Insufficient stock in source branch");
    }

    // Check if medicine exists in target branch
    const existingMedicines = await ctx.db
      .query("medicines")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("branchId"), args.toBranchId),
          q.eq(q.field("name"), medicine.name),
        ),
      )
      .collect();

    if (existingMedicines.length > 0) {
      // Update existing medicine
      const targetMedicine = existingMedicines[0];
      await ctx.db.patch(targetMedicine._id, {
        stock: targetMedicine.stock + args.quantity,
      });
      await ctx.db.patch(args.medicineId, {
        stock: medicine.stock - args.quantity,
      });
    } else {
      // Create new medicine in target branch
      await ctx.db.insert("medicines", {
        ...medicine,
        _id: undefined,
        branchId: args.toBranchId,
        stock: args.quantity,
      });
      await ctx.db.patch(args.medicineId, {
        stock: medicine.stock - args.quantity,
      });
    }

    await ctx.db.insert("audit_logs", {
      userId: manager._id,
      action: "stock_transfer",
      entityId: args.medicineId,
      entityType: "medicine",
      details: `Transferred ${args.quantity} units of ${medicine.name} from ${fromBranch.name} to ${toBranch.name}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const updateRefundPolicy = mutation({
  args: {
    policy: v.object({
      allow_refunds: v.boolean(),
      refund_window_days: v.number(),
      allow_discounts: v.boolean(),
      max_discount_percent: v.number(),
      require_manager_approval: v.boolean(),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || !manager.pharmacyId) {
      throw new Error("Unauthorized: Manager only");
    }

    await ctx.db.patch(manager.pharmacyId, {
      refundPolicy: args.policy,
    });

    await ctx.db.insert("audit_logs", {
      userId: manager._id,
      action: "update_refund_policy",
      entityId: manager.pharmacyId,
      entityType: "pharmacy",
      details: "Updated refund policy",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found or unauthorized");
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
    });

    return { success: true };
  },
});

export const generatePharmacyCode = mutation({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!manager || manager.role !== "manager" || !manager.pharmacyId) {
      throw new Error("Unauthorized: Manager only");
    }

    const pharmacy = await ctx.db.get(manager.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await ctx.db.patch(manager.pharmacyId, {
      inviteCode: randomCode,
    });

    await ctx.db.insert("audit_logs", {
      userId: manager._id,
      action: "generate_pharmacy_code",
      entityId: manager.pharmacyId,
      entityType: "pharmacy",
      details: "Generated new pharmacy invite code",
      timestamp: Date.now(),
    });

    return { success: true, code: randomCode };
  },
});
