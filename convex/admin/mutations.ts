// @ts-ignore
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { hasPermission, Permission } from "../lib/permissions";
import { requireAdmin } from "../lib/auth";
import { generateRandomString } from "../lib/utils";

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
    const branchNames = args.pharmacy.branchNames
      .split(",")
      .map((n: string) => n.trim());
    const locations = args.pharmacy.locations
      .split(",")
      .map((l: string) => l.trim());

    // Iterate through submitted branch names and construct the branches
    // Usually, the first branch is the 'Main' branch.
    for (
      let i = 0;
      i < Math.max(branchNames.length, locations.length, 1);
      i++
    ) {
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
  },
});

export const approvePharmacyApplication = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) throw new Error("Pharmacy not found");

    const owner = await ctx.db.get(pharmacy.ownerId);
    if (!owner) throw new Error("Owner not found");

    const selectedPlan = await ctx.db
      .query("subscription_plans")
      .withIndex("by_code", (q: any) => q.eq("code", pharmacy.subscriptionTier))
      .unique();

    const paymentToken = generateRandomString(48);
    const paymentLinkExpiresAt = Date.now() + 72 * 60 * 60 * 1000;
    const amount = selectedPlan?.price || pharmacy.monthlyCost || 0;
    const currency = selectedPlan?.currency || "ETB";

    await ctx.db.patch(args.pharmacyId, {
      status: "active",
      paymentStatus: amount > 0 ? "pending_payment" : "paid",
      monthlyCost: amount,
      pendingPaymentLinkToken: amount > 0 ? paymentToken : undefined,
      pendingPaymentLinkSentAt: amount > 0 ? Date.now() : undefined,
      pendingPaymentLinkExpiresAt:
        amount > 0 ? paymentLinkExpiresAt : undefined,
    });
    await ctx.db.patch(owner._id, { status: "active", role: "owner" });

    if (amount > 0) {
      await ctx.db.insert("subscription_payment_links", {
        token: paymentToken,
        pharmacyId: args.pharmacyId,
        ownerUserId: owner._id,
        planCode: pharmacy.subscriptionTier,
        amount,
        currency,
        status: "pending",
        expiresAt: paymentLinkExpiresAt,
        createdAt: Date.now(),
      });
    }

    const settings = await ctx.db.query("site_settings").first();
    if (owner.email && settings?.resendApiKey && amount > 0) {
      const finishPaymentUrl = `${process.env.SITE_URL ?? "http://localhost:5173"}/subscription/finish-payment?token=${encodeURIComponent(paymentToken)}`;
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0f766e; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; background: #0f766e; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 600; }
    .meta { margin-top: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;">Your PharmaCare account is approved</h2>
    </div>
    <div class="content">
      <p>Hello ${owner.full_name || "there"},</p>
      <p>Your pharmacy application for <strong>${pharmacy.name}</strong> has been approved.</p>
      <p>To activate your subscription, please complete payment using the secure link below:</p>
      <p><a class="cta" href="${finishPaymentUrl}">Finish Payment</a></p>
      <div class="meta">
        <p style="margin:0;"><strong>Plan:</strong> ${pharmacy.subscriptionTier.toUpperCase()}</p>
        <p style="margin:0;"><strong>Amount:</strong> ${currency} ${amount}</p>
        <p style="margin:0;"><strong>Link expires:</strong> ${new Date(paymentLinkExpiresAt).toLocaleString()}</p>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      try {
        await ctx.runAction(internal.lib.email.sendEmail, {
          to: owner.email,
          subject: "Finish your PharmaCare subscription payment",
          html,
          apiKey: settings.resendApiKey,
          testMode: settings.testMode,
        });
      } catch (error) {
        await ctx.db.insert("audit_logs", {
          userId: admin._id,
          action: "subscription_payment_link_email_failed",
          entityId: args.pharmacyId,
          entityType: "pharmacy",
          details: `Approval completed but payment link email failed: ${String(error)}`,
          timestamp: Date.now(),
        });
      }
    }

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "approve_pharmacy_application",
      entityId: args.pharmacyId,
      entityType: "pharmacy",
      details: `Approved pharmacy application for ${pharmacy.name}`,
      timestamp: Date.now(),
    });

    return { success: true, pharmacyId: args.pharmacyId, ownerId: owner._id };
  },
});

