// @ts-ignore
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { hasPermission, Permission } from "../lib/permissions";
import { getAuthenticatedUser } from "../lib/auth";
import { generateRandomString } from "../lib/utils";

export const sendOwnerMessage = mutation({
  args: {
    message: v.string(),
    isUrgent: v.optional(v.boolean()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const owner = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!owner || !hasPermission(owner, Permission.SEND_OWNER_MESSAGES)) {
      throw new Error("Unauthorized: Owner only");
    }

    const pharmacyId = owner.pharmacyId;
    if (!pharmacyId) {
      throw new Error("No pharmacy associated with this owner");
    }

    await ctx.db.insert("owner_messages", {
      pharmacyId,
      ownerId: owner._id,
      message: args.message,
      isUrgent: args.isUrgent || false,
      sentAt: Date.now(),
      status: "unread",
      repliedAt: null,
      reply: null,
    });

    await ctx.db.insert("audit_logs", {
      userId: owner._id,
      action: "send_owner_message",
      entityId: null,
      entityType: "owner_message",
      details: `Owner sent message${args.isUrgent ? " (urgent)" : ""}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const submitAppeal = mutation({
  args: {
    appealType: v.string(),
    description: v.string(),
    actionId: v.optional(v.id("admin_actions")),
    flagId: v.optional(v.id("manager_flags")),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    let targetId = args.actionId || args.flagId;
    let targetEntityType = args.actionId ? "admin_action" : "manager_flag";

    if (!targetId) {
      throw new Error("Must provide either actionId or flagId");
    }

    await ctx.db.insert("audit_logs", {
      userId: user._id,
      action: "submit_appeal",
      entityId: targetId,
      entityType: targetEntityType,
      details: `Appeal submitted: ${args.appealType}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function sendEmailViaResend(args: {
  to: string;
  subject: string;
  html: string;
  apiKey: string;
  testMode?: boolean;
}) {
  if (args.testMode) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PharmaCare <noreply@pharmacare.io>",
      to: args.to,
      subject: args.subject,
      html: args.html,
    }),
  });
}

export const createStaffWithSetupLink = mutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("manager"),
      v.literal("pharmacist"),
      v.literal("cashier"),
    ),
    branchId: v.id("branches"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const owner = await getAuthenticatedUser(ctx, args.sessionToken);
    if (!owner || owner.role !== "owner") {
      throw new Error("Unauthorized: Owner only");
    }

    if (!owner.pharmacyId) {
      throw new Error("Owner is not linked to a pharmacy");
    }

    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== owner.pharmacyId) {
      throw new Error("Invalid branch for this pharmacy");
    }

    const normalizedEmail = normalizeEmail(args.email);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .unique();
    if (existing) {
      throw new Error("An account with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      full_name: args.full_name,
      name: args.full_name,
      email: normalizedEmail,
      role: args.role,
      status: "active",
      pharmacyId: owner.pharmacyId,
      branchId: args.branchId,
      mustResetPassword: true,
      emailVerified: true,
      adminFlagged: false,
      adminLocked: false,
      mfaEnabled: false,
      activeSessionsCount: 0,
      passwordLastChanged: Date.now(),
    });

    const resetToken = generateRandomString(32);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await ctx.db.insert("authVerificationTokens", {
      identifier: normalizedEmail,
      token: resetToken,
      expires: expiresAt,
    });

    const settings = await ctx.db.query("site_settings").first();
    if (settings?.resendApiKey) {
      const resetLink = `${process.env.SITE_URL ?? "http://localhost:5173"}/auth/reset-password?email=${encodeURIComponent(
        normalizedEmail,
      )}&token=${encodeURIComponent(resetToken)}`;
      await sendEmailViaResend({
        to: normalizedEmail,
        subject: "Set up your PharmaCare account password",
        html: `<p>Hello ${args.full_name},</p><p>Your account has been created by your pharmacy owner.</p><p><a href="${resetLink}">Set your password</a></p>`,
        apiKey: settings.resendApiKey,
        testMode: settings.testMode,
      });
    }

    await ctx.db.insert("audit_logs", {
      userId: owner._id,
      action: "owner_create_staff_account",
      entityId: userId,
      entityType: "user",
      details: `Owner created ${args.role} account for ${normalizedEmail}`,
      timestamp: Date.now(),
    });

    return { success: true, userId, setupTokenExpiresAt: expiresAt };
  },
});

export const getOwnerStaffAccounts = mutation({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const owner = await getAuthenticatedUser(ctx, args.sessionToken);
    if (!owner || owner.role !== "owner") {
      throw new Error("Unauthorized: Owner only");
    }
    if (!owner.pharmacyId) {
      throw new Error("Owner is not linked to a pharmacy");
    }

    const staff = await ctx.db
      .query("users")
      .withIndex("by_pharmacy", (q: any) =>
        q.eq("pharmacyId", owner.pharmacyId),
      )
      .take(500);

    return staff.filter((user: any) =>
      ["manager", "pharmacist", "cashier"].includes(user.role),
    );
  },
});
