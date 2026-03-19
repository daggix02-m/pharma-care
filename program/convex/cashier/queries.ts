import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!user || user.role !== "cashier") throw new Error("Unauthorized: Cashier only");

    const sales = await ctx.db
       .query("sales")
       .filter(q => q.eq(q.field("cashierId"), user._id))
       .collect();

    // Summing today's sales could be done by filtering timestamps (Convex has _creationTime)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySales = sales.filter(s => s._creationTime > today.getTime());

    return {
      totalDailySales: dailySales.length,
      revenueToday: dailySales.reduce((acc, s) => acc + s.totalAmount, 0),
    };
  },
});

export const getProducts = query({
    args: {},
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const user = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!user || user.role !== "cashier" || !user.branchId) {
          throw new Error("Unauthorized: Cashier only");
      }
      
      // Cashiers just need to list products to sell them
      return await ctx.db
         .query("medicines")
         .filter(q => q.eq(q.field("branchId"), user.branchId))
         .collect();
    },
});

export const getDailySales = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");
    
        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();
    
        if (!user || user.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), user._id))
           .filter(q => q.gte(q.field("_creationTime"), today.getTime()))
           .collect();
    }
})
