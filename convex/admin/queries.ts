// @ts-ignore
import { query } from "../_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "../lib/auth";
import { api } from "../_generated/api";

const PENDING_PHARMACY_STATUSES = new Set(["pending", "pending_approval"]);
const APPROVED_PHARMACY_STATUSES = new Set(["active", "approved"]);

const normalizeStatus = (status: unknown): string =>
  typeof status === "string" ? status.trim().toLowerCase() : "";

const normalizeString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => normalizeString(entry)).filter(Boolean);
};

const toNumberOr = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildSignupSubmission = (pharmacy: any, owner: any) => {
  const snapshot = pharmacy?.signupSnapshot || {};
  const step1Pharmacy = snapshot?.step1Pharmacy || {};
  const step1Operations = snapshot?.step1Operations || {};
  const step2Subscription = snapshot?.step2Subscription || {};
  const step3Owner = snapshot?.step3Owner || {};
  const step4Review = snapshot?.step4Review || {};

  const snapshotPrimaryLocation = normalizeString(
    step1Pharmacy.primaryLocation,
  );
  const persistedPrimaryLocation = normalizeString(pharmacy?.signupLocation);

  const snapshotBranchLocations = normalizeStringArray(
    step1Operations.branchLocations,
  );
  const persistedBranchLocations = normalizeStringArray(
    pharmacy?.plannedBranchLocations,
  );

  const branchLocations = snapshotBranchLocations.length
    ? snapshotBranchLocations
    : persistedBranchLocations;

  const plannedBranches = toNumberOr(
    step1Operations.totalBranches ?? pharmacy?.plannedBranches,
    0,
  );

  const primaryLocation =
    snapshotPrimaryLocation ||
    persistedPrimaryLocation ||
    branchLocations[0] ||
    "Not provided";

  return {
    pharmacyName:
      normalizeString(step1Pharmacy.pharmacyName) ||
      normalizeString(pharmacy?.name) ||
      "Not provided",
    pharmacyEmail:
      normalizeString(step1Pharmacy.pharmacyEmail) ||
      normalizeString(pharmacy?.pharmacyEmail) ||
      "Not provided",
    licenseCode:
      normalizeString(step1Pharmacy.licenseCode) ||
      normalizeString(pharmacy?.licenseCode) ||
      "Not provided",
    primaryLocation,
    branchLocations,
    plannedBranches,
    plannedStaffTotal: toNumberOr(
      step1Operations.totalStaff ?? pharmacy?.plannedStaffTotal,
      0,
    ),
    staffBreakdown: {
      pharmacists: toNumberOr(
        step1Operations.pharmacists ??
          pharmacy?.plannedStaffBreakdown?.pharmacists,
        0,
      ),
      managers: toNumberOr(
        step1Operations.managers ?? pharmacy?.plannedStaffBreakdown?.managers,
        0,
      ),
      cashiers: toNumberOr(
        step1Operations.cashiers ?? pharmacy?.plannedStaffBreakdown?.cashiers,
        0,
      ),
    },
    selectedTier:
      normalizeString(step2Subscription.selectedTier) ||
      normalizeString(pharmacy?.subscriptionTier) ||
      "",
    recommendedTier:
      normalizeString(step2Subscription.recommendedTier) ||
      normalizeString(pharmacy?.recommendedSubscriptionTier) ||
      "",
    ownerName:
      normalizeString(step3Owner.fullName) ||
      normalizeString(owner?.full_name) ||
      "Not provided",
    ownerEmail:
      normalizeString(step3Owner.email) ||
      normalizeString(owner?.email) ||
      "Not provided",
    ownerPhone:
      normalizeString(step3Owner.phone) ||
      normalizeString(owner?.phone) ||
      "Not provided",
    termsAccepted:
      typeof step4Review.termsAccepted === "boolean"
        ? step4Review.termsAccepted
        : undefined,
    status: normalizeStatus(pharmacy?.status) || "unknown",
    submittedAt: pharmacy?._creationTime,
  };
};

const isPendingApproval = (args: {
  pharmacyStatus?: unknown;
  ownerStatus?: unknown;
  paymentStatus?: unknown;
}): boolean => {
  const pharmacyStatus = normalizeStatus(args.pharmacyStatus);
  const ownerStatus = normalizeStatus(args.ownerStatus);
  const paymentStatus = normalizeStatus(args.paymentStatus);

  return (
    PENDING_PHARMACY_STATUSES.has(pharmacyStatus) ||
    pharmacyStatus.includes("pending") ||
    ownerStatus === "pending" ||
    paymentStatus === "pending_approval"
  );
};

