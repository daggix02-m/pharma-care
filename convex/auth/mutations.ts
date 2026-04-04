import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { generateRandomString } from "../lib/utils";
import { getAuthenticatedUser } from "../lib/auth";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ETHIOPIAN_PHONE_REGEX = /^(\+251|0)?[79]\d{8}$/;

const normalizeTierCode = (tier: string | undefined | null): string =>
  String(tier || "")
    .trim()
    .toLowerCase();

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function queueEmailSend(
  ctx: any,
  args: {
    to: string;
    subject: string;
    html: string;
    apiKey: string;
    testMode?: boolean;
  },
) {
  if (args.testMode) {
    return { emailSent: false, status: "test_mode" as const };
  }

  await ctx.scheduler.runAfter(0, internal.lib.email.sendEmail, {
    to: args.to,
    subject: args.subject,
    html: args.html,
    apiKey: args.apiKey,
    testMode: Boolean(args.testMode),
  });

  return {
    emailSent: true,
    status: "queued" as const,
  };
}

async function deleteVerificationTokensForEmail(ctx: any, email: string) {
  while (true) {
    const existingTokens = await ctx.db
      .query("authVerificationTokens")
      .withIndex("by_identifier", (q: any) => q.eq("identifier", email))
      .take(50);

    if (existingTokens.length === 0) {
      break;
    }

    for (const tokenDoc of existingTokens) {
      await ctx.db.delete(tokenDoc._id);
    }
  }
}

