// @ts-ignore
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!manager || manager.role !== "manager") {
         throw new Error("Unauthorized: Manager only");
    }

    const branches = await ctx.db
       .query("branches")
       .filter((q: any) => q.eq(q.field("pharmacyId"), manager.pharmacyId))
       .collect();
    
    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db
       .query("medicines")
       .collect(); // In a real app, we'd use indexes
    
    const pharmacyMedicines = medicines.filter((m: any) => branchIds.includes(m.branchId));
    
    // Calculate total stock and low stock
    const totalStock = pharmacyMedicines.reduce((acc: number, m: any) => acc + m.stock, 0);
    const lowStockItems = pharmacyMedicines.filter((m: any) => m.stock <= 10).length;

    // Get sales for today or last 30 days
    const sales = await ctx.db.query("sales").collect();
    const pharmacySales = sales.filter((s: any) => branchIds.includes(s.branchId));
    const totalRevenue = pharmacySales.reduce((acc: number, s: any) => acc + s.totalAmount, 0);

    return {
      totalStaff: 12, // Placeholder
      totalBranches: branches.length,
      totalRevenue,
      lowStockItems,
      stockLevel: totalStock,
      revenueChange: "+12.5%",
      stockChange: "-2.3%",
    };
  },
});

export const getStaffMembers = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!manager || manager.role !== "manager") {
         throw new Error("Unauthorized: Manager only");
    }

    const staff = await ctx.db
       .query("users")
       .filter((q: any) => q.eq(q.field("pharmacyId"), manager.pharmacyId))
       .collect();

    return staff;
  },
});

export const getBranches = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!manager || manager.role !== "manager") {
         throw new Error("Unauthorized: Manager only");
    }

    const branches = await ctx.db
       .query("branches")
       .filter((q: any) => q.eq(q.field("pharmacyId"), manager.pharmacyId))
       .collect();

    return branches;
  },
});

export const getAllMedicines = query({
    args: {},
    handler: async (ctx: any) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const manager = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!manager || manager.role !== "manager") {
           throw new Error("Unauthorized: Manager only");
      }
  
      const branches = await ctx.db
         .query("branches")
         .filter((q: any) => q.eq(q.field("pharmacyId"), manager.pharmacyId))
         .collect();
      
      const branchIds = branches.map((b: any) => b._id);
  
      const medicines = await ctx.db
         .query("medicines")
         .collect();
      
      return medicines.filter((m: any) => branchIds.includes(m.branchId));
    },
});

export const getMedicineDetails = query({
    args: { id: v.id("medicines") },
    handler: async (ctx: any, args: any) => {
      const medicine = await ctx.db.get(args.id);
      return medicine;
    },
});

export const getSalesByBranch = query({
    args: { branchId: v.id("branches") },
    handler: async (ctx: any, args: any) => {
        const sales = await ctx.db
            .query("sales")
            .withIndex("by_branch", (q: any) => q.eq("branchId", args.branchId))
            .collect();
        return sales;
    }
});

export const getSales = query({
  args: { branchId: v.optional(v.id("branches")) },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const manager = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!manager || manager.role !== "manager") {
         throw new Error("Unauthorized: Manager only");
    }

    let q = ctx.db.query("sales");
    if (args.branchId) {
       q = q.withIndex("by_branch", (q_obj: any) => q_obj.eq("branchId", args.branchId));
    }
    
    const allSales = await q.collect();

    // If no branchId, manually filter by pharmacy
    if (!args.branchId) {
        const branches = await ctx.db
           .query("branches")
           .filter((b: any) => b.eq(b.field("pharmacyId"), manager.pharmacyId))
           .collect();
        const branchIds = branches.map((b: any) => b._id);
        return allSales.filter((s: any) => branchIds.includes(s.branchId));
    }

    return allSales;
  },
});

export const getSalesSummary = query({
  args: { branchId: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    // Mock for now
    return [
      { date: '2024-03-10', amount: 4500 },
      { date: '2024-03-11', amount: 5200 },
      { date: '2024-03-12', amount: 4800 },
      { date: '2024-03-13', amount: 6100 },
      { date: '2024-03-14', amount: 5900 },
      { date: '2024-03-15', amount: 7200 },
      { date: '2024-03-16', amount: 6800 },
    ];
  },
});

export const getInventorySummary = query({
  args: { branchId: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    return [
      { name: 'Tablets', value: 45 },
      { name: 'Syrups', value: 25 },
      { name: 'Injections', value: 15 },
      { name: 'Other', value: 15 },
    ];
  },
});

export const getTopSelling = query({
  args: { branchId: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    return [
      { name: 'Paracetamol 500mg', sales: 124, revenue: 1240 },
      { name: 'Amoxicillin 250mg', sales: 86, revenue: 2150 },
      { name: 'Ibuprofen 400mg', sales: 65, revenue: 975 },
      { name: 'Cough Syrup', sales: 48, revenue: 1440 },
    ];
  },
});

export const getNotifications = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!user) return [];

    const notifications = await ctx.db
       .query("notifications")
       .withIndex("by_user", (q: any) => q.eq("userId", user._id))
       .order("desc")
       .collect();

    return notifications;
  },
});

export const getBranchOverview = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx: any, args: any) => {
     const branch = await ctx.db.get(args.branchId);
     return branch;
  },
});

export const getMedicinesByBranch = query({
    args: { branchId: v.id("branches") },
    handler: async (ctx: any, args: any) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const manager = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!manager || manager.role !== "manager") {
           throw new Error("Unauthorized: Manager only");
      }

      // Verify: branch belongs to this manager's pharmacy
      const branch = await ctx.db.get(args.branchId);
      if (!branch || branch.pharmacyId !== manager.pharmacyId) {
        throw new Error("Unauthorized: Branch does not belong to your pharmacy");
      }
      
      return await ctx.db
         .query("medicines")
         .withIndex("by_branch", (q: any) => q.eq("branchId", args.branchId))
         .collect();
    },
});

export const getPendingBranches = query({
    args: {},
    handler: async (ctx: any, args: any) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const manager = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!manager || manager.role !== "manager" || !manager.pharmacyId) {
           throw new Error("Unauthorized: Manager only");
      }
      
      return await ctx.db
         .query("branches")
         .filter((q: any) => q.and(
            q.eq(q.field("pharmacyId"), manager.pharmacyId),
            q.eq(q.field("status"), "pending")
         ))
         .collect();
    },
});

export const getBranchMedicineStats = query({
    args: { branchId: v.id("branches") },
    handler: async (ctx: any, args: any) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");
  
      const manager = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
  
      if (!manager || manager.role !== "manager") {
           throw new Error("Unauthorized: Manager only");
      }

      // Verify: branch belongs to this manager's pharmacy
      const branch = await ctx.db.get(args.branchId);
      if (!branch || branch.pharmacyId !== manager.pharmacyId) {
        throw new Error("Unauthorized: Branch does not belong to your pharmacy");
      }
      
      const medicines = await ctx.db
         .query("medicines")
         .withIndex("by_branch", (q: any) => q.eq("branchId", args.branchId))
         .collect();
      
      return {
        totalMedicines: medicines.length,
        totalStock: medicines.reduce((acc: number, m: any) => acc + m.stock, 0),
        lowStockItems: medicines.filter((m: any) => m.stock <= 10).length,
        categories: medicines.reduce((acc: any, m: any) => {
          acc[m.category] = (acc[m.category] || 0) + 1;
          return acc;
        }, {}),
      };
    },
});