export const getDashboardStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const pharmacies = await ctx.db.query("pharmacies").take(1000);
    const branches = await ctx.db.query("branches").take(1000);
    const users = await ctx.db.query("users").take(1000);

    return {
      totalPharmacies: pharmacies.length,
      totalBranches: branches.length,
      totalUsers: users.length,
      // Sales require sum logic which we can extract later
      totalSales: 0,
    };
  },
});

export const getPharmacies = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const pharmacies = await ctx.db.query("pharmacies").take(1000);

    return Promise.all(
      pharmacies.map(async (pharmacy: any) => {
        const owner = pharmacy.ownerId
          ? await ctx.db.get(pharmacy.ownerId)
          : null;

        return {
          ...pharmacy,
          ownerName: owner?.full_name || "Unknown",
          ownerEmail: owner?.email || "",
          ownerPhone: owner?.phone || "",
          selectedTier: pharmacy.subscriptionTier,
          recommendedTier: pharmacy.recommendedSubscriptionTier,
          submittedAt: pharmacy._creationTime,
          plannedBranches: pharmacy.plannedBranches,
          plannedBranchLocations: pharmacy.plannedBranchLocations,
          plannedStaffTotal: pharmacy.plannedStaffTotal,
          plannedStaffBreakdown: pharmacy.plannedStaffBreakdown,
        };
      }),
    );
  },
});

export const getBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];
    const branches = await ctx.db.query("branches").take(args.limit || 100);
    const pharmacyIds = [...new Set(branches.map((b: any) => b.pharmacyId))];
    const pharmacies = await Promise.all(
      pharmacyIds.map((id: any) => ctx.db.get(id)),
    );
    const pharmacyMap = new Map(
      pharmacies.filter(Boolean).map((p: any) => [p._id, p]),
    );

    return branches.map((branch: any) => ({
      ...branch,
      pharmacyName:
        pharmacyMap.get(branch.pharmacyId)?.name || "Unknown Pharmacy",
    }));
  },
});

export const getPendingBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];
    const branches = await ctx.db
      .query("branches")
      .filter((q: any) => q.eq(q.field("status"), "pending"))
      .take(100);

    // OPTIMIZATION: Batch fetch all pharmacies and managers in parallel
    // Reduces queries from 1+2N to 3 total (86% reduction for 100 branches)
    const pharmacyIds = [
      ...new Set(branches.map((b: any) => b.pharmacyId).filter(Boolean)),
    ];
    const managerIds = [
      ...new Set(branches.map((b: any) => b.managerId).filter(Boolean)),
    ];

    const [pharmacies, managers] = await Promise.all([
      Promise.all(pharmacyIds.map((id: any) => ctx.db.get(id))),
      Promise.all(managerIds.map((id: any) => ctx.db.get(id))),
    ]);

    const pharmacyMap = new Map(
      pharmacies.filter(Boolean).map((p: any) => [p._id, p]),
    );
    const managerMap = new Map(
      managers.filter(Boolean).map((m: any) => [m._id, m]),
    );

    return branches.map((branch: any) => {
      const pharmacy = pharmacyMap.get(branch.pharmacyId);
      const manager = managerMap.get(branch.managerId);
      return {
        ...branch,
        pharmacyName: pharmacy?.name,
        managerName: manager?.full_name,
        managerEmail: manager?.email,
        staffCount: pharmacy?.staffCount,
        subscriptionTier: pharmacy?.subscriptionTier,
      };
    });
  },
});

