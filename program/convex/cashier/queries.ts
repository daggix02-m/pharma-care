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
});

export const searchMedicines = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user || user.role !== "cashier" || !user.branchId) {
            throw new Error("Unauthorized: Cashier only");
        }

        if (!args.query.trim()) {
            return [];
        }

        const medicines = await ctx.db
           .query("medicines")
           .filter(q => q.eq(q.field("branchId"), user.branchId))
           .collect();

        return medicines.filter(m => 
            m.name.toLowerCase().includes(args.query.toLowerCase()) ||
            m.category?.toLowerCase().includes(args.query.toLowerCase()) ||
            m.manufacturer?.toLowerCase().includes(args.query.toLowerCase())
        );
    },
});

export const getTransactions = query({
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

        return await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), user._id))
           .order("desc")
           .collect();
    },
});

export const getTransactionDetails = query({
    args: { transactionId: v.id("sales") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user || user.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.transactionId);
        if (!sale || sale.cashierId !== user._id) {
            throw new Error("Transaction not found or unauthorized");
        }

        const items = await Promise.all(
            sale.items.map(async (item) => {
                const medicine = await ctx.db.get(item.medicineId);
                return {
                    ...item,
                    medicineName: medicine?.name || "Unknown",
                    category: medicine?.category || "Unknown",
                };
            })
        );

        return { ...sale, items };
    },
});

export const getReceipt = query({
    args: { saleId: v.id("sales") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user || user.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.saleId);
        if (!sale) throw new Error("Sale not found");

        const branch = await ctx.db.get(sale.branchId);
        const cashier = await ctx.db.get(sale.cashierId);

        const items = await Promise.all(
            sale.items.map(async (item) => {
                const medicine = await ctx.db.get(item.medicineId);
                return {
                    ...item,
                    medicineName: medicine?.name || "Unknown",
                    manufacturer: medicine?.manufacturer || "Unknown",
                };
            })
        );

        return {
            sale,
            branch,
            cashier: { name: cashier?.full_name, email: cashier?.email },
            items,
        };
    },
});

export const getReturnableSales = query({
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
        today.setDate(today.getDate() - 7); // Last 7 days

        return await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), user._id))
           .filter(q => q.gte(q.field("_creationTime"), today.getTime()))
           .collect();
    },
});

export const getReturnableItems = query({
    args: { saleId: v.id("sales") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user || user.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.saleId);
        if (!sale || sale.cashierId !== user._id) {
            throw new Error("Sale not found or unauthorized");
        }

        return await Promise.all(
            sale.items.map(async (item) => {
                const medicine = await ctx.db.get(item.medicineId);
                return {
                    ...item,
                    medicineName: medicine?.name || "Unknown",
                    category: medicine?.category || "Unknown",
                    canReturn: true, // All items can be returned
                };
            })
        );
    },
});

export const getSalesSummary = query({
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

        const sales = await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), user._id))
           .collect();

        const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;

        return {
            totalSales: sales.length,
            totalRevenue,
            averageSale,
            salesCount: sales.length,
        };
    },
});

export const getPaymentsReport = query({
    args: { 
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user || user.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        let sales = await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), user._id))
           .collect();

        if (args.startDate) {
            sales = sales.filter(s => s._creationTime >= args.startDate);
        }
        if (args.endDate) {
            sales = sales.filter(s => s._creationTime <= args.endDate);
        }

        return {
            totalPayments: sales.length,
            totalAmount: sales.reduce((sum, s) => sum + s.totalAmount, 0),
            byPaymentMethod: sales.reduce((acc, s) => {
                acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmount;
                return acc;
            }, {}),
            sales,
        };
    },
});

export const getReturnsReport = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user || user.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        // For now, return empty report (returns feature to be implemented)
        return {
            totalReturns: 0,
            totalRefundAmount: 0,
            returns: [],
        };
    },
});

export const getSessions = query({
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

        // For now, return current user's sales as sessions (to be enhanced)
        const sales = await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), user._id))
           .order("desc")
           .take(1)
           .collect();

        return [{
            sessionId: user._id,
            cashierName: user.full_name,
            startTime: Date.now(),
            endTime: null,
            totalSales: 0,
            totalAmount: 0,
            status: "active",
        }];
    },
});

export const getShiftSummary = query({
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

        const sales = await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), user._id))
           .filter(q => q.gte(q.field("_creationTime"), today.getTime()))
           .collect();

        return {
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
            averageTransaction: sales.length > 0 ? sales.reduce((sum, s) => sum + s.totalAmount, 0) / sales.length : 0,
            itemsSold: sales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0),
            date: today.toISOString().split('T')[0],
        };
    },
});

export const getPendingPayments = query({
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

        // For now, return empty (pending payments to be implemented)
        return [];
    },
});

export const getPaymentDetails = query({
    args: { saleId: v.id("sales") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user || user.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.saleId);
        if (!sale || sale.cashierId !== user._id) {
            throw new Error("Sale not found or unauthorized");
        }

        return {
            saleId: sale._id,
            totalAmount: sale.totalAmount,
            paymentMethod: sale.paymentMethod,
            status: sale.status,
            chapaTransactionId: sale.chapaTransactionId,
            chapaStatus: sale.chapaStatus,
            chapaReference: sale.chapaReference,
            createdAt: sale._creationTime,
        };
    },
});
