import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const posCheckout = mutation({
    args: {
        items: v.array(v.object({
            medicineId: v.id("medicines"),
            quantity: v.number(),
            price: v.number()
        })),
        totalAmount: v.number(),
        paymentMethod: v.string(),
        customerName: v.optional(v.string()),
        customerPhone: v.optional(v.string()),
        chapaTransactionId: v.optional(v.string()),
        chapaPaymentMethod: v.optional(v.string()),
        chapaReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!cashier || cashier.role !== "cashier" || !cashier.branchId) {
             throw new Error("Unauthorized: Cashier only");
        }

        // Deduct inventory
        for (const item of args.items) {
           const medicine = await ctx.db.get(item.medicineId);
           if (!medicine || medicine.branchId !== cashier.branchId) {
               throw new Error(`Medicine ${item.medicineId} not found or unauthorized`);
           }
           if (medicine.stock < item.quantity) {
               throw new Error(`Insufficient stock for ${medicine.name}`);
           }
           await ctx.db.patch(medicine._id, { stock: medicine.stock - item.quantity });
        }

        const saleId = await ctx.db.insert("sales", {
            branchId: cashier.branchId,
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
            items: args.items
        });

        return { success: true, saleId };
    }
});

export const startSession = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!cashier || cashier.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        // For now, just log session start (sessions to be enhanced)
        await ctx.db.insert("audit_logs", {
            userId: cashier._id,
            action: "session_start",
            entityId: cashier._id,
            entityType: "session",
            details: "Cashier session started",
            timestamp: Date.now(),
        });

        return { success: true, sessionId: cashier._id, startTime: Date.now() };
    },
});

export const endSession = mutation({
    args: { closingCash: v.number() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!cashier || cashier.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sales = await ctx.db
           .query("sales")
           .filter(q => q.eq(q.field("cashierId"), cashier._id))
           .filter(q => q.gte(q.field("_creationTime"), today.getTime()))
           .collect();

        const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);

        await ctx.db.insert("audit_logs", {
            userId: cashier._id,
            action: "session_end",
            entityId: cashier._id,
            entityType: "session",
            details: `Session ended. Sales: ${sales.length}, Total: ${totalAmount}, Closing Cash: ${args.closingCash}`,
            timestamp: Date.now(),
        });

        return {
            success: true,
            totalSales: sales.length,
            totalAmount,
            closingCash: args.closingCash,
            difference: args.closingCash - totalAmount,
        };
    },
});

export const processPayment = mutation({
    args: {
        saleId: v.id("sales"),
        amount: v.number(),
        paymentMethod: v.string(),
        referenceNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!cashier || cashier.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.saleId);
        if (!sale || sale.cashierId !== cashier._id) {
            throw new Error("Sale not found or unauthorized");
        }

        // Update sale with payment details
        await ctx.db.patch(args.saleId, {
            paymentMethod: args.paymentMethod,
            status: "completed",
        });

        // Log payment
        await ctx.db.insert("audit_logs", {
            userId: cashier._id,
            action: "payment_processed",
            entityId: args.saleId,
            entityType: "sale",
            details: `Payment of ${args.amount} processed via ${args.paymentMethod}`,
            timestamp: Date.now(),
        });

        return { success: true, saleId: args.saleId };
    },
});

export const acceptPayment = mutation({
    args: {
        saleId: v.id("sales"),
        paymentMethod: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!cashier || cashier.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.saleId);
        if (!sale || sale.cashierId !== cashier._id) {
            throw new Error("Sale not found or unauthorized");
        }

        await ctx.db.patch(args.saleId, {
            paymentMethod: args.paymentMethod,
            status: "completed",
        });

        await ctx.db.insert("audit_logs", {
            userId: cashier._id,
            action: "payment_accepted",
            entityId: args.saleId,
            entityType: "sale",
            details: `Payment of ${args.amount} accepted`,
            timestamp: Date.now(),
        });

        return { success: true, saleId: args.saleId };
    },
});

export const processRefund = mutation({
    args: {
        saleId: v.id("sales"),
        items: v.array(v.object({
            medicineId: v.id("medicines"),
            quantity: v.number(),
            reason: v.string(),
        })),
        refundAmount: v.number(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!cashier || cashier.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.saleId);
        if (!sale || sale.cashierId !== cashier._id) {
            throw new Error("Sale not found or unauthorized");
        }

        // Restore stock for returned items
        for (const item of args.items) {
            const medicine = await ctx.db.get(item.medicineId);
            if (!medicine) throw new Error("Medicine not found");
            await ctx.db.patch(medicine._id, { stock: medicine.stock + item.quantity });
        }

        await ctx.db.insert("audit_logs", {
            userId: cashier._id,
            action: "refund_processed",
            entityId: args.saleId,
            entityType: "sale",
            details: `Refund of ${args.refundAmount} for sale ${args.saleId}. Reason: ${args.reason}`,
            timestamp: Date.now(),
        });

        return { success: true, refundAmount: args.refundAmount };
    },
});

export const processReturn = mutation({
    args: {
        saleId: v.id("sales"),
        items: v.array(v.object({
            medicineId: v.id("medicines"),
            quantity: v.number(),
        })),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!cashier || cashier.role !== "cashier") {
            throw new Error("Unauthorized: Cashier only");
        }

        const sale = await ctx.db.get(args.saleId);
        if (!sale || sale.cashierId !== cashier._id) {
            throw new Error("Sale not found or unauthorized");
        }

        // Restore stock
        for (const item of args.items) {
            const medicine = await ctx.db.get(item.medicineId);
            if (!medicine) throw new Error("Medicine not found");
            await ctx.db.patch(medicine._id, { stock: medicine.stock + item.quantity });
        }

        await ctx.db.insert("audit_logs", {
            userId: cashier._id,
            action: "return_processed",
            entityId: args.saleId,
            entityType: "sale",
            details: `Return processed for sale ${args.saleId}. Reason: ${args.reason}`,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

export const addToCart = mutation({
    args: {
        medicineId: v.id("medicines"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();

        if (!user) throw new Error("Unauthorized");

        const medicine = await ctx.db.get(args.medicineId);
        if (!medicine) throw new Error("Medicine not found");
        if (medicine.stock < args.quantity) {
            throw new Error("Insufficient stock");
        }

        return {
            success: true,
            medicine: {
                _id: medicine._id,
                name: medicine.name,
                price: medicine.price,
                stock: medicine.stock,
                category: medicine.category,
            },
        };
    },
});

export const applyDiscount = mutation({
    args: {
        discountType: v.string(),
        discountValue: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // For now, just validate discount (real implementation to be added)
        const { discountType, discountValue } = args;

        if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
            throw new Error("Invalid discount percentage");
        }
        if (discountType === "fixed" && discountValue < 0) {
            throw new Error("Invalid discount amount");
        }

        return {
            success: true,
            discountType,
            discountValue,
            message: `Discount applied: ${discountType === "percentage" ? discountValue + "%" : discountValue}`,
        };
    },
});