export const getPendingPharmacyApplications = query({
  args: {
    sessionToken: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const pharmacies = await ctx.db
      .query("pharmacies")
      .order("desc")
      .take(2000);

    const getPreviousRejection = async (ownerEmail?: string) => {
      const normalizedEmail = String(ownerEmail || "")
        .trim()
        .toLowerCase();
      if (!normalizedEmail) return null;

      const rows = await ctx.db
        .query("rejected_owner_applications")
        .withIndex("by_owner_email_and_rejected_at", (q: any) =>
          q.eq("ownerEmail", normalizedEmail),
        )
        .order("desc")
        .take(1);

      const latest = rows[0];
      if (!latest || latest.retentionUntil < Date.now()) {
        return null;
      }

      return {
        rejectionReason: latest.rejectionReason,
        rejectedAt: latest.rejectedAt,
        pharmacyName: latest.pharmacyName,
      };
    };

    const rows = await Promise.all(
      pharmacies.map(async (pharmacy: any) => {
        const owner = pharmacy.ownerId
          ? await ctx.db.get(pharmacy.ownerId)
          : null;
        const previousRejection = await getPreviousRejection(owner?.email);
        const pharmacyStatus = normalizeStatus(pharmacy.status);
        const ownerStatus = normalizeStatus(owner?.status);
        return {
          pharmacyId: pharmacy._id,
          pharmacyName: pharmacy.name,
          pharmacyEmail: pharmacy.pharmacyEmail,
          licenseCode: pharmacy.licenseCode,
          primaryLocation: pharmacy.signupLocation || "",
          signupLocation: pharmacy.signupLocation,
          submittedAt: pharmacy._creationTime,
          status: pharmacy.status,
          selectedTier: pharmacy.subscriptionTier,
          recommendedTier: pharmacy.recommendedSubscriptionTier,
          paymentStatus: pharmacy.paymentStatus,
          plannedBranches: pharmacy.plannedBranches,
          plannedBranchLocations: pharmacy.plannedBranchLocations,
          plannedStaffTotal: pharmacy.plannedStaffTotal,
          plannedStaffBreakdown: pharmacy.plannedStaffBreakdown,
          signupSnapshot: pharmacy.signupSnapshot,
          ownerId: owner?._id,
          ownerName: owner?.full_name || "Unknown",
          ownerEmail: owner?.email || "",
          ownerPhone: owner?.phone || "",
          ownerStatus,
          previousRejection,
          isPendingApproval: isPendingApproval({
            pharmacyStatus,
            ownerStatus,
            paymentStatus: pharmacy.paymentStatus,
          }),
        };
      }),
    );

    const pendingOwners = await ctx.db
      .query("users")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("role"), "owner"),
          q.eq(q.field("status"), "pending"),
        ),
      )
      .take(2000);

    const pharmacyIdSet = new Set(
      rows
        .map((row: any) => row.pharmacyId)
        .filter((pharmacyId: any) => Boolean(pharmacyId)),
    );

    const ownerRowsFromLinkedPharmacy: any[] = [];
    const ownerRowsWithoutPharmacy = pendingOwners
      .filter((owner: any) => {
        if (!owner.pharmacyId) return true;
        return !pharmacyIdSet.has(owner.pharmacyId);
      })
      .map((owner: any) => ({
        owner,
      }));

    for (const item of ownerRowsWithoutPharmacy) {
      const owner = item.owner;
      const previousRejection = await getPreviousRejection(owner?.email);
      if (owner.pharmacyId) {
        const pharmacy = await ctx.db.get(owner.pharmacyId);
        if (pharmacy) {
          ownerRowsFromLinkedPharmacy.push({
            pharmacyId: pharmacy._id,
            pharmacyName: pharmacy.name,
            pharmacyEmail: pharmacy.pharmacyEmail,
            licenseCode: pharmacy.licenseCode,
            primaryLocation: pharmacy.signupLocation || "",
            signupLocation: pharmacy.signupLocation,
            submittedAt: pharmacy._creationTime,
            status: pharmacy.status,
            selectedTier: pharmacy.subscriptionTier,
            recommendedTier: pharmacy.recommendedSubscriptionTier,
            paymentStatus: pharmacy.paymentStatus,
            plannedBranches: pharmacy.plannedBranches,
            plannedBranchLocations: pharmacy.plannedBranchLocations,
            plannedStaffTotal: pharmacy.plannedStaffTotal,
            plannedStaffBreakdown: pharmacy.plannedStaffBreakdown,
            signupSnapshot: pharmacy.signupSnapshot,
            ownerId: owner._id,
            ownerName: owner?.full_name || "Unknown",
            ownerEmail: owner?.email || "",
            ownerPhone: owner?.phone || "",
            ownerStatus: normalizeStatus(owner?.status),
            previousRejection,
            isPendingApproval: isPendingApproval({
              pharmacyStatus: pharmacy.status,
              ownerStatus: owner.status,
              paymentStatus: pharmacy.paymentStatus,
            }),
          });
          continue;
        }
      }

      ownerRowsFromLinkedPharmacy.push({
        pharmacyId: null,
        pharmacyName: owner.full_name
          ? `${owner.full_name}'s Pharmacy Request`
          : "Pending Owner Request",
        pharmacyEmail: "",
        licenseCode: "",
        primaryLocation: "",
        signupLocation: "",
        submittedAt: owner._creationTime,
        status: "pending",
        selectedTier: "",
        recommendedTier: "",
        paymentStatus: "pending_approval",
        plannedBranches: undefined,
        plannedBranchLocations: [],
        plannedStaffTotal: undefined,
        plannedStaffBreakdown: undefined,
        signupSnapshot: undefined,
        ownerId: owner._id,
        ownerName: owner?.full_name || "Unknown",
        ownerEmail: owner?.email || "",
        ownerPhone: owner?.phone || "",
        ownerStatus: normalizeStatus(owner?.status),
        previousRejection,
        isPendingApproval: true,
      });
    }

    const pendingRows = [...rows, ...ownerRowsFromLinkedPharmacy].filter(
      (row: any) => row.isPendingApproval,
    );

    const search = (args.search || "").trim().toLowerCase();
    if (!search) {
      return pendingRows;
    }

    return pendingRows.filter((row: any) => {
      return (
        row.pharmacyName?.toLowerCase().includes(search) ||
        row.pharmacyEmail?.toLowerCase().includes(search) ||
        row.licenseCode?.toLowerCase().includes(search) ||
        row.signupLocation?.toLowerCase().includes(search) ||
        row.ownerPhone?.toLowerCase().includes(search) ||
        row.ownerName?.toLowerCase().includes(search) ||
        row.ownerEmail?.toLowerCase().includes(search)
      );
    });
  },
});

