import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const completePaymentFromLink = mutation({
  args: {
    token: v.string(),
    chapaTransactionId: v.string(),
    chapaReference: v.string(),
    chapaPaymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const paymentLink = await ctx.db
      .query("subscription_payment_links")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!paymentLink) {
      throw new Error("Invalid payment link");
    }

    if (paymentLink.status !== "pending") {
      throw new Error("Payment link is no longer active");
    }

    if (paymentLink.expiresAt < Date.now()) {
      await ctx.db.patch(paymentLink._id, { status: "expired" });
      throw new Error("Payment link has expired");
    }

    const pharmacy = await ctx.db.get(paymentLink.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found for this payment link");
    }

    await ctx.db.patch(paymentLink._id, {
      status: "completed",
      usedAt: Date.now(),
      chapaTransactionId: args.chapaTransactionId,
      chapaReference: args.chapaReference,
      chapaPaymentMethod: args.chapaPaymentMethod,
    });

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    await ctx.db.patch(paymentLink.pharmacyId, {
      paymentStatus: "paid",
      billingStartDate: Date.now(),
      nextBillingDate: nextBillingDate.getTime(),
      monthlyCost: paymentLink.amount,
      pendingPaymentLinkToken: undefined,
      pendingPaymentLinkSentAt: undefined,
      pendingPaymentLinkExpiresAt: undefined,
    });

    await ctx.db.insert("subscription_history", {
      pharmacyId: paymentLink.pharmacyId,
      oldTier: pharmacy.subscriptionTier,
      newTier: paymentLink.planCode,
      changeType: "initial",
      price: paymentLink.amount,
      currency: paymentLink.currency,
      changedBy: paymentLink.ownerUserId,
      reason: "Completed initial subscription payment via payment link",
      effectiveDate: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: paymentLink.ownerUserId,
      pharmacyId: paymentLink.pharmacyId,
      title: "Subscription payment completed",
      message: `Your ${paymentLink.planCode.toUpperCase()} subscription payment has been received.`,
      type: "success",
      priority: "high",
      read: false,
      createdAt: Date.now(),
    });

    return {
      success: true,
      pharmacyId: paymentLink.pharmacyId,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      planCode: paymentLink.planCode,
    };
  },
});
