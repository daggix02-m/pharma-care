import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { generateRandomString } from "../lib/utils";
import { getAuthenticatedUser } from "../lib/auth";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

// Email/Password Sign Up
export const signUpWithEmail = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    full_name: v.string(),
    pharmacyDetails: v.optional(
      v.object({
        name: v.string(),
        licenseNumber: v.string(),
        location: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existingUser) {
      throw new Error("An account with this email already exists");
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
      name: args.full_name,
      full_name: args.full_name,
      passwordHash,
      role: "pending",
      status: "pending",
      adminFlagged: false,
      adminLocked: false,
      mfaEnabled: false,
      activeSessionsCount: 0,
      passwordLastChanged: Date.now(),
    });

    // Create pharmacy if details provided
    if (args.pharmacyDetails) {
      await ctx.db.insert("pharmacies", {
        name: args.pharmacyDetails.name,
        licenseCode: args.pharmacyDetails.licenseNumber,
        staffCount: 1,
        subscriptionTier: "basic",
        status: "pending",
        ownerId: userId,
      });
    }

    // Generate email verification token
    const verifyToken = generateRandomString(32);
    await ctx.db.insert("authVerificationTokens", {
      identifier: normalizedEmail,
      token: verifyToken,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // TODO: Send verification email via Resend
    console.log(
      `Email verification token for ${normalizedEmail}: ${verifyToken}`,
    );

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
      message:
        "Account created successfully. Please check your email to verify your account.",
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
    const normalizedEmail = normalizeEmail(args.email);

    // Find user by email
    const user = await findUserByEmail(ctx, args.email);

    if (!user) {
      console.log(
        `[auth] Sign-in failed: user not found for ${normalizedEmail}`,
      );
      throw new Error("Invalid email or password");
    }

    // Check if user has password (might be OAuth-only user)
    if (!user.passwordHash) {
      throw new Error(
        "This account uses social login. Please sign in with Google or GitHub.",
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      args.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      console.log(
        `[auth] Sign-in failed: password mismatch for ${normalizedEmail}`,
      );
      throw new Error("Invalid email or password");
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
      throw new Error("Your account has been locked. Please contact support.");
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error("Please verify your email before signing in.");
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

    // TODO: Send email via Resend
    // This will be implemented when Resend API key is available
    console.log(`Password reset token for ${normalizedEmail}: ${resetToken}`);

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
        message: "If an account exists, a verification email has been sent",
      };
    }

    if (user.emailVerified) {
      return { success: true, message: "Email already verified" };
    }

    const verifyToken = generateRandomString(32);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("authVerificationTokens", {
      identifier: normalizedEmail,
      token: verifyToken,
      expires: expiresAt,
    });

    // TODO: Send email via Resend
    console.log(
      `Email verification token for ${normalizedEmail}: ${verifyToken}`,
    );

    return { success: true, message: "Verification email sent" };
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
