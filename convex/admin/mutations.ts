// @ts-ignore
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { hasPermission, Permission } from "../lib/permissions";
import { requireAdmin } from "../lib/auth";
import { generateRandomString } from "../lib/utils";
import { DEFAULT_SIGNUP_PLANS } from "../subscription/defaultPlans";

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
    // 1. Create the pending user record so related entities can reference it.
    const userId = await ctx.db.insert("users", {
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
      status: "approved",
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
    const reason = args.reason.trim();
    if (!reason) {
      throw new Error("Rejection reason is required");
    }

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) throw new Error("Pharmacy not found");

    const owner = await ctx.db.get(pharmacy.ownerId);
    if (!owner) throw new Error("Owner not found");

    const now = Date.now();
    const retentionUntil = now + 365 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("rejected_owner_applications", {
      ownerEmail: String(owner.email || "")
        .trim()
        .toLowerCase(),
      ownerName: owner.full_name,
      ownerPhone: owner.phone,
      pharmacyName: pharmacy.name,
      pharmacyEmail: pharmacy.pharmacyEmail,
      licenseCode: pharmacy.licenseCode,
      signupLocation: pharmacy.signupLocation,
      rejectionReason: reason,
      rejectedAt: now,
      retentionUntil,
      rejectedByAdminId: admin._id,
      sourceOwnerId: String(owner._id),
      sourcePharmacyId: String(pharmacy._id),
    });

    const branches = await ctx.db
      .query("branches")
      .withIndex("by_pharmacy", (q: any) => q.eq("pharmacyId", pharmacy._id))
      .take(2000);
    for (const branch of branches) {
      await ctx.db.delete(branch._id);
    }

    const paymentLinks = await ctx.db
      .query("subscription_payment_links")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", owner._id))
      .take(2000);
    for (const link of paymentLinks) {
      await ctx.db.delete(link._id);
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q: any) => q.eq("userId", owner._id))
      .take(2000);
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    const paymentMethods = await ctx.db
      .query("payment_methods")
      .withIndex("by_user", (q: any) => q.eq("userId", owner._id))
      .take(2000);
    for (const method of paymentMethods) {
      await ctx.db.delete(method._id);
    }

    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("by_user_id", (q: any) => q.eq("userId", owner._id))
      .take(2000);
    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    const authSessions = await ctx.db
      .query("authSessions")
      .withIndex("by_user_id", (q: any) => q.eq("userId", owner._id))
      .take(2000);
    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }

    const allOwnerMessages = await ctx.db.query("owner_messages").take(5000);
    const ownerMessages = allOwnerMessages.filter(
      (message: any) =>
        String(message.senderId) === String(owner._id) ||
        String(message.targetUserId || "") === String(owner._id) ||
        (Array.isArray(message.deliveryStatus) &&
          message.deliveryStatus.some(
            (delivery: any) => String(delivery.userId) === String(owner._id),
          )),
    );
    for (const message of ownerMessages) {
      await ctx.db.delete(message._id);
    }

    const verificationTokens = await ctx.db
      .query("authVerificationTokens")
      .withIndex("by_identifier", (q: any) =>
        q.eq(
          "identifier",
          String(owner.email || "")
            .trim()
            .toLowerCase(),
        ),
      )
      .take(2000);
    for (const token of verificationTokens) {
      await ctx.db.delete(token._id);
    }

    await ctx.db.delete(pharmacy._id);
    await ctx.db.delete(owner._id);

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "reject_pharmacy_application",
      entityId: args.pharmacyId,
      entityType: "pharmacy",
      details: `Rejected and deleted pharmacy application for ${pharmacy.name}: ${reason}`,
      timestamp: now,
    });

    return { success: true, pharmacyId: args.pharmacyId, ownerId: owner._id };
  },
});

