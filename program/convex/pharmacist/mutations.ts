import { mutation } from "../_generated/server";
import { v } from "convex/values";

const verifyPharmacist = async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!user || user.role !== "pharmacist" || !user.branchId) {
         throw new Error("Unauthorized: Pharmacist only");
    }
    return user;
};

export const addMedicine = mutation({
    args: {
        name: v.string(),
        category: v.string(),
        stock: v.number(),
        price: v.number(),
        type: v.optional(v.string()),
        manufacturer: v.optional(v.string()),
        barcode: v.optional(v.string()),
        expiryDate: v.optional(v.number()),
        prescriptionRequired: v.optional(v.boolean()),
    },
    handler: async (ctx: any, args: any) => {
        const user = await verifyPharmacist(ctx);

        const medicineId = await ctx.db.insert("medicines", {
            name: args.name,
            category: args.category,
            stock: args.stock,
            price: args.price,
            branchId: user.branchId!,
            type: args.type,
            manufacturer: args.manufacturer,
            barcode: args.barcode,
            expiryDate: args.expiryDate,
            prescriptionRequired: args.prescriptionRequired,
        });

        return { success: true, medicineId };
    }
});

export const updateMedicineStock = mutation({
    args: {
        id: v.id("medicines"),
        stock: v.optional(v.number()),
        minStock: v.optional(v.number()),
    },
    handler: async (ctx: any, args: any) => {
        const user = await verifyPharmacist(ctx);
        
        const medicine = await ctx.db.get(args.id);
        if (!medicine || medicine.branchId !== user.branchId) {
            throw new Error("Medicine not found or unauthorized");
        }

        const patch: any = {};
        if (args.stock !== undefined) patch.stock = args.stock;
        if (args.minStock !== undefined) patch.minStock = args.minStock;

        await ctx.db.patch(args.id, patch);
        return { success: true };
    }
});

export const createStockRequest = mutation({
    args: {
        medicineId: v.id("medicines"),
        quantity: v.number(),
        urgency: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const user = await verifyPharmacist(ctx);
        
        const requestId = await ctx.db.insert("stock_requests", {
            branchId: user.branchId!,
            pharmacistId: user._id,
            medicineId: args.medicineId,
            quantity: args.quantity,
            urgency: args.urgency,
            status: "pending",
            notes: args.notes,
        });

        return { success: true, requestId };
    }
});

export const createSale = mutation({
    args: {
        items: v.array(v.object({
            medicineId: v.id("medicines"),
            quantity: v.number(),
            price: v.number()
        })),
        totalAmount: v.number(),
        customerName: v.optional(v.string()),
        customerPhone: v.optional(v.string()),
        paymentMethod: v.string(),
        prescriptionId: v.optional(v.string()),
        chapaTransactionId: v.optional(v.string()),
        chapaPaymentMethod: v.optional(v.string()),
        chapaReference: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const user = await verifyPharmacist(ctx);
        
        // Deduct inventory
        for (const item of args.items) {
           const medicine = await ctx.db.get(item.medicineId);
           if (!medicine || medicine.branchId !== user.branchId) {
               throw new Error(`Medicine ${item.medicineId} not found or unauthorized`);
           }
           if (medicine.stock < item.quantity) {
               throw new Error(`Insufficient stock for ${medicine.name}`);
           }
           await ctx.db.patch(medicine._id, { stock: medicine.stock - item.quantity });
        }

        const saleId = await ctx.db.insert("sales", {
            branchId: user.branchId!,
            cashierId: user._id, 
            totalAmount: args.totalAmount,
            status: "completed",
            customerName: args.customerName,
            customerPhone: args.customerPhone,
            paymentMethod: args.paymentMethod,
            prescriptionId: args.prescriptionId,
            chapaTransactionId: args.chapaTransactionId,
            chapaPaymentMethod: args.chapaPaymentMethod,
            chapaStatus: args.chapaTransactionId ? "success" : undefined,
            chapaReference: args.chapaReference,
            items: args.items
        });

        return { success: true, saleId };
    }
});

export const markMedicineForReturn = mutation({
    args: {
        id: v.id("medicines"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const user = await verifyPharmacist(ctx);
        
        const medicine = await ctx.db.get(args.id);
        if (!medicine || medicine.branchId !== user.branchId) {
            throw new Error("Medicine not found or unauthorized");
        }

        await ctx.db.patch(args.id, { status: "returned" });
        return { success: true };
    }
});
