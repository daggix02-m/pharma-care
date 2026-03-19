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