export const getAllManagers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];
    return await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("role"), "manager"))
      .take(1000);
  },
});

export const getPendingManagers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];
    return await ctx.db
      .query("users")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("role"), "manager"),
          q.eq(q.field("status"), "pending"),
        ),
      )
      .take(100);
  },
});

export const getAuditLogs = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];
    const logs = await ctx.db.query("audit_logs").order("desc").take(50);
    return Promise.all(
      logs.map(async (log: any) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user_name: user?.full_name || "System",
          user_email: user?.email || "system@pharmacare.com",
        };
      }),
    );
  },
});

export const getDashboardBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const branches = await ctx.db.query("branches").take(100);

    return {
      totalBranches: branches.length,
      activeBranches: branches.filter((b: any) => b.status === "active").length,
      pendingBranches: branches.filter((b: any) => b.status === "pending")
        .length,
      deactivatedBranches: branches.filter(
        (b: any) => b.status === "deactivated",
      ).length,
      recentBranches: branches.slice(-5).reverse(),
    };
  },
});

export const getDashboardUsers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const users = await ctx.db.query("users").take(100);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.status === "active").length,
      pendingUsers: users.filter((u: any) => u.status === "pending").length,
      deactivatedUsers: users.filter((u: any) => u.status === "deactivated")
        .length,
      usersByRole: {
        admin: users.filter((u: any) => u.role === "admin").length,
        manager: users.filter((u: any) => u.role === "manager").length,
        pharmacist: users.filter((u: any) => u.role === "pharmacist").length,
        cashier: users.filter((u: any) => u.role === "cashier").length,
      },
    };
  },
});

export const getDashboardSales = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const sales = await ctx.db.query("sales").take(100);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const salesToday = sales.filter(
      (s: any) => s._creationTime >= today.getTime(),
    );
    const salesYesterday = sales.filter(
      (s: any) =>
        s._creationTime >= yesterday.getTime() &&
        s._creationTime < today.getTime(),
    );
    const salesThisMonth = sales.filter(
      (s: any) => s._creationTime >= thisMonth.getTime(),
    );

    const revenueToday = salesToday.reduce(
      (sum: number, s: any) => sum + s.totalAmount,
      0,
    );
    const revenueYesterday = salesYesterday.reduce(
      (sum: number, s: any) => sum + s.totalAmount,
      0,
    );
    const revenueThisMonth = salesThisMonth.reduce(
      (sum: number, s: any) => sum + s.totalAmount,
      0,
    );

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce(
        (sum: number, s: any) => sum + s.totalAmount,
        0,
      ),
      salesToday: salesToday.length,
      revenueToday,
      salesYesterday: salesYesterday.length,
      revenueYesterday,
      salesThisMonth: salesThisMonth.length,
      revenueThisMonth,
      averageOrderValue:
        sales.length > 0
          ? sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0) /
            sales.length
          : 0,
    };
  },
});

