import { query } from "../_generated/server";
import { v } from "convex/values";

export const checkAccountStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return { exists: false, status: "not_found" };
    }

    return {
      exists: true,
      status: user.status,
      role: user.role,
      emailVerified: Boolean(user.emailVerified),
    };
  },
});

export const getSignupSubscriptionPlans = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("subscription_plans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .take(100);

    return plans
      .map((plan) => ({
        ...plan,
        currency: "ETB",
      }))
      .sort((a, b) => a.price - b.price);
  },
});