export const cleanupLegacyRejectedOwnerStates = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    dryRun: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const dryRun = args.dryRun ?? true;
    const limit = Math.max(1, Math.min(args.limit ?? 200, 1000));
    const now = Date.now();
    const retentionUntil = now + 365 * 24 * 60 * 60 * 1000;

    const normalizeStatus = (status: unknown): string =>
      typeof status === "string" ? status.trim().toLowerCase() : "";

    const recentAuditLogs = await ctx.db
      .query("audit_logs")
      .order("desc")
      .take(5000);

    const rejectedOwners = await ctx.db
      .query("users")
      .withIndex("by_status", (q: any) => q.eq("status", "rejected"))
      .take(limit);

    const stats = {
      dryRun,
      scannedRejectedOwners: 0,
      cleanedOwners: 0,
      skippedOwners: 0,
      historyRecordsCreated: 0,
      deletedBranches: 0,
      deletedPharmacies: 0,
      deletedUsers: 0,
      deletedAuthSessions: 0,
      deletedAuthAccounts: 0,
      deletedNotifications: 0,
      deletedPaymentMethods: 0,
      deletedOwnerMessages: 0,
      deletedPaymentLinks: 0,
      deletedVerificationTokens: 0,
      deletedOrphanRejectedPharmacies: 0,
      previewOwners: [] as Array<{
        ownerId: string;
        ownerEmail: string;
        ownerName?: string;
        ownerPhone?: string;
        ownerStatus: string;
        pharmacyId?: string;
        pharmacyName?: string;
        pharmacyEmail?: string;
        pharmacyStatus?: string;
        licenseCode?: string;
        signupLocation?: string;
        plannedBranchLocations?: string[];
        rejectionReason: string;
        rejectedAt: number;
        historyAlreadyExists: boolean;
        historyWillBeCreated: boolean;
        retentionUntil: number;
      }>,
    };

    for (const owner of rejectedOwners) {
      if (owner.role !== "owner") {
        continue;
      }

      stats.scannedRejectedOwners += 1;

      const pharmacy = owner.pharmacyId
        ? await ctx.db.get(owner.pharmacyId)
        : null;
      const pharmacyIsRejected =
        !pharmacy || normalizeStatus(pharmacy.status) === "rejected";

      if (!pharmacyIsRejected) {
        stats.skippedOwners += 1;
        continue;
      }

      const ownerEmail = String(owner.email || "")
        .trim()
        .toLowerCase();
      const matchingAudit = recentAuditLogs.find(
        (log: any) =>
          log.action === "reject_pharmacy_application" &&
          (log.entityId === String(pharmacy?._id) ||
            String(log.details || "")
              .toLowerCase()
              .includes(ownerEmail)),
      );
      const parsedReason = (() => {
        const details = String(matchingAudit?.details || "");
        const parts = details.split(":");
        if (parts.length < 2) return "Application rejected by admin review";
        return (
          parts.slice(1).join(":").trim() ||
          "Application rejected by admin review"
        );
      })();

      let historyAlreadyExists = false;
      let historyWillBeCreated = false;

      if (ownerEmail) {
        const existingHistoryForEmail = await ctx.db
          .query("rejected_owner_applications")
          .withIndex("by_owner_email", (q: any) =>
            q.eq("ownerEmail", ownerEmail),
          )
          .take(50);
        const duplicate = existingHistoryForEmail.some(
          (row: any) =>
            row.sourceOwnerId === String(owner._id) &&
            row.sourcePharmacyId === String(pharmacy?._id || ""),
        );
        historyAlreadyExists = duplicate;
        historyWillBeCreated = !duplicate;

        if (!duplicate) {
          stats.historyRecordsCreated += 1;
          if (!dryRun) {
            await ctx.db.insert("rejected_owner_applications", {
              ownerEmail,
              ownerName: owner.full_name,
              ownerPhone: owner.phone,
              pharmacyName: pharmacy?.name,
              pharmacyEmail: pharmacy?.pharmacyEmail,
              licenseCode: pharmacy?.licenseCode,
              signupLocation: pharmacy?.signupLocation,
              rejectionReason: parsedReason,
              rejectedAt: matchingAudit?.timestamp || now,
              retentionUntil,
              rejectedByAdminId: admin._id,
              sourceOwnerId: String(owner._id),
              sourcePharmacyId: String(pharmacy?._id || ""),
            });
          }
        }
      }

      if (stats.previewOwners.length < 300) {
        stats.previewOwners.push({
          ownerId: String(owner._id),
          ownerEmail,
          ownerName: owner.full_name,
          ownerPhone: owner.phone,
          ownerStatus: normalizeStatus(owner.status),
          pharmacyId: pharmacy?._id ? String(pharmacy._id) : undefined,
          pharmacyName: pharmacy?.name,
          pharmacyEmail: pharmacy?.pharmacyEmail,
          pharmacyStatus: normalizeStatus(pharmacy?.status),
          licenseCode: pharmacy?.licenseCode,
          signupLocation: pharmacy?.signupLocation,
          plannedBranchLocations: pharmacy?.plannedBranchLocations,
          rejectionReason: parsedReason,
          rejectedAt: matchingAudit?.timestamp || now,
          historyAlreadyExists,
          historyWillBeCreated,
          retentionUntil,
        });
      }

      if (pharmacy) {
        const branches = await ctx.db
          .query("branches")
          .withIndex("by_pharmacy", (q: any) =>
            q.eq("pharmacyId", pharmacy._id),
          )
          .take(2000);
        stats.deletedBranches += branches.length;
        if (!dryRun) {
          for (const branch of branches) {
            await ctx.db.delete(branch._id);
          }
        }
      }

      const paymentLinks = await ctx.db
        .query("subscription_payment_links")
        .withIndex("by_owner", (q: any) => q.eq("ownerUserId", owner._id))
        .take(2000);
      stats.deletedPaymentLinks += paymentLinks.length;
      if (!dryRun) {
        for (const link of paymentLinks) {
          await ctx.db.delete(link._id);
        }
      }

      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q: any) => q.eq("userId", owner._id))
        .take(2000);
      stats.deletedNotifications += notifications.length;
      if (!dryRun) {
        for (const notification of notifications) {
          await ctx.db.delete(notification._id);
        }
      }

      const paymentMethods = await ctx.db
        .query("payment_methods")
        .withIndex("by_user", (q: any) => q.eq("userId", owner._id))
        .take(2000);
      stats.deletedPaymentMethods += paymentMethods.length;
      if (!dryRun) {
        for (const method of paymentMethods) {
          await ctx.db.delete(method._id);
        }
      }

      const authAccounts = await ctx.db
        .query("authAccounts")
        .withIndex("by_user_id", (q: any) => q.eq("userId", owner._id))
        .take(2000);
      stats.deletedAuthAccounts += authAccounts.length;
      if (!dryRun) {
        for (const account of authAccounts) {
          await ctx.db.delete(account._id);
        }
      }

      const authSessions = await ctx.db
        .query("authSessions")
        .withIndex("by_user_id", (q: any) => q.eq("userId", owner._id))
        .take(2000);
      stats.deletedAuthSessions += authSessions.length;
      if (!dryRun) {
        for (const session of authSessions) {
          await ctx.db.delete(session._id);
        }
      }

      const allOwnerMessages = await ctx.db.query("owner_messages").take(5000);
      const ownerMessages = allOwnerMessages.filter(
        (message: any) =>
          String(message.senderId) === String(owner._id) ||
          String(message.targetUserId || "") === String(owner._id) ||
          (Array.isArray(message.deliveryStatus) &&
            message.deliveryStatus.some(
              (delivery: any) => String(delivery.userId) === String(owner._id),
            )),
      );
      stats.deletedOwnerMessages += ownerMessages.length;
      if (!dryRun) {
        for (const message of ownerMessages) {
          await ctx.db.delete(message._id);
        }
      }

      if (ownerEmail) {
        const verificationTokens = await ctx.db
          .query("authVerificationTokens")
          .withIndex("by_identifier", (q: any) =>
            q.eq("identifier", ownerEmail),
          )
          .take(2000);
        stats.deletedVerificationTokens += verificationTokens.length;
        if (!dryRun) {
          for (const token of verificationTokens) {
            await ctx.db.delete(token._id);
          }
        }
      }

      if (pharmacy) {
        stats.deletedPharmacies += 1;
        if (!dryRun) {
          await ctx.db.delete(pharmacy._id);
        }
      }

      stats.deletedUsers += 1;
      if (!dryRun) {
        await ctx.db.delete(owner._id);
      }

      stats.cleanedOwners += 1;
    }

    const rejectedPharmacies = await ctx.db
      .query("pharmacies")
      .filter((q: any) => q.eq(q.field("status"), "rejected"))
      .take(limit);

    for (const pharmacy of rejectedPharmacies) {
      const owner = pharmacy.ownerId
        ? await ctx.db.get(pharmacy.ownerId)
        : null;
      if (owner) {
        continue;
      }
      stats.deletedOrphanRejectedPharmacies += 1;
      if (!dryRun) {
        await ctx.db.delete(pharmacy._id);
      }
    }

    if (!dryRun) {
      await ctx.db.insert("audit_logs", {
        userId: admin._id,
        action: "cleanup_legacy_rejected_owner_states",
        entityId: String(admin._id),
        entityType: "maintenance",
        details: `Cleaned ${stats.cleanedOwners} rejected owner states and ${stats.deletedOrphanRejectedPharmacies} orphan rejected pharmacies`,
        timestamp: now,
      });
    }

    return stats;
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

    // Password reset workflow is handled via the platform auth flow.
    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "password_reset",
      entityId: args.managerId,
      entityType: "user",
      details: `Password reset for manager: ${manager.email}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: "Password reset request has been recorded",
    };
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
      currency: "ETB",
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
      currency: "ETB",
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
      currency: "ETB",
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
      currency: "ETB",
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

export const normalizeSubscriptionCurrenciesToETB = mutation({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const plans = await ctx.db.query("subscription_plans").take(1000);
    const templates = await ctx.db
      .query("subscription_plan_templates")
      .take(1000);

    let plansUpdated = 0;
    for (const plan of plans) {
      if (plan.currency !== "ETB") {
        await ctx.db.patch(plan._id, { currency: "ETB" });
        plansUpdated += 1;
      }
    }

    let templatesUpdated = 0;
    for (const template of templates) {
      if (template.currency !== "ETB") {
        await ctx.db.patch(template._id, { currency: "ETB" });
        templatesUpdated += 1;
      }
    }

    if (plansUpdated > 0 || templatesUpdated > 0) {
      await ctx.db.insert("audit_logs", {
        userId: admin._id,
        action: "normalize_subscription_currency_etb",
        entityId: "subscription_currency",
        entityType: "subscription_plan",
        details: `Normalized currency to ETB for ${plansUpdated} plans and ${templatesUpdated} templates.`,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      plansUpdated,
      templatesUpdated,
    };
  },
});

export const syncPlansFromSignupDefaults = mutation({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const existingPlans = await ctx.db.query("subscription_plans").take(1000);
    const planByCode = new Map<string, any>(
      existingPlans.map((plan: any) => [
        String(plan.code || "").toLowerCase(),
        plan,
      ]),
    );

    let created = 0;
    let updated = 0;

    for (const seed of DEFAULT_SIGNUP_PLANS) {
      const normalizedCode = seed.code.trim().toLowerCase();
      const existing = planByCode.get(normalizedCode);

      if (!existing) {
        await ctx.db.insert("subscription_plans", {
          name: seed.name,
          code: normalizedCode,
          price: seed.price,
          currency: "ETB",
          features: seed.features,
          maxBranches: seed.maxBranches,
          maxUsers: seed.maxUsers,
          description: seed.description,
          isActive: seed.isActive,
        });
        created += 1;
        continue;
      }

      await ctx.db.patch(existing._id, {
        name: seed.name,
        price: seed.price,
        currency: "ETB",
        features: seed.features,
        maxBranches: seed.maxBranches,
        maxUsers: seed.maxUsers,
        description: seed.description,
      });
      updated += 1;
    }

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "sync_subscription_plans_from_signup",
      entityId: "subscription_plans",
      entityType: "subscription_plan",
      details: `Synced plans from signup defaults. Created: ${created}, Updated: ${updated}.`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      created,
      updated,
      totalSynced: created + updated,
    };
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
    targetType: v.union(
      v.literal("all_users"),
      v.literal("all_owners"),
      v.literal("specific_plan"),
      v.literal("specific_pharmacy"),
    ),
    targetIds: v.optional(v.array(v.string())),
    messageType: v.union(
      v.literal("announcement"),
      v.literal("newsletter"),
      v.literal("compliance_alert"),
      v.literal("subscription_reminder"),
      v.literal("security_notice"),
    ),
    title: v.string(),
    message: v.string(),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
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

    const now = Date.now();
    const fallbackPriority =
      args.messageType === "compliance_alert" ||
      args.messageType === "security_notice"
        ? "high"
        : "medium";
    const priority = args.priority || fallbackPriority;

    const allPharmacies = await ctx.db.query("pharmacies").take(4000);
    const ownerToPharmacyId = new Map<string, any>();
    for (const pharmacy of allPharmacies) {
      ownerToPharmacyId.set(String(pharmacy.ownerId), pharmacy._id);
    }

    const resolveUserPharmacyId = (user: any) => {
      return user.pharmacyId || ownerToPharmacyId.get(String(user._id)) || null;
    };

    let recipients: any[] = [];
    let targetIds: string[] | undefined;
    let targetedPharmacyIds: Set<string> = new Set();

    if (args.targetType === "all_users") {
      const allUsers = await ctx.db.query("users").take(5000);
      recipients = allUsers.filter(
        (user: any) => user.status === "active" && user.role !== "admin",
      );
      targetedPharmacyIds = new Set(
        recipients
          .map((user: any) => resolveUserPharmacyId(user))
          .filter(Boolean)
          .map((id: any) => String(id)),
      );
    }

    if (args.targetType === "all_owners") {
      const owners = await ctx.db
        .query("users")
        .withIndex("by_role", (q: any) => q.eq("role", "owner"))
        .take(2000);
      recipients = owners.filter((owner: any) => owner.status === "active");
      targetedPharmacyIds = new Set(
        recipients
          .map((owner: any) => resolveUserPharmacyId(owner))
          .filter(Boolean)
          .map((id: any) => String(id)),
      );
    }

    if (args.targetType === "specific_plan") {
      const normalizedPlanCodes = (args.targetIds || [])
        .map((value: string) => value.trim().toLowerCase())
        .filter(Boolean);
      if (normalizedPlanCodes.length === 0) {
        throw new Error("Please select at least one subscription plan");
      }

      const planCodeSet = new Set(normalizedPlanCodes);
      const matchedPharmacies = allPharmacies.filter((pharmacy: any) =>
        planCodeSet.has(String(pharmacy.subscriptionTier || "").toLowerCase()),
      );
      const matchedPharmacyIds = new Set<string>(
        matchedPharmacies.map((pharmacy: any) => String(pharmacy._id)),
      );
      const matchedOwnerIds = new Set(
        matchedPharmacies.map((pharmacy: any) => String(pharmacy.ownerId)),
      );

      const allUsers = await ctx.db.query("users").take(5000);
      recipients = allUsers.filter((user: any) => {
        if (user.status !== "active" || user.role === "admin") {
          return false;
        }
        const userPharmacyId = resolveUserPharmacyId(user);
        return (
          (userPharmacyId && matchedPharmacyIds.has(String(userPharmacyId))) ||
          matchedOwnerIds.has(String(user._id))
        );
      });

      targetIds = normalizedPlanCodes;
      targetedPharmacyIds = new Set<string>(
        Array.from(matchedPharmacyIds).map((id) => String(id)),
      );
    }

    if (args.targetType === "specific_pharmacy") {
      const normalizedPharmacyIds = (args.targetIds || [])
        .map((value: string) => value.trim())
        .filter(Boolean);
      if (normalizedPharmacyIds.length === 0) {
        throw new Error("Please select at least one pharmacy");
      }

      const requestedIds = new Set(normalizedPharmacyIds);
      const matchedPharmacies = allPharmacies.filter((pharmacy: any) =>
        requestedIds.has(String(pharmacy._id)),
      );
      const matchedPharmacyIds = new Set<string>(
        matchedPharmacies.map((pharmacy: any) => String(pharmacy._id)),
      );
      const matchedOwnerIds = new Set(
        matchedPharmacies.map((pharmacy: any) => String(pharmacy.ownerId)),
      );

      const allUsers = await ctx.db.query("users").take(5000);
      recipients = allUsers.filter((user: any) => {
        if (user.status !== "active" || user.role === "admin") {
          return false;
        }
        const userPharmacyId = resolveUserPharmacyId(user);
        return (
          (userPharmacyId && matchedPharmacyIds.has(String(userPharmacyId))) ||
          matchedOwnerIds.has(String(user._id))
        );
      });

      targetIds = normalizedPharmacyIds;
      targetedPharmacyIds = new Set<string>(
        Array.from(matchedPharmacyIds).map((id) => String(id)),
      );
    }

    const uniqueRecipientsById = new Map<string, any>();
    for (const recipient of recipients) {
      uniqueRecipientsById.set(String(recipient._id), recipient);
    }
    const uniqueRecipients = Array.from(uniqueRecipientsById.values());

    if (uniqueRecipients.length === 0) {
      throw new Error("No recipients matched the selected target audience");
    }

    for (const recipient of uniqueRecipients) {
      const pharmacyId = resolveUserPharmacyId(recipient);
      await ctx.db.insert("notifications", {
        userId: recipient._id,
        pharmacyId: pharmacyId || undefined,
        title: args.title,
        message: args.message,
        type: "info",
        priority,
        read: false,
        readAt: undefined,
        link: "/dashboard",
        createdAt: now,
      });
    }

    if (targetedPharmacyIds.size === 0) {
      targetedPharmacyIds = new Set(
        uniqueRecipients
          .map((recipient: any) => resolveUserPharmacyId(recipient))
          .filter(Boolean)
          .map((id: any) => String(id)),
      );
    }

    const deliveryStatus = Array.from(targetedPharmacyIds).map(
      (pharmacyId: string) => ({
        pharmacyId,
        delivered: true,
        deliveredAt: now,
        read: false,
        readAt: undefined,
      }),
    );

    const broadcastId = await ctx.db.insert("admin_broadcasts", {
      senderId: admin._id,
      targetType: args.targetType,
      targetIds,
      messageType: args.messageType,
      title: args.title,
      message: args.message,
      deliveryStatus,
      createdAt: now,
    });

    await ctx.db.insert("audit_logs", {
      userId: admin._id,
      action: "send_broadcast",
      entityId: String(broadcastId),
      entityType: "broadcast",
      details: `Sent ${args.messageType} broadcast to ${args.targetType} (${uniqueRecipients.length} recipients): ${args.title}`,
      timestamp: now,
    });

    return {
      success: true,
      broadcastId,
      recipientCount: uniqueRecipients.length,
      pharmacyCount: targetedPharmacyIds.size,
    };
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

export const hardDeleteNonAdminUsers = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    dryRun: v.optional(v.boolean()),
    fallbackAdminId: v.optional(v.id("users")),
  },
  handler: async (ctx: any, args: any) => {
    const requestingAdmin = await requireAdmin(ctx, args.sessionToken);
    const dryRun = args.dryRun ?? true;

    const allUsers = await ctx.db.query("users").take(5000);
    const admins = allUsers.filter((user: any) => user.role === "admin");
    const nonAdmins = allUsers.filter((user: any) => user.role !== "admin");

    if (admins.length === 0) {
      throw new Error("No admin user exists; aborting cleanup.");
    }

    const fallbackAdmin = args.fallbackAdminId
      ? await ctx.db.get(args.fallbackAdminId)
      : admins[0];

    if (!fallbackAdmin || fallbackAdmin.role !== "admin") {
      throw new Error("Fallback admin must be a valid admin user.");
    }

    const deleteUserIds = new Set(
      nonAdmins.map((user: any) => String(user._id)),
    );
    const shouldDeleteUserId = (id: any) => id && deleteUserIds.has(String(id));

    const impacts: Record<string, number> = {};
    const count = (key: string, amount = 1) => {
      impacts[key] = (impacts[key] || 0) + amount;
    };

    const patchIfNeeded = async (
      doc: any,
      patch: Record<string, any>,
      impactKey: string,
    ) => {
      if (Object.keys(patch).length === 0) return;
      count(impactKey);
      if (!dryRun) {
        await ctx.db.patch(doc._id, patch);
      }
    };

    const deleteDoc = async (doc: any, impactKey: string) => {
      count(impactKey);
      if (!dryRun) {
        await ctx.db.delete(doc._id);
      }
    };

    const pharmacies = await ctx.db.query("pharmacies").take(5000);
    for (const pharmacy of pharmacies) {
      if (shouldDeleteUserId(pharmacy.ownerId)) {
        await patchIfNeeded(
          pharmacy,
          { ownerId: fallbackAdmin._id },
          "pharmacies_reassigned_owner",
        );
      }
    }

    const branches = await ctx.db.query("branches").take(5000);
    for (const branch of branches) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(branch.managerId)) {
        patch.managerId = fallbackAdmin._id;
      }
      if (Array.isArray(branch.assignedManagers)) {
        const cleaned = branch.assignedManagers.filter(
          (userId: any) => !shouldDeleteUserId(userId),
        );
        if (cleaned.length === 0) {
          cleaned.push(fallbackAdmin._id);
        }
        if (
          JSON.stringify(cleaned) !== JSON.stringify(branch.assignedManagers)
        ) {
          patch.assignedManagers = cleaned;
        }
      }
      await patchIfNeeded(branch, patch, "branches_reassigned_manager");
    }

    const sales = await ctx.db.query("sales").take(5000);
    for (const sale of sales) {
      if (shouldDeleteUserId(sale.cashierId)) {
        await patchIfNeeded(
          sale,
          { cashierId: fallbackAdmin._id },
          "sales_reassigned_cashier",
        );
      }
    }

    const stockRequests = await ctx.db.query("stock_requests").take(5000);
    for (const request of stockRequests) {
      if (shouldDeleteUserId(request.pharmacistId)) {
        await patchIfNeeded(
          request,
          { pharmacistId: fallbackAdmin._id },
          "stock_requests_reassigned_pharmacist",
        );
      }
    }

    const stockTransfers = await ctx.db
      .query("stock_transfer_requests")
      .take(5000);
    for (const transfer of stockTransfers) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(transfer.requesterUserId)) {
        patch.requesterUserId = fallbackAdmin._id;
      }
      if (shouldDeleteUserId(transfer.approvedByUserId)) {
        patch.approvedByUserId = undefined;
      }
      if (shouldDeleteUserId(transfer.rejectedByUserId)) {
        patch.rejectedByUserId = undefined;
      }
      await patchIfNeeded(
        transfer,
        patch,
        "stock_transfers_reassigned_requester",
      );
    }

    const subscriptionTemplates = await ctx.db
      .query("subscription_plan_templates")
      .take(5000);
    for (const template of subscriptionTemplates) {
      if (shouldDeleteUserId(template.createdBy)) {
        await patchIfNeeded(
          template,
          { createdBy: fallbackAdmin._id },
          "subscription_templates_reassigned_creator",
        );
      }
    }

    const paymentLinks = await ctx.db
      .query("subscription_payment_links")
      .take(5000);
    for (const link of paymentLinks) {
      if (shouldDeleteUserId(link.ownerUserId)) {
        await patchIfNeeded(
          link,
          { ownerUserId: fallbackAdmin._id },
          "payment_links_reassigned_owner",
        );
      }
    }

    const subscriptionHistory = await ctx.db
      .query("subscription_history")
      .take(5000);
    for (const item of subscriptionHistory) {
      if (shouldDeleteUserId(item.changedBy)) {
        await patchIfNeeded(
          item,
          { changedBy: fallbackAdmin._id },
          "subscription_history_reassigned_changedBy",
        );
      }
    }

    const adminActions = await ctx.db.query("admin_actions").take(5000);
    for (const action of adminActions) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(action.targetUserId)) {
        patch.targetUserId = fallbackAdmin._id;
      }
      if (shouldDeleteUserId(action.performedBy)) {
        patch.performedBy = fallbackAdmin._id;
      }
      await patchIfNeeded(action, patch, "admin_actions_reassigned_users");
    }

    const managerFlags = await ctx.db.query("manager_flags").take(5000);
    for (const flag of managerFlags) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(flag.managerId)) {
        patch.managerId = fallbackAdmin._id;
      }
      if (shouldDeleteUserId(flag.flaggedBy)) {
        patch.flaggedBy = fallbackAdmin._id;
      }
      await patchIfNeeded(flag, patch, "manager_flags_reassigned_users");
    }

    const broadcasts = await ctx.db.query("admin_broadcasts").take(5000);
    for (const broadcast of broadcasts) {
      if (shouldDeleteUserId(broadcast.senderId)) {
        await patchIfNeeded(
          broadcast,
          { senderId: fallbackAdmin._id },
          "broadcasts_reassigned_sender",
        );
      }
    }

    const diagnostics = await ctx.db.query("diagnostic_sessions").take(5000);
    for (const session of diagnostics) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(session.adminId)) {
        patch.adminId = fallbackAdmin._id;
      }
      if (shouldDeleteUserId(session.targetUserId)) {
        patch.targetUserId = fallbackAdmin._id;
      }
      await patchIfNeeded(session, patch, "diagnostics_reassigned_users");
    }

    const auditLogs = await ctx.db.query("audit_logs").take(5000);
    for (const log of auditLogs) {
      if (shouldDeleteUserId(log.userId)) {
        await patchIfNeeded(
          log,
          { userId: fallbackAdmin._id },
          "audit_logs_reassigned_user",
        );
      }
    }

    const ownerMessages = await ctx.db.query("owner_messages").take(5000);
    for (const message of ownerMessages) {
      const senderDeleted = shouldDeleteUserId(message.senderId);
      const targetDeleted = shouldDeleteUserId(message.targetUserId);
      const hasDeliveryForDeletedUser = Array.isArray(message.deliveryStatus)
        ? message.deliveryStatus.some((status: any) =>
            shouldDeleteUserId(status.userId),
          )
        : false;

      if (senderDeleted || targetDeleted || hasDeliveryForDeletedUser) {
        await deleteDoc(message, "owner_messages_deleted");
      }
    }

    const notifications = await ctx.db.query("notifications").take(5000);
    for (const notification of notifications) {
      if (shouldDeleteUserId(notification.userId)) {
        await deleteDoc(notification, "notifications_deleted");
      }
    }

    const aiConversations = await ctx.db.query("ai_conversations").take(5000);
    for (const convo of aiConversations) {
      if (shouldDeleteUserId(convo.userId)) {
        await deleteDoc(convo, "ai_conversations_deleted");
      }
    }

    const aiEscalations = await ctx.db.query("ai_escalations").take(5000);
    for (const escalation of aiEscalations) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(escalation.submitterId)) {
        patch.submitterId = fallbackAdmin._id;
      }
      if (shouldDeleteUserId(escalation.assignedTo)) {
        patch.assignedTo = undefined;
      }
      await patchIfNeeded(escalation, patch, "ai_escalations_reassigned_users");
    }

    const paymentMethods = await ctx.db.query("payment_methods").take(5000);
    for (const method of paymentMethods) {
      if (shouldDeleteUserId(method.userId)) {
        await deleteDoc(method, "payment_methods_deleted");
      }
    }

    const auditExports = await ctx.db.query("audit_log_exports").take(5000);
    for (const exportDoc of auditExports) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(exportDoc.requestedBy)) {
        patch.requestedBy = fallbackAdmin._id;
      }
      if (
        exportDoc.filters?.userId &&
        shouldDeleteUserId(exportDoc.filters.userId)
      ) {
        patch.filters = {
          ...exportDoc.filters,
          userId: undefined,
        };
      }
      await patchIfNeeded(exportDoc, patch, "audit_exports_reassigned_users");
    }

    const contactMessages = await ctx.db.query("contact_messages").take(5000);
    for (const msg of contactMessages) {
      if (shouldDeleteUserId(msg.repliedBy)) {
        await patchIfNeeded(
          msg,
          { repliedBy: undefined },
          "contact_messages_cleared_repliedBy",
        );
      }
    }

    const contactTrash = await ctx.db
      .query("contact_messages_trash")
      .take(5000);
    for (const msg of contactTrash) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(msg.repliedBy)) {
        patch.repliedBy = undefined;
      }
      if (shouldDeleteUserId(msg.deletedBy)) {
        patch.deletedBy = fallbackAdmin._id;
      }
      await patchIfNeeded(
        msg,
        patch,
        "contact_messages_trash_reassigned_users",
      );
    }

    const testimonials = await ctx.db.query("testimonials").take(5000);
    for (const testimonial of testimonials) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(testimonial.ownerId)) {
        patch.ownerId = fallbackAdmin._id;
      }
      if (shouldDeleteUserId(testimonial.reviewedBy)) {
        patch.reviewedBy = undefined;
      }
      await patchIfNeeded(testimonial, patch, "testimonials_reassigned_users");
    }

    const siteSettings = await ctx.db.query("site_settings").take(5000);
    for (const settings of siteSettings) {
      if (shouldDeleteUserId(settings.updatedBy)) {
        await patchIfNeeded(
          settings,
          { updatedBy: undefined },
          "site_settings_cleared_updatedBy",
        );
      }
    }

    const landingContent = await ctx.db
      .query("landing_page_content")
      .take(5000);
    for (const content of landingContent) {
      if (shouldDeleteUserId(content.updatedBy)) {
        await patchIfNeeded(
          content,
          { updatedBy: undefined },
          "landing_content_cleared_updatedBy",
        );
      }
    }

    const landingSections = await ctx.db
      .query("landing_page_sections")
      .take(5000);
    for (const section of landingSections) {
      if (shouldDeleteUserId(section.updatedBy)) {
        await patchIfNeeded(
          section,
          { updatedBy: undefined },
          "landing_sections_cleared_updatedBy",
        );
      }
    }

    const authAccounts = await ctx.db.query("authAccounts").take(5000);
    for (const account of authAccounts) {
      if (shouldDeleteUserId(account.userId)) {
        await deleteDoc(account, "auth_accounts_deleted");
      }
    }

    const authSessions = await ctx.db.query("authSessions").take(5000);
    for (const session of authSessions) {
      if (shouldDeleteUserId(session.userId)) {
        await deleteDoc(session, "auth_sessions_deleted");
      }
    }

    for (const adminUser of admins) {
      const patch: Record<string, any> = {};
      if (shouldDeleteUserId(adminUser.createdBy)) {
        patch.createdBy = undefined;
      }
      if (shouldDeleteUserId(adminUser.lockLiftedBy)) {
        patch.lockLiftedBy = undefined;
      }
      if (shouldDeleteUserId(adminUser.stockApprovalDelegatedBy)) {
        patch.stockApprovalDelegatedBy = undefined;
      }
      await patchIfNeeded(adminUser, patch, "admin_users_cleared_user_refs");
    }

    for (const medicine of await ctx.db.query("medicines").take(5000)) {
      if (!Array.isArray(medicine.priceChangeHistory)) continue;

      let changed = false;
      const nextHistory = medicine.priceChangeHistory.map((entry: any) => {
        if (!shouldDeleteUserId(entry.changedBy)) return entry;
        changed = true;
        return {
          ...entry,
          changedBy: fallbackAdmin._id,
        };
      });

      if (changed) {
        await patchIfNeeded(
          medicine,
          { priceChangeHistory: nextHistory },
          "medicines_reassigned_price_change_actor",
        );
      }
    }

    for (const user of nonAdmins) {
      count("users_deleted");
      if (!dryRun) {
        await ctx.db.delete(user._id);
      }
    }

    const summary = {
      dryRun,
      requestedBy: requestingAdmin._id,
      fallbackAdminId: fallbackAdmin._id,
      adminsKept: admins.length,
      nonAdminsTargeted: nonAdmins.length,
      impacts,
    };

    if (!dryRun) {
      await ctx.db.insert("audit_logs", {
        userId: requestingAdmin._id,
        action: "hard_delete_non_admin_users",
        entityId: String(fallbackAdmin._id),
        entityType: "user_cleanup",
        details: `Deleted ${nonAdmins.length} non-admin users; fallback admin ${String(fallbackAdmin._id)}`,
        timestamp: Date.now(),
      });
    }

    return summary;
  },
});
