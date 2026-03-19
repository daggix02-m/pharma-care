// @ts-ignore
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!user || user.role !== "pharmacist") throw new Error("Unauthorized: Pharmacist only");

    if (!user.branchId) {
        return {
            totalMedicines: 0,
            lowStockItems: 0,
            expiredItems: 0,
            todaySales: 0,
            weekSales: 0,
            monthSales: 0,
        };
    }

    const medicines = await ctx.db
       .query("medicines")
       .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
       .collect();

    const lowStockItems = medicines.filter((m: any) => m.stock <= 10).length;
    
    // Placeholder for expired items until we add expiryDate to schema
    const expiredItems = 0;

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const sales = await ctx.db
       .query("sales")
       .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
       .collect();
    
    const todaySalesItems = sales.filter((s: any) => s._creationTime >= todayStart);
    const todaySales = todaySalesItems.reduce((acc: number, s: any) => acc + s.totalAmount, 0);

    return {
      totalMedicines: medicines.length,
      lowStockItems,
      expiredItems,
      todaySales,
      weekSales: todaySales * 5, // Placeholder
      monthSales: todaySales * 20, // Placeholder
    };
  },
});

export const getMedicines = query({
    args: {},
    handler: async (ctx: any) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const user = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!user || user.role !== "pharmacist" || !user.branchId) {
          return [];
      }
      
      return await ctx.db
         .query("medicines")
         .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
         .collect();
    },
});

export const getMedicineById = query({
    args: { id: v.id("medicines") },
    handler: async (ctx: any, args: any) => {
        return await ctx.db.get(args.id);
    }
});

export const getSoldItemsHistory = query({
    args: {},
    handler: async (ctx: any) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const user = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!user || !user.branchId) return [];
  
      const sales = await ctx.db
         .query("sales")
         .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
         .order("desc")
         .collect();
      
      const items = [];
      for (const sale of sales) {
          for (const item of sale.items) {
              const medicine = await ctx.db.get(item.medicineId);
              items.push({
                  ...item,
                  medicineName: medicine?.name || "Unknown",
                  saleId: sale._id,
                  timestamp: sale._creationTime,
              });
          }
      }
      return items;
    },
});

export const getStockRequests = query({
    args: {},
    handler: async (ctx: any) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const user = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!user || !user.branchId) return [];
  
      const requests = await ctx.db
         .query("stock_requests")
         .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
         .order("desc")
         .collect();
      
      const items = [];
      for (const req of requests) {
          const medicine = await ctx.db.get(req.medicineId);
          items.push({
              ...req,
              medicineName: medicine?.name || "Unknown",
          });
      }
      return items;
    },
});
