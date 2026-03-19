import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seeding Mutation
 * Use this to initialize the platform with a designated admin account.
 * This can be called from the Convex dashboard or via a script.
 */
export const seedAdmin = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      // Ensure existing user has admin role
      await ctx.db.patch(existingUser._id, {
        role: "admin",
        status: "active",
      });
      return { success: true, message: "Existing user elevated to admin." };
    }

    // Insert the new admin user
    await ctx.db.insert("users", {
      email: args.email,
      full_name: args.fullName,
      role: "admin",
      status: "active",
      clerkId: "seed_admin", // Placeholder until first login
      tokenIdentifier: "seed_admin", // Placeholder until first login
    });

    return { success: true, message: "Admin account seeded successfully." };
  },
});
