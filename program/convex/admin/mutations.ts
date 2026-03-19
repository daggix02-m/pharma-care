// @ts-ignore
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const submitPharmacyApplication = mutation({
  args: {
    pharmacy: v.object({
      pharmacyName: v.string(),
      licenseCode: v.string(),
      staffCount: v.string(),
      numberOfBranches: v.string(),
      branchNames: v.string(),
      locations: v.string(),
    }),
    manager: v.object({
      fullName: v.string(),
      email: v.string(),
    }),
    subscription: v.string(), // "basic", "premium", "enterprise"
  },
  handler: async (ctx: any, args: any) => {
    // 1. Create the pending user (Clerk will finish setup later but we need an ID)
    const userId = await ctx.db.insert("users", {
      clerkId: `pending_${Date.now()}`, // Temporary clerkId
      tokenIdentifier: "pending",
      full_name: args.manager.fullName,
      email: args.manager.email,
      role: "manager",
      status: "pending",
    });

    // 2. Create the pending pharmacy
    const pharmacyId = await ctx.db.insert("pharmacies", {
      name: args.pharmacy.pharmacyName,
      licenseCode: args.pharmacy.licenseCode,
      staffCount: parseInt(args.pharmacy.staffCount, 10) || 1,
      subscriptionTier: args.subscription,
      status: "pending",
      ownerId: userId,
    });

    // 3. Create the first main branch based on the first location/name
    const branchNames = args.pharmacy.branchNames.split(',').map((n: string) => n.trim());
    const locations = args.pharmacy.locations.split(',').map((l: string) => l.trim());
    
    // Iterate through submitted branch names and construct the branches 
    // Usually, the first branch is the 'Main' branch.
    for (let i = 0; i < Math.max(branchNames.length, locations.length, 1); i++) {
        const bName = branchNames[i] || `Branch ${i + 1}`;
        const bLoc = locations[i] || "";

        const branchId = await ctx.db.insert("branches", {
            pharmacyId: pharmacyId,
            name: bName,
            address: bLoc,
            status: "pending",
            managerId: userId,
        });

        // Assign the user to the very first branch created.
        if (i === 0) {
            await ctx.db.patch(userId, { pharmacyId, branchId });
        }
    }

    return { success: true };
  },
});

export const approveBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
      const branch = await ctx.db.get(args.id);
      if (!branch) throw new Error("Branch not found");

      await ctx.db.patch(args.id, { status: "active" });

      if (branch.pharmacyId) {
          await ctx.db.patch(branch.pharmacyId, { status: "active" });
      }

      if (branch.managerId) {
          await ctx.db.patch(branch.managerId, { status: "active" });
      }

      return { success: true };
  }
});

export const rejectBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
      const branch = await ctx.db.get(args.id);
      if (!branch) throw new Error("Branch not found");

      await ctx.db.patch(args.id, { status: "rejected" });

      // Automatically reject manager and pharmacy if they came in together
      if (branch.pharmacyId) {
          await ctx.db.patch(branch.pharmacyId, { status: "rejected" });
      }

      if (branch.managerId) {
          await ctx.db.patch(branch.managerId, { status: "rejected" });
      }

      return { success: true };
  }
});

export const activateBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
      await ctx.db.patch(args.id, { status: "active" });
      return { success: true };
  }
});

export const deactivateBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
      await ctx.db.patch(args.id, { status: "deactivated" });
      return { success: true };
  }
});

export const activateManager = mutation({
    args: { id: v.id("users") },
    handler: async (ctx: any, args: any) => {
        await ctx.db.patch(args.id, { status: "active" });
        return { success: true };
    }
});

export const deactivateManager = mutation({
  args: { id: v.id("users") },
  handler: async (ctx: any, args: any) => {
      await ctx.db.patch(args.id, { status: "deactivated" });
      return { success: true };
  }
});

export const createPharmacy = mutation({
  args: { name: v.string() },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
       .query("users")
       .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
       .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const pharmacyId = await ctx.db.insert("pharmacies", {
      name: args.name,
      licenseCode: "ADMIN_CREATED",
      staffCount: 0,
      subscriptionTier: "enterprise",
      status: "active",
      ownerId: admin._id,
    });
    return pharmacyId;
  },
});

export const deletePharmacy = mutation({
  args: { id: v.id("pharmacies") },
  handler: async (ctx: any, args: any) => {
    // Check for branches first? For now mirror the API logic
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const deleteManager = mutation({
  args: { id: v.id("users") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const deleteBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