export const getBranchById = query({
  args: {
    id: v.id("branches"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const branch = await ctx.db.get(args.id);
    if (!branch) {
      throw new Error("Branch not found");
    }

    const pharmacy = await ctx.db.get(branch.pharmacyId);
    const manager = await ctx.db.get(branch.managerId);

    return {
      ...branch,
      pharmacyName: pharmacy?.name || "Unknown",
      managerName: manager?.full_name || "Unassigned",
      managerEmail: manager?.email || "",
    };
  },
});

export const getActivatedManagers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const managers = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("role"), "manager"))
      .take(100);

    const activatedManagers = managers.filter(
      (m: any) => m.status === "active",
    );

    return await Promise.all(
      activatedManagers.map(async (manager: any) => {
        const branch = manager.branchId
          ? await ctx.db.get(manager.branchId)
          : null;
        const pharmacy = manager.pharmacyId
          ? await ctx.db.get(manager.pharmacyId)
          : null;

        return {
          ...manager,
          branchName: branch?.name || "Unassigned",
          pharmacyName: pharmacy?.name || "Unknown",
        };
      }),
    );
  },
});

export const getManagersByBranch = query({
  args: {
    branchId: v.id("branches"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const branch = await ctx.db.get(args.branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }

    const managers = await ctx.db
      .query("users")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("role"), "manager"),
          q.eq(q.field("branchId"), args.branchId),
        ),
      )
      .take(100);

    return managers;
  },
});

export const getSubscriptionPlans = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const plans = await ctx.db
      .query("subscription_plans")
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .take(100);

    return plans.map((plan: any) => ({
      ...plan,
      currency: "ETB",
    }));
  },
});

export const getAllSubscriptionPlans = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const plans = await ctx.db.query("subscription_plans").take(200);
    return plans.map((plan: any) => ({
      ...plan,
      currency: "ETB",
    }));
  },
});

export const getPlanUsageCounts = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const plans = await ctx.db.query("subscription_plans").take(200);
    const pharmacies = await ctx.db.query("pharmacies").take(2000);

    const counts = new Map<string, number>();
    for (const pharmacy of pharmacies) {
      const tier = pharmacy.subscriptionTier;
      if (!tier) continue;
      counts.set(tier, (counts.get(tier) || 0) + 1);
    }

    return plans.map((plan: any) => ({
      planId: plan._id,
      code: plan.code,
      pharmacyCount: counts.get(plan.code) || 0,
    }));
  },
});

export const getSubscriptionPlanTemplates = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const templates = await ctx.db
      .query("subscription_plan_templates")
      .take(200);
    return templates.map((template: any) => ({
      ...template,
      currency: "ETB",
    }));
  },
});