async function hashPasswordWithSecret(
  password: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper function to hash password (using bcrypt-like approach)
// In production, use proper bcrypt or similar
async function hashPassword(password: string): Promise<string> {
  const authSecret = process.env.CONVEX_AUTH_SECRET ?? "";
  return hashPasswordWithSecret(password, authSecret);
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const computedHash = await hashPassword(password);
  if (computedHash === hash) {
    return true;
  }

  const legacyNoSecretHash = await hashPasswordWithSecret(password, "");
  if (legacyNoSecretHash === hash) {
    return true;
  }

  const legacyUndefinedSecretHash = await hashPasswordWithSecret(
    password,
    "undefined",
  );
  if (legacyUndefinedSecretHash === hash) {
    return true;
  }

  const previousSecrets = (process.env.CONVEX_AUTH_SECRET_PREVIOUS ?? "")
    .split(",")
    .map((secret) => secret.trim())
    .filter(Boolean);

  for (const previousSecret of previousSecrets) {
    const legacyHash = await hashPasswordWithSecret(password, previousSecret);
    if (legacyHash === hash) {
      return true;
    }
  }

  return false;
}

async function findUserByEmail(ctx: any, email: string) {
  const normalizedEmail = normalizeEmail(email);

  const normalizedMatch = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
    .unique();
  if (normalizedMatch) {
    return normalizedMatch;
  }

  if (email !== normalizedEmail) {
    const rawMatch = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .unique();
    if (rawMatch) {
      return rawMatch;
    }
  }

  const users = await ctx.db.query("users").collect();
  return (
    users.find(
      (user: any) => normalizeEmail(user.email || "") === normalizedEmail,
    ) || null
  );
}

async function getPreviousRejectionForEmail(ctx: any, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const rows = await ctx.db
    .query("rejected_owner_applications")
    .withIndex("by_owner_email_and_rejected_at", (q: any) =>
      q.eq("ownerEmail", normalizedEmail),
    )
    .order("desc")
    .take(1);

  const latest = rows[0];
  if (!latest || latest.retentionUntil < Date.now()) {
    return null;
  }

  return {
    rejectionReason: latest.rejectionReason,
    rejectedAt: latest.rejectedAt,
    pharmacyName: latest.pharmacyName,
  };
}

async function validateAndNormalizeSignupPayload(
  ctx: any,
  args: any,
  normalizedEmail: string,
) {
  if (!args.pharmacyDetails) {
    throw new Error("Pharmacy details are required for owner registration");
  }

  if (!args.operations) {
    throw new Error("Operations details are required for owner registration");
  }

  if (!args.subscription) {
    throw new Error("Subscription details are required for owner registration");
  }

  if (!args.signupSnapshot) {
    throw new Error("Signup review snapshot is required");
  }

  const ownerFullName = String(args.full_name || "").trim();
  if (!ownerFullName) {
    throw new Error("Owner full name is required");
  }

  const ownerPhone = String(args.phone || "").trim();
  const normalizedPhone = ownerPhone.replace(/\s+/g, "");
  if (!ownerPhone || !ETHIOPIAN_PHONE_REGEX.test(normalizedPhone)) {
    throw new Error("Valid owner phone number is required");
  }

  const pharmacyName = String(args.pharmacyDetails.name || "").trim();
  const licenseNumber = String(args.pharmacyDetails.licenseNumber || "").trim();
  const location = String(args.pharmacyDetails.location || "").trim();
  const pharmacyEmailRaw = String(
    args.pharmacyDetails.pharmacyEmail || "",
  ).trim();
  const pharmacyEmail = pharmacyEmailRaw
    ? normalizeEmail(pharmacyEmailRaw)
    : undefined;

  if (!pharmacyName) {
    throw new Error("Pharmacy name is required");
  }
  if (!licenseNumber) {
    throw new Error("License number is required");
  }
  if (!location) {
    throw new Error("Primary location is required");
  }
  if (pharmacyEmail && !EMAIL_REGEX.test(pharmacyEmail)) {
    throw new Error("Pharmacy email is invalid");
  }

  const totalBranches = Number(args.operations.totalBranches || 0);
  const totalStaff = Number(args.operations.totalStaff || 0);
  const pharmacistCount = Number(args.operations.pharmacistCount || 0);
  const managerCount = Number(args.operations.managerCount || 0);
  const cashierCount = Number(args.operations.cashierCount || 0);

  if (!Number.isInteger(totalBranches) || totalBranches < 1) {
    throw new Error("At least one branch is required");
  }
  if (!Number.isInteger(totalStaff) || totalStaff < 1) {
    throw new Error("Total staff must be at least 1");
  }
  if (pharmacistCount < 0 || managerCount < 0 || cashierCount < 0) {
    throw new Error("Staff breakdown values cannot be negative");
  }

  const normalizedBranchLocations = (args.operations.branchLocations || [])
    .map((location: string) => String(location || "").trim())
    .filter(Boolean);

  if (normalizedBranchLocations.length !== totalBranches) {
    throw new Error("Please provide all branch locations");
  }

  if (pharmacistCount + managerCount + cashierCount !== totalStaff) {
    throw new Error("Staff breakdown must equal total staff count");
  }

  const selectedTier = normalizeTierCode(args.subscription.selectedTier);
  const recommendedTier = normalizeTierCode(args.subscription.recommendedTier);

  if (!selectedTier) {
    throw new Error("Please select a subscription plan");
  }
  if (!recommendedTier) {
    throw new Error("Recommended subscription tier is required");
  }

  const activePlans = await ctx.db
    .query("subscription_plans")
    .withIndex("by_active", (q: any) => q.eq("isActive", true))
    .take(100);
  const validPlanCodes = new Set(
    activePlans.map((plan: any) => normalizeTierCode(plan.code)),
  );

  if (validPlanCodes.size > 0 && !validPlanCodes.has(selectedTier)) {
    throw new Error("Selected subscription plan is not active");
  }

  if (
    validPlanCodes.size > 0 &&
    recommendedTier &&
    !validPlanCodes.has(recommendedTier)
  ) {
    throw new Error("Recommended subscription plan is not active");
  }

  const snapshot = args.signupSnapshot;
  const termsAccepted = Boolean(snapshot?.step4Review?.termsAccepted);
  if (!termsAccepted) {
    throw new Error("You must accept terms before submitting signup");
  }

  const snapshotEmail = normalizeEmail(snapshot?.step3Owner?.email || "");
  if (snapshotEmail && snapshotEmail !== normalizedEmail) {
    throw new Error("Owner email does not match signup review data");
  }

  const canonicalSignupSnapshot = {
    step1Pharmacy: {
      pharmacyNameLabel: "Pharmacy Name",
      pharmacyName,
      licenseLabel: "License Number",
      licenseCode: licenseNumber,
      primaryLocationLabel: "Primary Location (from signup form)",
      primaryLocation: location,
      pharmacyEmailLabel: "Pharmacy Email (Optional)",
      pharmacyEmail: pharmacyEmail || "",
    },
    step1Operations: {
      totalBranchesLabel: "Total Branches",
      totalBranches,
      branchSetupLabel: "Branch Setup",
      branchLocations: normalizedBranchLocations,
      totalStaffLabel: "Total Staff",
      totalStaff,
      breakdownLabel: "Breakdown",
      pharmacists: pharmacistCount,
      managers: managerCount,
      cashiers: cashierCount,
    },
    step2Subscription: {
      selectedLabel: "Selected",
      selectedTier,
      recommendedLabel: "Recommended",
      recommendedTier,
    },
    step3Owner: {
      nameLabel: "Full Name",
      fullName: ownerFullName,
      emailLabel: "Email Address",
      email: normalizedEmail,
      phoneLabel: "Phone Number",
      phone: ownerPhone,
    },
    step4Review: {
      termsAcceptedLabel: "Terms Accepted",
      termsAccepted: true,
    },
  };

  return {
    ownerFullName,
    ownerPhone,
    pharmacyDetails: {
      name: pharmacyName,
      licenseNumber,
      location,
      pharmacyEmail,
    },
    operations: {
      totalBranches,
      branchLocations: normalizedBranchLocations,
      totalStaff,
      pharmacistCount,
      managerCount,
      cashierCount,
    },
    subscription: {
      selectedTier,
      recommendedTier,
    },
    canonicalSignupSnapshot,
  };
}

// Email/Password Sign Up
export const signUpWithEmail = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    full_name: v.string(),
    phone: v.string(),
    pharmacyDetails: v.object({
      name: v.string(),
      licenseNumber: v.string(),
      location: v.string(),
      pharmacyEmail: v.optional(v.string()),
    }),
    operations: v.object({
      totalBranches: v.number(),
      branchLocations: v.array(v.string()),
      totalStaff: v.number(),
      pharmacistCount: v.number(),
      managerCount: v.number(),
      cashierCount: v.number(),
    }),
    subscription: v.object({
      selectedTier: v.string(),
      recommendedTier: v.string(),
    }),
    signupSnapshot: v.object({
      step1Pharmacy: v.object({
        pharmacyNameLabel: v.string(),
        pharmacyName: v.string(),
        licenseLabel: v.string(),
        licenseCode: v.string(),
        primaryLocationLabel: v.string(),
        primaryLocation: v.string(),
        pharmacyEmailLabel: v.string(),
        pharmacyEmail: v.string(),
      }),
      step1Operations: v.object({
        totalBranchesLabel: v.string(),
        totalBranches: v.number(),
        branchSetupLabel: v.string(),
        branchLocations: v.array(v.string()),
        totalStaffLabel: v.string(),
        totalStaff: v.number(),
        breakdownLabel: v.string(),
        pharmacists: v.number(),
        managers: v.number(),
        cashiers: v.number(),
      }),
      step2Subscription: v.object({
        selectedLabel: v.string(),
        selectedTier: v.string(),
        recommendedLabel: v.string(),
        recommendedTier: v.string(),
      }),
      step3Owner: v.object({
        nameLabel: v.string(),
        fullName: v.string(),
        emailLabel: v.string(),
        email: v.string(),
        phoneLabel: v.string(),
        phone: v.string(),
      }),
      step4Review: v.object({
        termsAcceptedLabel: v.string(),
        termsAccepted: v.boolean(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const normalizedSignup = await validateAndNormalizeSignupPayload(
      ctx,
      args,
      normalizedEmail,
    );
    const {
      ownerFullName,
      ownerPhone,
      pharmacyDetails,
      operations,
      subscription,
      canonicalSignupSnapshot,
    } = normalizedSignup;
    const previousRejection = await getPreviousRejectionForEmail(
      ctx,
      normalizedEmail,
    );

    const settings = await ctx.db.query("site_settings").first();
    if (!settings?.resendApiKey) {
      throw new Error(
        "Verification email service is not configured. Please contact support.",
      );
    }
    if (settings.testMode) {
      throw new Error(
        "Verification email is in test mode. Disable test mode in settings to send real emails.",
      );
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new Error(
          "An account with this email already exists. Please sign in.",
        );
      }

      const normalizedBranchLocations = operations.branchLocations;
      const fallbackSignupLocation = pharmacyDetails.location;
      const signupLocation =
        fallbackSignupLocation || normalizedBranchLocations[0] || undefined;
      const plannedBranchLocations = normalizedBranchLocations;

      const existingPharmacy = existingUser.pharmacyId
        ? await ctx.db.get(existingUser.pharmacyId)
        : null;
      const existingPharmacyStatus = String(existingPharmacy?.status || "")
        .trim()
        .toLowerCase();

      let pharmacyId = existingPharmacy?._id ?? null;
      const hasPendingPharmacy =
        existingPharmacyStatus === "pending" ||
        existingPharmacyStatus === "pending_approval";

      if (!hasPendingPharmacy) {
        pharmacyId = await ctx.db.insert("pharmacies", {
          name: pharmacyDetails.name,
          pharmacyEmail: pharmacyDetails.pharmacyEmail,
          signupLocation,
          licenseCode: pharmacyDetails.licenseNumber,
          staffCount: operations.totalStaff,
          subscriptionTier: subscription.selectedTier,
          status: "pending",
          ownerId: existingUser._id,
          plannedBranches: operations.totalBranches,
          plannedBranchLocations,
          plannedStaffTotal: operations.totalStaff,
          plannedStaffBreakdown: operations
            ? {
                pharmacists: operations.pharmacistCount,
                managers: operations.managerCount,
                cashiers: operations.cashierCount,
              }
            : undefined,
          signupSnapshot: canonicalSignupSnapshot,
          recommendedSubscriptionTier: subscription.recommendedTier,
          paymentStatus: "pending_approval",
        });
      } else if (existingPharmacy) {
        await ctx.db.patch(existingPharmacy._id, {
          name: pharmacyDetails.name,
          pharmacyEmail: pharmacyDetails.pharmacyEmail,
          signupLocation,
          licenseCode: pharmacyDetails.licenseNumber,
          staffCount: operations.totalStaff,
          subscriptionTier: subscription.selectedTier,
          status: "pending",
          plannedBranches: operations.totalBranches,
          plannedBranchLocations,
          plannedStaffTotal: operations.totalStaff,
          plannedStaffBreakdown: operations
            ? {
                pharmacists: operations.pharmacistCount,
                managers: operations.managerCount,
                cashiers: operations.cashierCount,
              }
            : undefined,
          signupSnapshot: canonicalSignupSnapshot,
          recommendedSubscriptionTier: subscription.recommendedTier,
          paymentStatus: "pending_approval",
        });
      }

      await ctx.db.patch(existingUser._id, {
        status: "pending",
        role: "owner",
        phone: ownerPhone,
        full_name: ownerFullName,
        name: ownerFullName,
        pharmacyId: pharmacyId || undefined,
      });

      const verifyToken = generateVerificationCode();
      await deleteVerificationTokensForEmail(ctx, normalizedEmail);
      await ctx.db.insert("authVerificationTokens", {
        identifier: normalizedEmail,
        token: verifyToken,
        expires: Date.now() + 24 * 60 * 60 * 1000,
      });

      const verifyLink = `${process.env.SITE_URL ?? "http://localhost:5173"}/auth/verify-email?email=${encodeURIComponent(
        normalizedEmail,
      )}&token=${encodeURIComponent(verifyToken)}`;

      const delivery = await queueEmailSend(ctx, {
        to: normalizedEmail,
        subject: "Verify your PharmaCare account",
        html: `<p>Hello ${existingUser.full_name || "there"},</p><p>Your account already exists but is not verified yet. Verify your email to continue.</p><p><a href="${verifyLink}">Verify Email</a></p>`,
        apiKey: settings.resendApiKey,
        testMode: settings.testMode,
      });

      return {
        success: true,
        userId: existingUser._id,
        pharmacyId,
        emailSent: delivery.emailSent,
        deliveryStatus: delivery.status,
        previousRejection,
        message:
          "Account already exists but is unverified. A new verification email has been sent.",
      };
    }

    // Validate password strength
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert("users", {
      email: normalizedEmail,
      emailVerified: false,
      name: ownerFullName,
      full_name: ownerFullName,
      phone: ownerPhone,
      passwordHash,
      role: "owner",
      status: "pending",
      adminFlagged: false,
      adminLocked: false,
      mfaEnabled: false,
      activeSessionsCount: 0,
      passwordLastChanged: Date.now(),
    });

    const normalizedBranchLocations = operations.branchLocations;
    const fallbackSignupLocation = pharmacyDetails.location;
    const signupLocation =
      fallbackSignupLocation || normalizedBranchLocations[0] || undefined;
    const plannedBranchLocations = normalizedBranchLocations;

    const pharmacyId = await ctx.db.insert("pharmacies", {
      name: pharmacyDetails.name,
      pharmacyEmail: pharmacyDetails.pharmacyEmail,
      signupLocation,
      licenseCode: pharmacyDetails.licenseNumber,
      staffCount: operations.totalStaff,
      subscriptionTier: subscription.selectedTier,
      status: "pending",
      ownerId: userId,
      plannedBranches: operations.totalBranches,
      plannedBranchLocations,
      plannedStaffTotal: operations.totalStaff,
      plannedStaffBreakdown: {
        pharmacists: operations.pharmacistCount,
        managers: operations.managerCount,
        cashiers: operations.cashierCount,
      },
      signupSnapshot: canonicalSignupSnapshot,
      recommendedSubscriptionTier: subscription.recommendedTier,
      paymentStatus: "pending_approval",
    });

    await ctx.db.patch(userId, {
      pharmacyId,
    });

    // Generate email verification token
    const verifyToken = generateVerificationCode();
    await deleteVerificationTokensForEmail(ctx, normalizedEmail);
    await ctx.db.insert("authVerificationTokens", {
      identifier: normalizedEmail,
      token: verifyToken,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const verifyLink = `${process.env.SITE_URL ?? "http://localhost:5173"}/auth/verify-email?email=${encodeURIComponent(
      normalizedEmail,
    )}&token=${encodeURIComponent(verifyToken)}`;
    const delivery = await queueEmailSend(ctx, {
      to: normalizedEmail,
      subject: "Verify your PharmaCare account",
      html: `<p>Hello ${ownerFullName},</p><p>Welcome to PharmaCare. Verify your email to continue your pharmacy application.</p><p><a href="${verifyLink}">Verify Email</a></p>`,
      apiKey: settings.resendApiKey,
      testMode: settings.testMode,
    });

    // Log the signup
    await ctx.db.insert("audit_logs", {
      userId,
      action: "user_signup",
      entityId: userId,
      entityType: "user",
      details: "User signed up via email/password",
      timestamp: Date.now(),
    });

    return {
      success: true,
      userId,
      pharmacyId,
      emailSent: delivery.emailSent,
      deliveryStatus: delivery.status,
      previousRejection,
      message:
        "Owner account submitted. Verify your email and wait for admin approval.",
    };
  },
});

// Email/Password Sign In
export const signInWithEmail = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const fail = (message: string, code: string) => ({
      success: false as const,
      code,
      message,
    });

    const normalizedEmail = normalizeEmail(args.email);

    // Find user by email
    const user = await findUserByEmail(ctx, args.email);

    if (!user) {
      return fail("Invalid email or password", "invalid_credentials");
    }

    // Check if user has password (might be OAuth-only user)
    if (!user.passwordHash) {
      return fail(
        "This account uses social login. Please sign in with Google or GitHub.",
        "social_login_required",
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      args.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      return fail("Invalid email or password", "invalid_credentials");
    }

    if (user.email !== normalizedEmail) {
      await ctx.db.patch(user._id, {
        email: normalizedEmail,
      });
    }

    const updatedHash = await hashPassword(args.password);
    if (updatedHash !== user.passwordHash) {
      await ctx.db.patch(user._id, {
        passwordHash: updatedHash,
        passwordLastChanged: Date.now(),
      });
    }

    // Check if account is locked
    if (user.adminLocked) {
      return fail(
        "Your account has been locked. Please contact support.",
        "account_locked",
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return fail(
        "Please verify your email before signing in.",
        "email_not_verified",
      );
    }

    // Update last activity
    await ctx.db.patch(user._id, {
      activeSessionsCount: (user.activeSessionsCount || 0) + 1,
      lastActionPerformed: "signin",
    });

    // Create session
    const sessionToken = generateRandomString(32);
    await ctx.db.insert("authSessions", {
      userId: user._id,
      sessionToken,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Log the signin
    await ctx.db.insert("audit_logs", {
      userId: user._id,
      action: "user_signin",
      entityId: user._id,
      entityType: "user",
      details: "User signed in via email/password",
      timestamp: Date.now(),
    });

    return {
      success: true,
      userId: user._id,
      sessionToken,
      role: user.role,
      message: "Signed in successfully",
    };
  },
});

// Sign Out
export const signOut = mutation({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.sessionToken);

    if (user) {
      // Decrement active sessions
      await ctx.db.patch(user._id, {
        activeSessionsCount: Math.max(0, (user.activeSessionsCount || 1) - 1),
      });

      // Delete session if token provided
      const sessionToken = args.sessionToken;
      if (sessionToken) {
        const session = await ctx.db
          .query("authSessions")
          .withIndex("by_session_token", (q) =>
            q.eq("sessionToken", sessionToken),
          )
          .unique();

        if (session) {
          await ctx.db.delete(session._id);
        }
      }

      // Log the signout
      await ctx.db.insert("audit_logs", {
        userId: user._id,
        action: "user_signout",
        entityId: user._id,
        entityType: "user",
        details: "User signed out",
        timestamp: Date.now(),
      });
    }

    return { success: true, message: "Signed out successfully" };
  },
});

// Password reset request
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      // Don't reveal if user exists
      return {
        success: true,
        message: "If an account exists, a reset email has been sent",
      };
    }

    // Generate reset token
    const resetToken = generateRandomString(32);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store reset token
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
      await queueEmailSend(ctx, {
        to: normalizedEmail,
        subject: "Reset your PharmaCare password",
        html: `<p>We received a password reset request.</p><p><a href="${resetLink}">Set a new password</a></p>`,
        apiKey: settings.resendApiKey,
        testMode: settings.testMode,
      });
    }

    return {
      success: true,
      message: "If an account exists, a reset email has been sent",
    };
  },
});