export const resendSubscriptionPaymentLink = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) throw new Error("Pharmacy not found");

    const owner = await ctx.db.get(pharmacy.ownerId);
    if (!owner || !owner.email) {
      throw new Error("Owner email is not available");
    }

    const selectedPlan = await ctx.db
      .query("subscription_plans")
      .withIndex("by_code", (q: any) => q.eq("code", pharmacy.subscriptionTier))
      .unique();

    const amount = selectedPlan?.price || pharmacy.monthlyCost || 0;
    const currency = selectedPlan?.currency || "ETB";

    if (amount <= 0) {
      throw new Error(
        "This pharmacy does not require payment for the current plan",
      );
    }

    const existingPendingLinks = await ctx.db
      .query("subscription_payment_links")
      .withIndex("by_pharmacy", (q: any) => q.eq("pharmacyId", pharmacy._id))
      .take(50);

    await Promise.all(
      existingPendingLinks
        .filter((link: any) => link.status === "pending")
        .map((link: any) =>
          ctx.db.patch(link._id, {
            status: "cancelled",
          }),
        ),
    );

    const paymentToken = generateRandomString(48);
    const paymentLinkExpiresAt = Date.now() + 72 * 60 * 60 * 1000;

    await ctx.db.insert("subscription_payment_links", {
      token: paymentToken,
      pharmacyId: pharmacy._id,
      ownerUserId: owner._id,
      planCode: pharmacy.subscriptionTier,
      amount,
      currency,
      status: "pending",
      expiresAt: paymentLinkExpiresAt,
      createdAt: Date.now(),
    });

    await ctx.db.patch(pharmacy._id, {
      paymentStatus: "pending_payment",
      pendingPaymentLinkToken: paymentToken,
      pendingPaymentLinkSentAt: Date.now(),
      pendingPaymentLinkExpiresAt: paymentLinkExpiresAt,
      monthlyCost: amount,
    });

    const settings = await ctx.db.query("site_settings").first();
    if (!settings?.resendApiKey) {
      throw new Error("Email settings are not configured");
    }

    const finishPaymentUrl = `${process.env.SITE_URL ?? "http://localhost:5173"}/subscription/finish-payment?token=${encodeURIComponent(paymentToken)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0f766e; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; background: #0f766e; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 600; }
    .meta { margin-top: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;">Finish your PharmaCare subscription payment</h2>
    </div>
    <div class="content">
      <p>Hello ${owner.full_name || "there"},</p>
      <p>This is your updated payment link for <strong>${pharmacy.name}</strong>.</p>
      <p><a class="cta" href="${finishPaymentUrl}">Finish Payment</a></p>
      <div class="meta">
        <p style="margin:0;"><strong>Plan:</strong> ${pharmacy.subscriptionTier.toUpperCase()}</p>
        <p style="margin:0;"><strong>Amount:</strong> ${currency} ${amount}</p>
        <p style="margin:0;"><strong>Link expires:</strong> ${new Date(paymentLinkExpiresAt).toLocaleString()}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    await ctx.runAction(internal.lib.email.sendEmail, {
      to: owner.email,
      subject: "Updated finish-payment link for PharmaCare",
      html,
      apiKey: settings.resendApiKey,
      testMode: settings.testMode,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "resend_subscription_payment_link",
      entityId: pharmacy._id,
      entityType: "pharmacy",
      details: `Resent payment link to owner ${owner.email}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      paymentLinkExpiresAt,
      amount,
      currency,
      ownerEmail: owner.email,
    };
  },
});

export const rejectPharmacyApplication = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    reason: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) throw new Error("Pharmacy not found");

    const owner = await ctx.db.get(pharmacy.ownerId);
    if (!owner) throw new Error("Owner not found");

    await ctx.db.patch(args.pharmacyId, { status: "rejected" });
    await ctx.db.patch(owner._id, { status: "rejected" });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "reject_pharmacy_application",
      entityId: args.pharmacyId,
      entityType: "pharmacy",
      details: `Rejected pharmacy application for ${pharmacy.name}: ${args.reason}`,
      timestamp: Date.now(),
    });

    return { success: true, pharmacyId: args.pharmacyId, ownerId: owner._id };
  },
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
  },
});

export const activateBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, { status: "active" });
    return { success: true };
  },
});

export const deactivateBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, { status: "deactivated" });
    return { success: true };
  },
});

export const activateManager = mutation({
  args: { id: v.id("users") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, { status: "active" });
    return { success: true };
  },
});

export const deactivateManager = mutation({
  args: { id: v.id("users") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, { status: "deactivated" });
    return { success: true };
  },
});

