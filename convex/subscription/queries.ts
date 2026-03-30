import { query } from "../_generated/server";
import { v } from "convex/values";

export const getPaymentLinkDetails = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const paymentLink = await ctx.db
      .query("subscription_payment_links")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!paymentLink) {
      return { valid: false, reason: "not_found" };
    }

    if (paymentLink.status !== "pending") {
      return { valid: false, reason: "inactive" };
    }

    if (paymentLink.expiresAt < Date.now()) {
      return { valid: false, reason: "expired" };
    }

    const pharmacy = await ctx.db.get(paymentLink.pharmacyId);

    return {
      valid: true,
      paymentLink: {
        token: paymentLink.token,
        planCode: paymentLink.planCode,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        expiresAt: paymentLink.expiresAt,
      },
      pharmacy: pharmacy
        ? {
            id: pharmacy._id,
            name: pharmacy.name,
            subscriptionTier: pharmacy.subscriptionTier,
          }
        : null,
    };
  },
});
