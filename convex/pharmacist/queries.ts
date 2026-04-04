// @ts-ignore
import { query } from "../_generated/server";
import { v } from "convex/values";
import { requirePharmacist } from "../lib/auth";

export const getDashboardStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requirePharmacist(ctx, args.sessionToken);

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

    const todaySalesItems = sales.filter(
      (s: any) => s._creationTime >= todayStart,
    );
    const todaySales = todaySalesItems.reduce(
      (acc: number, s: any) => acc + s.totalAmount,
      0,
    );

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
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requirePharmacist(ctx, args.sessionToken);

    if (!user.branchId) {
      return [];
    }

    return await ctx.db
      .query("medicines")
      .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
      .collect();
  },
});

export const getMedicineById = query({
  args: {
    id: v.id("medicines"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requirePharmacist(ctx, args.sessionToken);
    const medicine = await ctx.db.get(args.id);
    if (!medicine || medicine.branchId !== user.branchId) {
      throw new Error("Medicine not found or unauthorized");
    }
    return medicine;
  },
});

export const getSoldItemsHistory = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requirePharmacist(ctx, args.sessionToken);

    if (!user.branchId) return [];

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
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requirePharmacist(ctx, args.sessionToken);

    if (!user.branchId) return [];

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

export const getExpiringMedicines = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requirePharmacist(ctx, args.sessionToken);

    if (!user.branchId) {
      return [];
    }

    const medicines = await ctx.db
      .query("medicines")
      .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
      .collect();

    const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;

    return medicines.filter((m: any) => {
      if (!m.expiryDate) return false;
      return m.expiryDate <= thirtyDaysFromNow;
    });
  },
});

export const getLowStockMedicines = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requirePharmacist(ctx, args.sessionToken);

    if (!user.branchId) {
      return [];
    }

    const medicines = await ctx.db
      .query("medicines")
      .withIndex("by_branch", (q: any) => q.eq("branchId", user.branchId))
      .collect();

    return medicines.filter((m: any) => m.stock <= 10);
  },
});
