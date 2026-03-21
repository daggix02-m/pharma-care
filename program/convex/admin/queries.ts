// @ts-ignore
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // We can verify if the user is an admin before proceeding 
    // This is optional if your frontend handles routing, but good for backend security
    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (user?.role !== "admin") throw new Error("Unauthorized: Admin only");

    const pharmacies = await ctx.db.query("pharmacies").collect();
    const branches = await ctx.db.query("branches").collect();
    const users = await ctx.db.query("users").collect();

    return {
      totalPharmacies: pharmacies.length,
      totalBranches: branches.length,
      totalUsers: users.length,
      // Sales require sum logic which we can extract later
      totalSales: 0 
    };
  },
});

export const getPharmacies = query({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db.query("pharmacies").collect();
  },
});

export const getBranches = query({
  args: {},
  handler: async (ctx: any) => {
    const branches = await ctx.db.query("branches").collect();
    // Resolve pharmacy names for the UI
    return Promise.all(
        branches.map(async (branch: any) => {
            const pharmacy = await ctx.db.get(branch.pharmacyId);
            return {
                ...branch,
                pharmacyName: pharmacy?.name || "Unknown Pharmacy"
            }
        })
    )
  },
});

export const getPendingBranches = query({
  args: {},
  handler: async (ctx: any) => {
     const branches = await ctx.db
        .query("branches")
        .filter((q: any) => q.eq(q.field("status"), "pending"))
        .collect();
        
      return Promise.all(
        branches.map(async (branch: any) => {
            const pharmacy = await ctx.db.get(branch.pharmacyId);
            const manager = await ctx.db.get(branch.managerId);
            return {
                ...branch,
                pharmacyName: pharmacy?.name,
                managerName: manager?.full_name,
                managerEmail: manager?.email,
                staffCount: pharmacy?.staffCount,
                subscriptionTier: pharmacy?.subscriptionTier
            }
        })
    );
  },
});

export const getAllManagers = query({
    args: {},
    handler: async (ctx: any) => {
        return await ctx.db
            .query("users")
            .filter((q: any) => q.eq(q.field("role"), "manager"))
            .collect();
    }
});

export const getPendingManagers = query({
    args: {},
    handler: async (ctx: any) => {
        return await ctx.db
            .query("users")
            .filter((q: any) => 
                q.and(
                    q.eq(q.field("role"), "manager"),
                    q.eq(q.field("status"), "pending")
                )
            )
            .collect();
    }
});

export const getAuditLogs = query({
    args: {},
    handler: async (ctx: any) => {
        const logs = await ctx.db.query("audit_logs").order("desc").collect();
        return Promise.all(
            logs.map(async (log: any) => {
                const user = await ctx.db.get(log.userId);
                return {
                    ...log,
                    user_name: user?.full_name || "System",
                    user_email: user?.email || "system@pharmacare.com",
                };
            })
        );
    },
});

export const getDashboardBranches = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (user?.role !== "admin") throw new Error("Unauthorized: Admin only");

    const branches = await ctx.db.query("branches").collect();

    return {
      totalBranches: branches.length,
      activeBranches: branches.filter((b: any) => b.status === "active").length,
      pendingBranches: branches.filter((b: any) => b.status === "pending").length,
      deactivatedBranches: branches.filter((b: any) => b.status === "deactivated").length,
      recentBranches: branches.slice(-5).reverse(),
    };
  },
});

export const getDashboardUsers = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (user?.role !== "admin") throw new Error("Unauthorized: Admin only");

    const users = await ctx.db.query("users").collect();

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.status === "active").length,
      pendingUsers: users.filter((u: any) => u.status === "pending").length,
      deactivatedUsers: users.filter((u: any) => u.status === "deactivated").length,
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
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (user?.role !== "admin") throw new Error("Unauthorized: Admin only");

    const sales = await ctx.db.query("sales").collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const salesToday = sales.filter((s: any) => s._creationTime >= today.getTime());
    const salesYesterday = sales.filter((s: any) =>
      s._creationTime >= yesterday.getTime() && s._creationTime < today.getTime()
    );
    const salesThisMonth = sales.filter((s: any) => s._creationTime >= thisMonth.getTime());

    const revenueToday = salesToday.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const revenueYesterday = salesYesterday.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const revenueThisMonth = salesThisMonth.reduce((sum: number, s: any) => sum + s.totalAmount, 0);

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0),
      salesToday: salesToday.length,
      revenueToday,
      salesYesterday: salesYesterday.length,
      revenueYesterday,
      salesThisMonth: salesThisMonth.length,
      revenueThisMonth,
      averageOrderValue: sales.length > 0 ? sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0) / sales.length : 0,
    };
  },
});

export const getBranchById = query({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (user?.role !== "admin") throw new Error("Unauthorized: Admin only");

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
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (user?.role !== "admin") throw new Error("Unauthorized: Admin only");

    const managers = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("role"), "manager"))
      .collect();

    const activatedManagers = managers.filter((m: any) => m.status === "active");

    return await Promise.all(activatedManagers.map(async (manager: any) => {
      const branch = manager.branchId ? await ctx.db.get(manager.branchId) : null;
      const pharmacy = manager.pharmacyId ? await ctx.db.get(manager.pharmacyId) : null;

      return {
        ...manager,
        branchName: branch?.name || "Unassigned",
        pharmacyName: pharmacy?.name || "Unknown",
      };
    }));
  },
});

export const getManagersByBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (user?.role !== "admin") throw new Error("Unauthorized: Admin only");

    const branch = await ctx.db.get(args.branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }

    const managers = await ctx.db
      .query("users")
      .filter((q: any) => q.and(
        q.eq(q.field("role"), "manager"),
        q.eq(q.field("branchId"), args.branchId),
      ))
      .collect();

    return managers;
  },
});
