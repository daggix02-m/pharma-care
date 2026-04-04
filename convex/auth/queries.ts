import { query } from "../_generated/server";
import { v } from "convex/values";
import { DEFAULT_SIGNUP_PLANS } from "../subscription/defaultPlans";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const checkAccountStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      return { exists: false, status: "not_found" };
    }

    let pharmacyStatus: string | null = null;
    if (user.pharmacyId) {
      const pharmacy = await ctx.db.get(user.pharmacyId);
      pharmacyStatus = pharmacy?.status ?? null;
    }

    return {
      exists: true,
      status: user.status,
      role: user.role,
      emailVerified: Boolean(user.emailVerified),
      pharmacyStatus,
    };
  },
});

export const getSignupSubscriptionPlans = query({
  args: {},
  handler: async (ctx) => {
    const activePlans = await ctx.db
      .query("subscription_plans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .take(100);

    if (activePlans.length > 0) {
      return activePlans
        .map((plan) => ({
          ...plan,
          currency: "ETB",
        }))
        .sort((a, b) => a.price - b.price);
    }

    const allPlans = await ctx.db.query("subscription_plans").take(100);
    if (allPlans.length > 0) {
      return allPlans
        .map((plan) => ({
          ...plan,
          currency: "ETB",
        }))
        .sort((a, b) => a.price - b.price);
    }

    return DEFAULT_SIGNUP_PLANS;
  },
});
