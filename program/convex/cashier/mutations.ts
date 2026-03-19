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