export const getSubscriptionHistory = query({
  args: {
    pharmacyId: v.id("pharmacies"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const history = await ctx.db
      .query("subscription_history")
      .withIndex("by_pharmacy", (q: any) => q.eq("pharmacyId", args.pharmacyId))
      .order("desc")
      .take(100);

    return await Promise.all(
      history.map(async (record: any) => {
        const changedBy = await ctx.db.get(record.changedBy);
        const pharmacy = await ctx.db.get(record.pharmacyId);
        return {
          ...record,
          changedByName: changedBy?.full_name || "System",
          pharmacyName: pharmacy?.name || "Unknown",
        };
      }),
    );
  },
});

export const getSubscriptionAnalytics = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const pharmacies = await ctx.db.query("pharmacies").take(1000);
    const subscriptionHistory = await ctx.db
      .query("subscription_history")
      .take(1000);
    const subscriptionPlans = await ctx.db
      .query("subscription_plans")
      .take(100);

    const totalPharmacies = pharmacies.length;
    const activePharmacies = pharmacies.filter(
      (p: any) => p.status === "active",
    ).length;

    const subscriptionDistribution = {
      basic: pharmacies.filter((p: any) => p.subscriptionTier === "basic")
        .length,
      premium: pharmacies.filter((p: any) => p.subscriptionTier === "premium")
        .length,
      enterprise: pharmacies.filter(
        (p: any) => p.subscriptionTier === "enterprise",
      ).length,
    };

    const monthlyRevenue = pharmacies.reduce((sum: number, p: any) => {
      const plan = subscriptionPlans.find(
        (pl: any) => pl.code === p.subscriptionTier,
      );
      return sum + (plan?.price || 0);
    }, 0);

    const recentChanges = subscriptionHistory
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .slice(0, 10);

    const changeDistribution = {
      upgrade: subscriptionHistory.filter(
        (h: any) => h.changeType === "upgrade",
      ).length,
      downgrade: subscriptionHistory.filter(
        (h: any) => h.changeType === "downgrade",
      ).length,
      initial: subscriptionHistory.filter(
        (h: any) => h.changeType === "initial",
      ).length,
      renewal: subscriptionHistory.filter(
        (h: any) => h.changeType === "renewal",
      ).length,
      cancellation: subscriptionHistory.filter(
        (h: any) => h.changeType === "cancellation",
      ).length,
    };

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const changesThisMonth = subscriptionHistory.filter(
      (h: any) => h.createdAt >= thisMonth.getTime(),
    );

    return {
      totalPharmacies,
      activePharmacies,
      subscriptionDistribution,
      monthlyRevenue,
      currency: "ETB",
      recentChanges: recentChanges.length,
      changeDistribution,
      changesThisMonth: changesThisMonth.length,
      plans: subscriptionPlans.filter((p: any) => p.isActive).length,
    };
  },
});

export const getPharmacySubscriptionDetails = query({
  args: {
    pharmacyId: v.id("pharmacies"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const subscriptionPlan = await ctx.db
      .query("subscription_plans")
      .filter((q: any) => q.eq(q.field("code"), pharmacy.subscriptionTier))
      .first();

    const branches = await ctx.db
      .query("branches")
      .filter((q: any) => q.eq(q.field("pharmacyId"), args.pharmacyId))
      .take(100);

    const users = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("pharmacyId"), args.pharmacyId))
      .take(100);

    return {
      pharmacy: {
        ...pharmacy,
        planName: subscriptionPlan?.name || "Unknown Plan",
        planPrice: subscriptionPlan?.price || 0,
        planFeatures: subscriptionPlan?.features || [],
      },
      usage: {
        branchesUsed: branches.length,
        branchesAllowed: subscriptionPlan?.maxBranches || 0,
        usersUsed: users.length,
        usersAllowed: subscriptionPlan?.maxUsers || 0,
      },
      isOverLimit: {
        branches: branches.length > (subscriptionPlan?.maxBranches || 0),
        users: users.length > (subscriptionPlan?.maxUsers || 0),
      },
    };
  },
});

// v4.0: Get pharmacy detail with all sections
export const getPharmacyDetail = query({
  args: {
    pharmacyId: v.id("pharmacies"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) throw new Error("Pharmacy not found");

    // Get owner details
    const owner = await ctx.db.get(pharmacy.ownerId);

    // Get all managers
    const managers = await ctx.db
      .query("users")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("pharmacyId"), args.pharmacyId),
          q.eq(q.field("role"), "manager"),
        ),
      )
      .take(100);

    // Get all staff
    const staff = await ctx.db
      .query("users")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("pharmacyId"), args.pharmacyId),
          q.neq(q.field("role"), "manager"),
        ),
      )
      .take(100);

    // Get branches
    const branches = await ctx.db
      .query("branches")
      .filter((q: any) => q.eq(q.field("pharmacyId"), args.pharmacyId))
      .take(100);

    // Get recent audit logs
    const auditLogs = await ctx.db
      .query("audit_logs")
      .filter((q: any) => q.eq(q.field("entityId"), args.pharmacyId.toString()))
      .order("desc")
      .take(50);

    const diagnosticSessions = await ctx.db
      .query("diagnostic_sessions")
      .filter((q: any) => q.eq(q.field("targetPharmacyId"), args.pharmacyId))
      .order("desc")
      .take(100);

    const subscriptionHistory = await ctx.db
      .query("subscription_history")
      .withIndex("by_pharmacy", (q: any) => q.eq("pharmacyId", args.pharmacyId))
      .order("desc")
      .take(100);

    const subscriptionPlans = await ctx.db
      .query("subscription_plans")
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .take(100);

    return {
      pharmacy,
      owner,
      signupSubmission: buildSignupSubmission(pharmacy, owner),
      managers,
      staff,
      branches,
      auditLogs,
      diagnosticSessions,
      subscriptionHistory,
      subscriptionPlans,
    };
  },
});