// Reset password with token
export const resetPassword = mutation({
  args: {
    token: v.string(),
    email: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    // Find the token
    const verificationToken = await ctx.db
      .query("authVerificationTokens")
      .withIndex("by_identifier_token", (q) =>
        q.eq("identifier", normalizedEmail).eq("token", args.token),
      )
      .unique();

    if (!verificationToken || verificationToken.expires < Date.now()) {
      throw new Error("Invalid or expired reset token");
    }

    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const passwordHash = await hashPassword(args.newPassword);

    // Update user password and clear reset requirement
    await ctx.db.patch(user._id, {
      passwordHash,
      mustResetPassword: false,
      passwordLastChanged: Date.now(),
    });

    // Delete the used token
    await ctx.db.delete(verificationToken._id);

    // Log the action
    await ctx.db.insert("audit_logs", {
      userId: user._id,
      action: "password_reset_complete",
      entityId: user._id,
      entityType: "user",
      details: "Password reset via token",
      timestamp: Date.now(),
    });

    return { success: true, message: "Password reset successfully" };
  },
});

// Change password (for logged in users)
export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.sessionToken);

    if (!user) throw new Error("User not found");

    if (!user.passwordHash) {
      throw new Error("Password login is not enabled for this account");
    }

    const isValidPassword = await verifyPassword(
      args.currentPassword,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (args.currentPassword === args.newPassword) {
      throw new Error("New password must be different from current password");
    }

    const passwordHash = await hashPassword(args.newPassword);

    await ctx.db.patch(user._id, {
      passwordHash,
      mustResetPassword: false,
      passwordLastChanged: Date.now(),
    });

    await ctx.db.insert("audit_logs", {
      userId: user._id,
      action: "password_change",
      entityId: user._id,
      entityType: "user",
      details: "Password changed via settings",
      timestamp: Date.now(),
    });

    return { success: true, message: "Password changed successfully" };
  },
});

