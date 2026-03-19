// @ts-ignore
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Get admin email from environment variable
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@pharmacare.com";

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name changed, patch it.
      if (user.full_name !== identity.name || (identity.email === ADMIN_EMAIL && user.role !== "admin")) {
        await ctx.db.patch(user._id, { 
          full_name: identity.name || "",
          role: identity.email === ADMIN_EMAIL ? "admin" : user.role
        });
      }

      // Fetch the Pharmacy if the user owns one to return it
      let pharmacy = null;
      if (user.pharmacyId) {
         pharmacy = await ctx.db.get(user.pharmacyId);
      }
      return { ...user, pharmacy };
    }

    // Check if the user exists but hasn't synced their token yet (created during our custom registration)
    // We match on email if it exists
    if (identity.email) {
      const pendingUser = await ctx.db
        .query("users")
        .filter((q: any) => q.eq(q.field("email"), identity.email))
        .first();

      if (pendingUser) {
        await ctx.db.patch(pendingUser._id, {
          clerkId: identity.subject,
          tokenIdentifier: identity.tokenIdentifier,
          full_name: pendingUser.full_name || identity.name || "",
        });

        let pharmacy = null;
        if (pendingUser.pharmacyId) {
            pharmacy = await ctx.db.get(pendingUser.pharmacyId);
        }

        return { ...pendingUser, clerkId: identity.subject, tokenIdentifier: identity.tokenIdentifier, pharmacy };
      }
    }

    // Designated Platform Admin
    const isAdminEmail = identity.email === ADMIN_EMAIL;

    // If it's a completely new user, create it
    const newUserId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      full_name: identity.name || "",
      email: identity.email || "",
      role: isAdminEmail ? "admin" : "user",
      status: "active",
    });

    return await ctx.db.get(newUserId);
  },
});

export const updateProfile = mutation({
  args: { full_name: v.string() },
  handler: async (ctx: any, args: { full_name: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { full_name: args.full_name });
    return { success: true };
  },
});