// v4.0: Get flagged accounts
export const getFlaggedAccounts = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const users = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("adminFlagged"), true))
      .take(100);

    return Promise.all(
      users.map(async (user: any) => {
        const pharmacy = user.pharmacyId
          ? ((await ctx.db.get(user.pharmacyId)) as any)
          : null;
        return {
          ...user,
          pharmacyName: pharmacy?.name,
        };
      }),
    );
  },
});

// v4.0: Get diagnostic sessions for a pharmacy
export const getDiagnosticSessions = query({
  args: {
    pharmacyId: v.id("pharmacies"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return [];

    const sessions = await ctx.db
      .query("diagnostic_sessions")
      .filter((q: any) => q.eq(q.field("targetPharmacyId"), args.pharmacyId))
      .order("desc")
      .take(100);

    return Promise.all(
      sessions.map(async (session: any) => {
        const admin = (await ctx.db.get(session.adminId)) as any;
        const targetUser = (await ctx.db.get(session.targetUserId)) as any;
        return {
          ...session,
          adminName: admin?.full_name || "Unknown",
          targetUserName: targetUser?.full_name || "Unknown",
        };
      }),
    );
  },
});

// v4.0: Get pending appeals for admin review
export const getPendingAppeals = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin)
      return {
        managerFlagAppeals: [],
        adminActionAppeals: [],
        totalPending: 0,
      };

    const managerFlagAppeals = await ctx.db
      .query("manager_flags")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("status"), "flagged"),
          q.neq(q.field("ownerResponse"), undefined),
        ),
      )
      .take(100);

    const managerFlagAppealsWithDetails = await Promise.all(
      managerFlagAppeals.map(async (flag: any) => {
        const manager = (await ctx.db.get(flag.managerId)) as any;
        const flaggedBy = (await ctx.db.get(flag.flaggedBy)) as any;
        const pharmacy = manager?.pharmacyId
          ? ((await ctx.db.get(manager.pharmacyId)) as any)
          : null;
        const owner = pharmacy?.ownerId
          ? ((await ctx.db.get(pharmacy.ownerId)) as any)
          : null;

        return {
          id: flag._id,
          type: "manager_flag",
          managerId: flag.managerId,
          managerName: manager?.full_name || "Unknown",
          managerEmail: manager?.email || "",
          pharmacyId: pharmacy?._id,
          pharmacyName: pharmacy?.name || "Unknown",
          ownerId: owner?._id,
          ownerName: owner?.full_name || "Unknown",
          flaggedBy: flaggedBy?.full_name || "System",
          flaggedAt: flag.flaggedAt,
          flagReason: flag.flagReason,
          ownerResponse: flag.ownerResponse,
          ownerRespondedAt: flag.ownerRespondedAt,
          status: flag.status,
        };
      }),
    );

    const adminActions = await ctx.db
      .query("admin_actions")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("actionStatus"), "active"),
          q.eq(q.field("ownerNotified"), true),
        ),
      )
      .take(100);

    const adminActionAppeals = await Promise.all(
      adminActions.map(async (action: any) => {
        const targetUser = (await ctx.db.get(action.targetUserId)) as any;
        const performedBy = (await ctx.db.get(action.performedBy)) as any;
        const pharmacy = action.targetPharmacyId
          ? ((await ctx.db.get(action.targetPharmacyId)) as any)
          : null;
        const owner = pharmacy?.ownerId
          ? ((await ctx.db.get(pharmacy.ownerId)) as any)
          : null;

        return {
          id: action._id,
          type: "admin_action",
          targetUserId: action.targetUserId,
          targetUserName: targetUser?.full_name || "Unknown",
          targetUserEmail: targetUser?.email || "",
          pharmacyId: pharmacy?._id,
          pharmacyName: pharmacy?.name || "Unknown",
          ownerId: owner?._id,
          ownerName: owner?.full_name || "Unknown",
          performedBy: performedBy?.full_name || "System",
          actionType: action.actionType,
          reason: action.reason,
          timestamp: action.timestamp,
          ownerNotifiedAt: action.ownerNotifiedAt,
          actionStatus: action.actionStatus,
        };
      }),
    );

    return {
      managerFlagAppeals: managerFlagAppealsWithDetails,
      adminActionAppeals,
      totalPending:
        managerFlagAppealsWithDetails.length + adminActionAppeals.length,
    };
  },
});