// Verify email
export const verifyEmail = mutation({
  args: {
    token: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    const verificationToken = await ctx.db
      .query("authVerificationTokens")
      .withIndex("by_identifier_token", (q) =>
        q.eq("identifier", normalizedEmail).eq("token", args.token),
      )
      .unique();

    if (!verificationToken || verificationToken.expires < Date.now()) {
      throw new Error("Invalid or expired verification token");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      emailVerified: true,
    });

    await ctx.db.delete(verificationToken._id);

    await ctx.db.insert("audit_logs", {
      userId: user._id,
      action: "email_verified",
      entityId: user._id,
      entityType: "user",
      details: "Email verified via token",
      timestamp: Date.now(),
    });

    return { success: true, message: "Email verified successfully" };
  },
});

// Send verification email
export const sendVerificationEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      return {
        success: true,
        emailSent: false,
        deliveryStatus: "user_not_found",
        message: "If an account exists, a verification email has been sent",
      };
    }

    if (user.emailVerified) {
      return {
        success: true,
        emailSent: false,
        deliveryStatus: "already_verified",
        message: "Email already verified",
      };
    }

    const settings = await ctx.db.query("site_settings").first();
    if (!settings?.resendApiKey) {
      return {
        success: false,
        emailSent: false,
        deliveryStatus: "missing_config",
        message:
          "Verification email service is not configured. Please contact support.",
      };
    }

    if (settings.testMode) {
      return {
        success: false,
        emailSent: false,
        deliveryStatus: "test_mode",
        message:
          "Verification email is in test mode. Disable test mode to send real emails.",
      };
    }

    const verifyToken = generateVerificationCode();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await deleteVerificationTokensForEmail(ctx, normalizedEmail);
    await ctx.db.insert("authVerificationTokens", {
      identifier: normalizedEmail,
      token: verifyToken,
      expires: expiresAt,
    });

    const verifyLink = `${process.env.SITE_URL ?? "http://localhost:5173"}/auth/verify-email?email=${encodeURIComponent(
      normalizedEmail,
    )}&token=${encodeURIComponent(verifyToken)}`;
    const delivery = await queueEmailSend(ctx, {
      to: normalizedEmail,
      subject: "Your PharmaCare verification link",
      html: `<p>Click the link below to verify your email:</p><p><a href="${verifyLink}">Verify Email</a></p>`,
      apiKey: settings.resendApiKey,
      testMode: settings.testMode,
    });

    return {
      success: true,
      emailSent: delivery.emailSent,
      deliveryStatus: delivery.status,
      message: "Verification email sent",
    };
  },
});

// Update profile picture
export const uploadProfilePicture = mutation({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      image: args.imageUrl,
    });

    await ctx.db.insert("audit_logs", {
      userId: user._id,
      action: "profile_picture_update",
      entityId: user._id,
      entityType: "user",
      details: "Profile picture updated",
      timestamp: Date.now(),
    });

    return { success: true, message: "Profile picture updated" };
  },
});

// Delete profile picture
export const deleteProfilePicture = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      image: undefined,
    });

    await ctx.db.insert("audit_logs", {
      userId: user._id,
      action: "profile_picture_delete",
      entityId: user._id,
      entityType: "user",
      details: "Profile picture deleted",
      timestamp: Date.now(),
    });

    return { success: true, message: "Profile picture deleted" };
  },
});