export const createPharmacy = mutation({
  args: { name: v.string() },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
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

export const updatePharmacy = mutation({
  args: {
    id: v.id("pharmacies"),
    data: v.object({
      name: v.optional(v.string()),
      licenseCode: v.optional(v.string()),
      staffCount: v.optional(v.number()),
      subscriptionTier: v.optional(v.string()),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const pharmacy = await ctx.db.get(args.id);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    await ctx.db.patch(args.id, args.data);

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "update_pharmacy",
      entityId: args.id,
      entityType: "pharmacy",
      details: "Pharmacy updated by admin",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const updateBranch = mutation({
  args: {
    id: v.id("branches"),
    data: v.object({
      name: v.optional(v.string()),
      address: v.optional(v.string()),
      managerId: v.optional(v.id("users")),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const branch = await ctx.db.get(args.id);
    if (!branch) {
      throw new Error("Branch not found");
    }

    await ctx.db.patch(args.id, args.data);

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "update_branch",
      entityId: args.id,
      entityType: "branch",
      details: "Branch updated by admin",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const resetManagerPassword = mutation({
  args: {
    managerId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const manager = await ctx.db.get(args.managerId);
    if (!manager) {
      throw new Error("Manager not found");
    }

    // Note: Password reset is handled by Clerk
    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "password_reset",
      entityId: args.managerId,
      entityType: "user",
      details: `Password reset for manager: ${manager.email}`,
      timestamp: Date.now(),
    });

    return { success: true, message: "Password reset initiated via Clerk" };
  },
});

export const createSubscriptionPlan = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    price: v.number(),
    currency: v.optional(v.string()),
    features: v.array(v.string()),
    maxBranches: v.number(),
    maxUsers: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const normalizedCode = args.code.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(normalizedCode)) {
      throw new Error(
        "Subscription plan code must use lowercase letters, numbers, or hyphens",
      );
    }

    const existingPlan = await ctx.db
      .query("subscription_plans")
      .withIndex("by_code", (q: any) => q.eq("code", normalizedCode))
      .unique();
    if (existingPlan) {
      throw new Error("Subscription plan code already exists");
    }

    const planId = await ctx.db.insert("subscription_plans", {
      name: args.name,
      code: normalizedCode,
      price: args.price,
      currency: args.currency || "ETB",
      features: args.features,
      maxBranches: args.maxBranches,
      maxUsers: args.maxUsers,
      description: args.description,
      isActive: true,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "create_subscription_plan",
      entityId: planId,
      entityType: "subscription_plan",
      details: `Created subscription plan: ${args.name}`,
      timestamp: Date.now(),
    });

    return { success: true, planId };
  },
});

export const updateSubscriptionPlan = mutation({
  args: {
    id: v.id("subscription_plans"),
    data: v.object({
      name: v.optional(v.string()),
      code: v.optional(v.string()),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      maxBranches: v.optional(v.number()),
      maxUsers: v.optional(v.number()),
      description: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const plan = await ctx.db.get(args.id);
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    const DEFAULT_PLAN_CODES = new Set(["basic", "premium", "enterprise"]);
    const normalizedCode = args.data.code?.trim().toLowerCase();
    const codeChanged =
      typeof normalizedCode === "string" && normalizedCode !== plan.code;
    const isDefaultPlan = DEFAULT_PLAN_CODES.has(plan.code);

    if (typeof normalizedCode === "string" && normalizedCode.length === 0) {
      throw new Error("Subscription plan code cannot be empty");
    }

    if (
      typeof normalizedCode === "string" &&
      !/^[a-z0-9-]+$/.test(normalizedCode)
    ) {
      throw new Error(
        "Subscription plan code must use lowercase letters, numbers, or hyphens",
      );
    }

    if (codeChanged && isDefaultPlan) {
      throw new Error("Default system plan codes cannot be changed");
    }

    if (codeChanged && normalizedCode) {
      const existingPlan = await ctx.db
        .query("subscription_plans")
        .withIndex("by_code", (q: any) => q.eq("code", normalizedCode))
        .unique();

      if (existingPlan && existingPlan._id !== plan._id) {
        throw new Error("Subscription plan code already exists");
      }
    }

    const patchData = {
      ...args.data,
      code: normalizedCode ?? args.data.code,
    };

    await ctx.db.patch(args.id, patchData);

    let remappedPharmacies = 0;
    if (codeChanged && normalizedCode) {
      const pharmaciesUsingOldCode = await ctx.db
        .query("pharmacies")
        .filter((q: any) => q.eq(q.field("subscriptionTier"), plan.code))
        .collect();

      remappedPharmacies = pharmaciesUsingOldCode.length;
      for (const pharmacy of pharmaciesUsingOldCode) {
        await ctx.db.patch(pharmacy._id, {
          subscriptionTier: normalizedCode,
        });
      }
    }

    const auditDetails = codeChanged
      ? `Updated subscription plan: ${plan.name}. Code changed from ${plan.code} to ${normalizedCode}. Remapped ${remappedPharmacies} pharmacies.`
      : `Updated subscription plan: ${plan.name}`;

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "update_subscription_plan",
      entityId: args.id,
      entityType: "subscription_plan",
      details: auditDetails,
      timestamp: Date.now(),
    });

    return { success: true, remappedPharmacies };
  },
});

export const deleteSubscriptionPlan = mutation({
  args: { id: v.id("subscription_plans") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const plan = await ctx.db.get(args.id);
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    const pharmaciesUsingPlan = await ctx.db
      .query("pharmacies")
      .filter((q: any) => q.eq(q.field("subscriptionTier"), plan.code))
      .collect();

    if (pharmaciesUsingPlan.length > 0) {
      throw new Error(
        "Cannot delete plan. Pharmacies are currently using this subscription tier.",
      );
    }

    await ctx.db.delete(args.id);

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "delete_subscription_plan",
      entityId: args.id,
      entityType: "subscription_plan",
      details: `Deleted subscription plan: ${plan.name}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const ensureSubscriptionPlanTemplates = mutation({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const existingTemplates = await ctx.db
      .query("subscription_plan_templates")
      .take(10);

    if (existingTemplates.length > 0) {
      return { created: 0 };
    }

    const now = Date.now();
    const defaults = [
      {
        name: "Starter",
        description: "For small pharmacies getting started.",
        price: 1999,
        currency: "ETB",
        features: [
          "Basic inventory management",
          "Sales tracking",
          "Single branch support",
        ],
        maxBranches: 1,
        maxUsers: 8,
        isActiveDefault: true,
      },
      {
        name: "Growth",
        description: "For growing pharmacies with multiple teams.",
        price: 4999,
        currency: "ETB",
        features: [
          "Advanced reports",
          "Branch performance dashboard",
          "Role-based controls",
        ],
        maxBranches: 5,
        maxUsers: 35,
        isActiveDefault: true,
      },
      {
        name: "Scale",
        description: "For enterprise-scale pharmacy operations.",
        price: 9999,
        currency: "ETB",
        features: [
          "Unlimited branch analytics",
          "Advanced auditing",
          "Priority support workflows",
        ],
        maxBranches: 25,
        maxUsers: 120,
        isActiveDefault: true,
      },
    ];

    for (const template of defaults) {
      await ctx.db.insert("subscription_plan_templates", {
        ...template,
        isBuiltIn: true,
        createdBy: admin._id,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "seed_subscription_templates",
      entityId: "subscription_plan_templates",
      entityType: "subscription_plan_template",
      details: "Seeded default subscription plan templates",
      timestamp: now,
    });

    return { created: defaults.length };
  },
});

export const createSubscriptionPlanTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.optional(v.string()),
    features: v.array(v.string()),
    maxBranches: v.number(),
    maxUsers: v.number(),
    isActiveDefault: v.optional(v.boolean()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const now = Date.now();
    const templateId = await ctx.db.insert("subscription_plan_templates", {
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      price: args.price,
      currency: args.currency?.trim() || "ETB",
      features: args.features,
      maxBranches: args.maxBranches,
      maxUsers: args.maxUsers,
      isActiveDefault: args.isActiveDefault ?? true,
      isBuiltIn: false,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "create_subscription_plan_template",
      entityId: String(templateId),
      entityType: "subscription_plan_template",
      details: `Created template: ${args.name}`,
      timestamp: now,
    });

    return { success: true, templateId };
  },
});

export const updateSubscriptionPlanTemplate = mutation({
  args: {
    id: v.id("subscription_plan_templates"),
    data: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      maxBranches: v.optional(v.number()),
      maxUsers: v.optional(v.number()),
      isActiveDefault: v.optional(v.boolean()),
    }),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Subscription template not found");
    }

    await ctx.db.patch(args.id, {
      ...args.data,
      name: args.data.name?.trim(),
      description: args.data.description?.trim(),
      currency: args.data.currency?.trim(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "update_subscription_plan_template",
      entityId: String(args.id),
      entityType: "subscription_plan_template",
      details: `Updated template: ${template.name}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const deleteSubscriptionPlanTemplate = mutation({
  args: {
    id: v.id("subscription_plan_templates"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Subscription template not found");
    }

    if (template.isBuiltIn) {
      throw new Error("Built-in templates cannot be deleted");
    }

    await ctx.db.delete(args.id);

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "delete_subscription_plan_template",
      entityId: String(args.id),
      entityType: "subscription_plan_template",
      details: `Deleted template: ${template.name}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const updatePharmacySubscription = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    newTier: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const newPlan = await ctx.db
      .query("subscription_plans")
      .filter((q: any) => q.eq(q.field("code"), args.newTier))
      .first();

    if (!newPlan) {
      throw new Error("Subscription plan not found");
    }

    const oldTier = pharmacy.subscriptionTier;

    let changeType = "initial";
    if (oldTier && oldTier !== args.newTier) {
      if (
        oldTier === "basic" &&
        (args.newTier === "premium" || args.newTier === "enterprise")
      ) {
        changeType = "upgrade";
      } else if (oldTier === "premium" && args.newTier === "enterprise") {
        changeType = "upgrade";
      } else if (
        oldTier === "enterprise" &&
        (args.newTier === "premium" || args.newTier === "basic")
      ) {
        changeType = "downgrade";
      } else if (oldTier === "premium" && args.newTier === "basic") {
        changeType = "downgrade";
      } else {
        changeType = "renewal";
      }
    }

    await ctx.db.patch(args.pharmacyId, {
      subscriptionTier: args.newTier,
    });

    await ctx.db.insert("subscription_history", {
      pharmacyId: args.pharmacyId,
      oldTier: oldTier || null,
      newTier: args.newTier,
      changeType,
      price: newPlan.price,
      currency: newPlan.currency || "ETB",
      changedBy: admin._id,
      reason: args.reason,
      effectiveDate: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "update_subscription",
      entityId: args.pharmacyId,
      entityType: "pharmacy",
      details: `Updated pharmacy subscription from ${oldTier} to ${args.newTier}`,
      timestamp: Date.now(),
    });

    const owner = pharmacy.ownerId ? await ctx.db.get(pharmacy.ownerId) : null;
    const formatTier = (tier?: string | null) => {
      if (!tier) return "Unknown";
      return tier.charAt(0).toUpperCase() + tier.slice(1);
    };
    const trimmedReason = args.reason?.trim();
    const reasonSuffix = trimmedReason ? ` Reason: ${trimmedReason}` : "";

    if (owner) {
      const notificationMessage = `Your subscription has been updated from ${formatTier(oldTier)} to ${formatTier(args.newTier)} (${changeType}).${reasonSuffix}`;

      await ctx.db.insert("notifications", {
        userId: owner._id,
        pharmacyId: args.pharmacyId,
        title: "Subscription Updated",
        message: notificationMessage,
        type: "info",
        priority: "high",
        read: false,
        createdAt: Date.now(),
      });

      const settings = await ctx.db.query("site_settings").first();
      if (owner.email && settings?.resendApiKey) {
        const subject = "Your PharmaCare subscription has been updated";
        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0f766e; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; }
    .summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 16px 0; }
    .muted { color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;">PharmaCare Subscription Update</h2>
    </div>
    <div class="content">
      <p>Hello ${owner.full_name || "there"},</p>
      <p>Your pharmacy subscription has been updated by the system administrator.</p>
      <div class="summary">
        <p style="margin:0;"><strong>Pharmacy:</strong> ${pharmacy.name}</p>
        <p style="margin:0;"><strong>Previous Plan:</strong> ${formatTier(oldTier)}</p>
        <p style="margin:0;"><strong>New Plan:</strong> ${formatTier(args.newTier)}</p>
        <p style="margin:0;"><strong>Change Type:</strong> ${formatTier(changeType)}</p>
        ${trimmedReason ? `<p style="margin:0;"><strong>Reason:</strong> ${trimmedReason}</p>` : ""}
      </div>
      <p class="muted">If you have questions about this update, please contact support.</p>
    </div>
  </div>
</body>
</html>
        `;

        try {
          await ctx.runAction(internal.lib.email.sendEmail, {
            to: owner.email,
            subject,
            html,
            apiKey: settings.resendApiKey,
            testMode: settings.testMode,
          });
        } catch (error) {
          await ctx.db.insert("audit_logs", {
            userId: admin._id,
            action: "subscription_update_email_failed",
            entityId: args.pharmacyId,
            entityType: "pharmacy",
            details: `Subscription updated but owner email failed: ${String(error)}`,
            timestamp: Date.now(),
          });
        }
      }
    }

    return { success: true, changeType, newPrice: newPlan.price };
  },
});

export const getPharmacyPlanUsage = mutation({
  args: { pharmacyId: v.id("pharmacies") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const subscriptionPlan = await ctx.db
      .query("subscription_plans")
      .filter((q: any) => q.eq(q.field("code"), pharmacy.subscriptionTier))
      .first();

    const branches = await ctx.db
      .query("branches")
      .filter((q: any) => q.eq(q.field("pharmacyId"), args.pharmacyId))
      .collect();

    const users = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("pharmacyId"), args.pharmacyId))
      .collect();

    return {
      branchesUsed: branches.length,
      branchesAllowed: subscriptionPlan?.maxBranches || 0,
      usersUsed: users.length,
      usersAllowed: subscriptionPlan?.maxUsers || 0,
      isOverLimit: {
        branches: branches.length > (subscriptionPlan?.maxBranches || 0),
        users: users.length > (subscriptionPlan?.maxUsers || 0),
      },
    };
  },
});

export const flagManager = mutation({
  args: {
    managerId: v.id("users"),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || !hasPermission(admin, Permission.FLAG_MANAGERS)) {
      throw new Error("Unauthorized: Admin only");
    }

    const manager = await ctx.db.get(args.managerId);
    if (!manager || manager.role !== "manager") {
      throw new Error("Manager not found");
    }

    await ctx.db.patch(args.managerId, {
      adminFlagged: true,
    });

    await ctx.db.insert("manager_flags", {
      managerId: args.managerId,
      adminId: admin._id,
      reason: args.reason,
      notes: args.notes || null,
      isActive: true,
      createdAt: Date.now(),
      resolvedAt: null,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "flag_manager",
      entityId: args.managerId,
      entityType: "user",
      details: `Flagged manager: ${manager.full_name} - ${args.reason}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const temporaryLockManager = mutation({
  args: {
    managerId: v.id("users"),
    reason: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || !hasPermission(admin, Permission.TEMPORARY_LOCK_MANAGERS)) {
      throw new Error("Unauthorized: Admin only");
    }

    const manager = await ctx.db.get(args.managerId);
    if (!manager || manager.role !== "manager") {
      throw new Error("Manager not found");
    }

    const lockPlacedAt = Date.now();
    const lockExpiresAt = lockPlacedAt + args.duration * 60 * 60 * 1000;

    await ctx.db.patch(args.managerId, {
      adminLocked: true,
      adminLockReason: args.reason,
      lockPlacedAt,
      lockExpiresAt,
    });

    await ctx.db.insert("admin_actions", {
      adminId: admin._id,
      actionType: "temp_lock",
      targetUserId: args.managerId,
      targetEntityType: "user",
      reason: args.reason,
      notes: args.notes || null,
      metadata: {
        durationHours: args.duration,
        lockPlacedAt,
        lockExpiresAt,
      },
      performedAt: lockPlacedAt,
      expiresAt: lockExpiresAt,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "temp_lock_manager",
      entityId: args.managerId,
      entityType: "user",
      details: `Locked manager for ${args.duration} hours: ${manager.full_name} - ${args.reason}`,
      timestamp: lockPlacedAt,
    });

    return { success: true, lockExpiresAt };
  },
});

export const flagStaff = mutation({
  args: {
    staffId: v.id("users"),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const staff = await ctx.db.get(args.staffId);
    if (!staff || !["cashier", "pharmacist"].includes(staff.role)) {
      throw new Error("Staff not found");
    }

    await ctx.db.patch(args.staffId, {
      adminFlagged: true,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "flag_staff",
      entityId: args.staffId,
      entityType: "user",
      details: `Flagged staff: ${staff.full_name} - ${args.reason}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const temporaryLockStaff = mutation({
  args: {
    staffId: v.id("users"),
    reason: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const staff = await ctx.db.get(args.staffId);
    if (!staff || !["cashier", "pharmacist"].includes(staff.role)) {
      throw new Error("Staff not found");
    }

    const lockPlacedAt = Date.now();
    const lockExpiresAt = lockPlacedAt + args.duration * 60 * 60 * 1000;

    await ctx.db.patch(args.staffId, {
      adminLocked: true,
      adminLockReason: args.reason,
      lockPlacedAt,
      lockExpiresAt,
    });

    await ctx.db.insert("admin_actions", {
      adminId: admin._id,
      actionType: "temp_lock",
      targetUserId: args.staffId,
      targetEntityType: "user",
      reason: args.reason,
      notes: args.notes || null,
      metadata: {
        durationHours: args.duration,
        lockPlacedAt,
        lockExpiresAt,
      },
      performedAt: lockPlacedAt,
      expiresAt: lockExpiresAt,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "temp_lock_staff",
      entityId: args.staffId,
      entityType: "user",
      details: `Locked staff for ${args.duration} hours: ${staff.full_name} - ${args.reason}`,
      timestamp: lockPlacedAt,
    });

    return { success: true, lockExpiresAt };
  },
});

export const liftLock = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      adminLocked: false,
      adminLockReason: null,
      lockPlacedAt: null,
      lockExpiresAt: null,
      lockLiftedBy: admin._id,
      lockLiftedAt: Date.now(),
    });

    await ctx.db.insert("admin_actions", {
      adminId: admin._id,
      actionType: "lift_lock",
      targetUserId: args.userId,
      targetEntityType: "user",
      reason: args.reason,
      notes: null,
      metadata: {},
      performedAt: Date.now(),
      expiresAt: null,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "lift_lock",
      entityId: args.userId,
      entityType: "user",
      details: `Lifted lock from user: ${user.full_name} - ${args.reason}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const sendAdminBroadcast = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    targetAudience: v.string(),
    priority: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || !hasPermission(admin, Permission.SEND_ADMIN_BROADCASTS)) {
      throw new Error("Unauthorized: Admin only");
    }

    const expiresAt = args.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("admin_broadcasts", {
      adminId: admin._id,
      title: args.title,
      message: args.message,
      targetAudience: args.targetAudience,
      priority: args.priority,
      sentAt: Date.now(),
      expiresAt,
      isActive: true,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "send_broadcast",
      entityId: null,
      entityType: "broadcast",
      details: `Sent broadcast to ${args.targetAudience}: ${args.title}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const suspendPharmacy = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || !hasPermission(admin, Permission.SUSPEND_PHARMACIES)) {
      throw new Error("Unauthorized: Admin only");
    }

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    await ctx.db.patch(args.pharmacyId, {
      status: "suspended",
    });

    await ctx.db.insert("admin_actions", {
      adminId: admin._id,
      actionType: "suspend_pharmacy",
      targetUserId: pharmacy.ownerId,
      targetEntityType: "pharmacy",
      reason: args.reason,
      notes: args.notes || null,
      metadata: {},
      performedAt: Date.now(),
      expiresAt: null,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "suspend_pharmacy",
      entityId: args.pharmacyId,
      entityType: "pharmacy",
      details: `Suspended pharmacy: ${pharmacy.name} - ${args.reason}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const startDiagnosticSession = mutation({
  args: {
    targetUserId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || !hasPermission(admin, Permission.START_DIAGNOSTIC_SESSIONS)) {
      throw new Error("Unauthorized: Admin only");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const sessionId = await ctx.db.insert("diagnostic_sessions", {
      adminId: admin._id,
      targetUserId: args.targetUserId,
      reason: args.reason,
      startedAt: Date.now(),
      endedAt: null,
      pagesViewed: [],
      blockedActions: [],
      isActive: true,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "start_diagnostic",
      entityId: sessionId,
      entityType: "diagnostic_session",
      details: `Started diagnostic session for user: ${targetUser.full_name}`,
      timestamp: Date.now(),
    });

    return { success: true, sessionId };
  },
});

export const endDiagnosticSession = mutation({
  args: {
    sessionId: v.id("diagnostic_sessions"),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      endedAt: Date.now(),
      isActive: false,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "end_diagnostic",
      entityId: args.sessionId,
      entityType: "diagnostic_session",
      details: `Ended diagnostic session`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const exportAuditLogs = mutation({
  args: {
    filters: v.object({
      category: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      entityType: v.optional(v.string()),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    let logsQuery = ctx.db.query("audit_logs");

    if (args.filters.startDate) {
      logsQuery = logsQuery.filter((q: any) =>
        q.gte(q.field("timestamp"), args.filters.startDate),
      );
    }

    if (args.filters.endDate) {
      logsQuery = logsQuery.filter((q: any) =>
        q.lte(q.field("timestamp"), args.filters.endDate),
      );
    }

    const logs = await logsQuery.collect();

    const exportId = await ctx.db.insert("audit_log_exports", {
      requestedBy: admin._id,
      filters: args.filters,
      status: "completed",
      requestedAt: Date.now(),
      completedAt: Date.now(),
      logCount: logs.length,
      downloadUrl: null,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "export_audit_logs",
      entityId: exportId,
      entityType: "audit_log_export",
      details: `Exported ${logs.length} audit logs`,
      timestamp: Date.now(),
    });

    return { success: true, exportId, logCount: logs.length };
  },
});

export const resolveEscalation = mutation({
  args: {
    escalationId: v.id("ai_escalations"),
    resolution: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const escalation = await ctx.db.get(args.escalationId);
    if (!escalation) {
      throw new Error("Escalation not found");
    }

    await ctx.db.patch(args.escalationId, {
      status: "resolved",
      resolvedBy: admin._id,
      resolvedAt: Date.now(),
      resolution: args.resolution,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "resolve_escalation",
      entityId: args.escalationId,
      entityType: "ai_escalation",
      details: `Resolved AI escalation: ${args.resolution}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const reviewManagerFlagAppeal = mutation({
  args: {
    flagId: v.id("manager_flags"),
    decision: v.string(), // "approve" (dismiss flag) or "reject" (keep flag)
    reason: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const flag = await ctx.db.get(args.flagId);
    if (!flag) {
      throw new Error("Flag not found");
    }

    const manager = await ctx.db.get(flag.managerId);
    const pharmacy = manager?.pharmacyId
      ? await ctx.db.get(manager.pharmacyId)
      : null;

    if (args.decision === "approve") {
      await ctx.db.patch(args.flagId, {
        status: "dismissed",
      });

      await ctx.db.insert("notifications", {
        userId: flag.managerId,
        pharmacyId: pharmacy?._id,
        title: "Flag Dismissed",
        message: `Your flag has been dismissed following your appeal. Admin reason: ${args.reason}`,
        type: "success",
        priority: "medium",
        read: false,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.flagId, {
        status: "reviewed",
      });

      await ctx.db.insert("notifications", {
        userId: flag.managerId,
        pharmacyId: pharmacy?._id,
        title: "Flag Appeal Rejected",
        message: `Your appeal has been reviewed and the flag remains. Admin reason: ${args.reason}`,
        type: "error",
        priority: "high",
        read: false,
        createdAt: Date.now(),
      });
    }

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "review_manager_flag_appeal",
      entityId: args.flagId,
      entityType: "manager_flag",
      details: `Admin ${args.decision}d appeal with reason: ${args.reason}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const createPharmacyAndBranch = mutation({
  args: {
    name: v.string(),
    licenseCode: v.string(),
    location: v.string(),
    managerEmail: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    // Create pharmacy
    const pharmacyId = await ctx.db.insert("pharmacies", {
      name: args.name,
      licenseCode: args.licenseCode,
      staffCount: 0,
      subscriptionTier: "basic",
      status: "active",
      ownerId: admin._id,
    });

    // Create the first branch
    const branchId = await ctx.db.insert("branches", {
      pharmacyId: pharmacyId,
      name: "Main Branch",
      address: args.location,
      status: "active",
      managerId: null,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "create_pharmacy_and_branch",
      entityId: pharmacyId,
      entityType: "pharmacy",
      details: `Created pharmacy and branch for ${args.name}`,
      timestamp: Date.now(),
    });

    return { success: true, pharmacyId, branchId };
  },
});

export const addBranch = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    name: v.string(),
    address: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const branchId = await ctx.db.insert("branches", {
      pharmacyId: args.pharmacyId,
      name: args.name,
      address: args.address,
      status: "active",
      managerId: null,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "add_branch",
      entityId: branchId,
      entityType: "branch",
      details: `Added branch ${args.name} to pharmacy`,
      timestamp: Date.now(),
    });

    return { success: true, branchId };
  },
});

export const reviewAdminActionAppeal = mutation({
  args: {
    actionId: v.id("admin_actions"),
    decision: v.string(), // "lift" (remove action) or "maintain" (keep action)
    reason: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const action = await ctx.db.get(args.actionId);
    if (!action) {
      throw new Error("Action not found");
    }

    const pharmacy = action.targetPharmacyId
      ? await ctx.db.get(action.targetPharmacyId)
      : null;
    const owner = pharmacy?.ownerId ? await ctx.db.get(pharmacy.ownerId) : null;

    if (args.decision === "lift") {
      await ctx.db.patch(args.actionId, {
        actionStatus: "lifted_by_admin",
      });

      if (action.actionType === "flag_for_review") {
        await ctx.db.patch(action.targetUserId, {
          adminFlagged: false,
          adminFlagReason: undefined,
        });
      } else if (action.actionType === "temporary_lock") {
        await ctx.db.patch(action.targetUserId, {
          adminLocked: false,
          adminLockReason: undefined,
          lockLiftedBy: admin._id,
          lockLiftedAt: Date.now(),
        });
      }

      await ctx.db.insert("notifications", {
        userId: owner?._id || action.targetUserId,
        pharmacyId: pharmacy?._id,
        title: "Action Lifted",
        message: `The admin action has been lifted following your appeal. Admin reason: ${args.reason}`,
        type: "success",
        priority: "medium",
        read: false,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notifications", {
        userId: owner?._id || action.targetUserId,
        pharmacyId: pharmacy?._id,
        title: "Appeal Rejected",
        message: `Your appeal has been reviewed and the action remains. Admin reason: ${args.reason}`,
        type: "error",
        priority: "high",
        read: false,
        createdAt: Date.now(),
      });
    }

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "review_admin_action_appeal",
      entityId: args.actionId,
      entityType: "admin_action",
      details: `Admin ${args.decision}ed action with reason: ${args.reason}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