// OPTIMIZATION: Combined pending counts for TopBar
// Reduces queries from 2 to 1 and eliminates N+1 pattern
export const getPendingCounts = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return { managers: 0, branches: 0 };

    // Get counts only - much more efficient than fetching all records
    const [managers, branches] = await Promise.all([
      ctx.db
        .query("users")
        .filter((q: any) => q.eq(q.field("role"), "manager"))
        .filter((q: any) => q.eq(q.field("status"), "pending"))
        .take(100),
      ctx.db
        .query("branches")
        .filter((q: any) => q.eq(q.field("status"), "pending"))
        .take(100),
    ]);

    return {
      managers: managers.length,
      branches: branches.length,
    };
  },
});

export const getPendingApprovalsCount = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return { pendingApprovals: 0 };

    const pendingRows: any[] = await ctx.runQuery(
      api.admin.queries.getPendingPharmacyApplications,
      {
        sessionToken: args.sessionToken,
      },
    );

    return { pendingApprovals: pendingRows.length };
  },
});

export const getAdminOverview = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const admin = await checkAdmin(ctx, args.sessionToken);
    if (!admin) return null;

    const [
      pharmacies,
      branches,
      managers,
      subscriptionPlans,
      flaggedAccounts,
      managerFlagAppeals,
      adminActionAppeals,
      subscriptions,
    ] = await Promise.all([
      ctx.db.query("pharmacies").take(1000),
      ctx.db.query("branches").take(1000),
      ctx.db
        .query("users")
        .filter((q: any) => q.eq(q.field("role"), "manager"))
        .take(1000),
      ctx.db
        .query("subscription_plans")
        .filter((q: any) => q.eq(q.field("isActive"), true))
        .take(100),
      ctx.db
        .query("users")
        .filter((q: any) => q.eq(q.field("adminFlagged"), true))
        .take(100),
      ctx.db
        .query("manager_flags")
        .filter((q: any) => q.eq(q.field("status"), "flagged"))
        .take(100),
      ctx.db
        .query("admin_actions")
        .filter((q: any) => q.eq(q.field("actionStatus"), "active"))
        .take(100),
      ctx.db.query("subscription_history").take(1000),
    ]);

    const activeManagers = managers.filter(
      (m: any) => m.status === "active",
    ).length;

    const activeSubscriptions = pharmacies.filter(
      (pharmacy: any) =>
        pharmacy.status === "active" &&
        typeof pharmacy.subscriptionTier === "string" &&
        pharmacy.subscriptionTier.trim().length > 0,
    ).length;

    const monthlyRevenue = subscriptions
      .filter((s: any) => {
        const createdAt = new Date(s.createdAt || 0);
        const now = new Date();
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum: number, s: any) => sum + (s.price || 0), 0);

    const pendingAppeals = {
      managerFlagAppeals,
      adminActionAppeals,
    };

    return {
      stats: {
        totalPharmacies: pharmacies.length,
        activePharmacies: pharmacies.filter((p: any) =>
          APPROVED_PHARMACY_STATUSES.has(normalizeStatus(p.status)),
        ).length,
        pendingPharmacies: pharmacies.filter((p: any) =>
          PENDING_PHARMACY_STATUSES.has(normalizeStatus(p.status)),
        ).length,
        totalBranches: branches.length,
        activeBranches: branches.filter((b: any) => b.status === "active")
          .length,
        pendingBranches: branches.filter((b: any) => b.status === "pending")
          .length,
        totalManagers: managers.length,
        activeManagers,
        monthlyRevenue,
        activeSubscriptions,
        totalPlans: subscriptionPlans.length,
        flaggedCount: flaggedAccounts.length,
        appealsCount: managerFlagAppeals.length + adminActionAppeals.length,
      },
      recentPharmacies: pharmacies
        .sort((a: any, b: any) => b._creationTime - a._creationTime)
        .slice(0, 10),
      pharmacies,
      branches,
      managers,
      subscriptionPlans,
      flaggedAccounts,
      pendingAppeals,
    };
  },
});
