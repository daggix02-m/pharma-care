// @ts-ignore
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const updateStaff = mutation({
  args: { 
      id: v.id("users"),
      data: v.object({
          full_name: v.optional(v.string()),
          role: v.optional(v.string()),
          branchId: v.optional(v.id("branches")),
          status: v.optional(v.string()),
      })
  },
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

    const staffMember = await ctx.db.get(args.id);
    if (!staffMember) throw new Error("Staff member not found");
    
    // Ensure the staff member belongs to the same pharmacy
    if (staffMember.pharmacyId !== manager.pharmacyId) {
        throw new Error("Unauthorized: Staff member belongs to a different pharmacy");
    }

    await ctx.db.patch(args.id, args.data);
    return { success: true };
  },
});

export const removeStaff = mutation({
  args: { id: v.id("users") },
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

    const staffMember = await ctx.db.get(args.id);
    if (!staffMember) throw new Error("Staff member not found");

    if (staffMember.pharmacyId !== manager.pharmacyId) {
         throw new Error("Unauthorized: Staff member belongs to a different pharmacy");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const requestBranch = mutation({
   args: {
       name: v.string(),
       address: v.optional(v.string())
   },
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

      const branchId = await ctx.db.insert("branches", {
          name: args.name,
          address: args.address || "",
          pharmacyId: manager.pharmacyId,
          managerId: manager._id,
          status: "pending" // Requires admin approval
      });

      return { success: true, branchId };
   }
});

export const updateBranch = mutation({
    args: {
        id: v.id("branches"),
        data: v.object({
            name: v.optional(v.string()),
            address: v.optional(v.string()),
            status: v.optional(v.string()),
        })
    },
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
  
        const branch = await ctx.db.get(args.id);
        if (!branch || branch.pharmacyId !== manager.pharmacyId) {
             throw new Error("Branch not found or unauthorized");
        }
  
        await ctx.db.patch(args.id, args.data);
  
        return { success: true };
    }
});

export const removeBranch = mutation({
    args: { id: v.id("branches") },
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
  
        const branch = await ctx.db.get(args.id);
        if (!branch || branch.pharmacyId !== manager.pharmacyId) {
             throw new Error("Branch not found or unauthorized");
        }
  
        // In a real app, we might want to check if there are medicines or sales attached
        await ctx.db.delete(args.id);
  
        return { success: true };
    }
});

export const addMedicine = mutation({
    args: {
        name: v.string(),
        category: v.string(),
        stock: v.number(),
        price: v.number(),
        branchId: v.id("branches")
    },
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
        
        // Verify manager owns the branch
        const branch = await ctx.db.get(args.branchId);
        if (!branch || branch.pharmacyId !== manager.pharmacyId) {
            throw new Error("Unauthorized: Branch does not belong to your pharmacy");
        }

        const medicineId = await ctx.db.insert("medicines", {
            name: args.name,
            category: args.category,
            stock: args.stock,
            price: args.price,
            branchId: args.branchId
        });

        return { success: true, medicineId };
    }
});

export const updateMedicineStock = mutation({
    args: {
        id: v.id("medicines"),
        stock: v.number(),
    },
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

        const medicine = await ctx.db.get(args.id);
        if (!medicine) throw new Error("Medicine not found");

        const branch = await ctx.db.get(medicine.branchId);
        if (!branch || branch.pharmacyId !== manager.pharmacyId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, { stock: args.stock });
        return { success: true };
    }
});

export const removeMedicine = mutation({
    args: { id: v.id("medicines") },
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

        const medicine = await ctx.db.get(args.id);
        if (!medicine) throw new Error("Medicine not found");

        const branch = await ctx.db.get(medicine.branchId);
        if (!branch || branch.pharmacyId !== manager.pharmacyId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
        return { success: true };
    }
});

export const createSale = mutation({
    args: {
        branchId: v.id("branches"),
        items: v.array(v.object({
            medicineId: v.id("medicines"),
            quantity: v.number(),
            price: v.number()
        })),
        totalAmount: v.number(),
        customerName: v.optional(v.string()),
        customerPhone: v.optional(v.string()),
        paymentMethod: v.string(),
        chapaTransactionId: v.optional(v.string()),
        chapaPaymentMethod: v.optional(v.string()),
        chapaReference: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");
    
        const cashier = await ctx.db
           .query("users")
           .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
           .unique();
    
        if (!cashier) {
             throw new Error("Unauthorized");
        }

        // Deduct inventory
        for (const item of args.items) {
           const medicine = await ctx.db.get(item.medicineId);
           if (!medicine) throw new Error(`Medicine ${item.medicineId} not found`);
           if (medicine.stock < item.quantity) {
               throw new Error(`Insufficient stock for ${medicine.name}`);
           }
           await ctx.db.patch(medicine._id, { stock: medicine.stock - item.quantity });
        }

        const saleId = await ctx.db.insert("sales", {
            branchId: args.branchId,
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

export const createStaff = mutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    role: v.string(),
    branchId: v.id("branches"),
  },
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
 
    // Verify the branch belongs to this manager's pharmacy
    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
        throw new Error("Unauthorized: Branch does not belong to your pharmacy");
    }

    // Create the user in Convex as pending
    const userId = await ctx.db.insert("users", {
        full_name: args.full_name,
        email: args.email,
        role: args.role as any,
        branchId: args.branchId,
        pharmacyId: manager.pharmacyId,
        status: "pending",
        tokenIdentifier: `pending_${args.email}`,
        clerkId: "pending"
    });
 
    return { success: true, userId };
  }
});

export const createManager = mutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    branchId: v.id("branches"),
  },
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

    // Verify: branch belongs to this manager's pharmacy
    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
        throw new Error("Unauthorized: Branch does not belong to your pharmacy");
    }

    // Create a new manager for the same pharmacy (pending admin approval)
    const userId = await ctx.db.insert("users", {
        full_name: args.full_name,
        email: args.email,
        role: "manager",
        branchId: args.branchId,
        pharmacyId: manager.pharmacyId,
        status: "pending", // Managers require admin approval
        tokenIdentifier: `pending_${args.email}`,
        clerkId: "pending"
    });

    // Note: Branch managerId is NOT updated until admin approves
    return { success: true, userId };
  }
});
 
