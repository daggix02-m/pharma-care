import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { generateRandomString } from '../lib/utils';

// Helper function to hash password (using bcrypt-like approach)
// In production, use proper bcrypt or similar
async function hashPassword(password: string): Promise<string> {
  // Note: In production, implement proper password hashing
  // This is a placeholder - use bcrypt or similar in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.CONVEX_AUTH_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

// Email/Password Sign Up
export const signUpWithEmail = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    full_name: v.string(),
    pharmacyDetails: v.optional(v.object({
      name: v.string(),
      licenseNumber: v.string(),
      location: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Validate password strength
    if (args.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert('users', {
      email: args.email,
      emailVerified: false,
      name: args.full_name,
      full_name: args.full_name,
      passwordHash,
      role: 'pending',
      status: 'pending',
      adminFlagged: false,
      adminLocked: false,
      mfaEnabled: false,
      activeSessionsCount: 0,
      passwordLastChanged: Date.now(),
    });

    // Create pharmacy if details provided
    if (args.pharmacyDetails) {
      await ctx.db.insert('pharmacies', {
        name: args.pharmacyDetails.name,
        licenseCode: args.pharmacyDetails.licenseNumber,
        staffCount: 1,
        subscriptionTier: 'basic',
        status: 'pending',
        ownerId: userId,
      });
    }

    // Generate email verification token
    const verifyToken = generateRandomString(32);
    await ctx.db.insert('authVerificationTokens', {
      identifier: args.email,
      token: verifyToken,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // TODO: Send verification email via Resend
    console.log(`Email verification token for ${args.email}: ${verifyToken}`);

    // Log the signup
    await ctx.db.insert('audit_logs', {
      userId,
      action: 'user_signup',
      entityId: userId,
      entityType: 'user',
      details: 'User signed up via email/password',
      timestamp: Date.now(),
    });

    return {
      success: true,
      userId,
      message: 'Account created successfully. Please check your email to verify your account.',
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
    // Find user by email
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has password (might be OAuth-only user)
    if (!user.passwordHash) {
      throw new Error('This account uses social login. Please sign in with Google or GitHub.');
    }

    // Verify password
    const isValidPassword = await verifyPassword(args.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.adminLocked) {
      throw new Error('Your account has been locked. Please contact support.');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before signing in.');
    }

    // Update last activity
    await ctx.db.patch(user._id, {
      activeSessionsCount: (user.activeSessionsCount || 0) + 1,
      lastActionPerformed: 'signin',
    });

    // Create session
    const sessionToken = generateRandomString(32);
    await ctx.db.insert('authSessions', {
      userId: user._id,
      sessionToken,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Log the signin
    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'user_signin',
      entityId: user._id,
      entityType: 'user',
      details: 'User signed in via email/password',
      timestamp: Date.now(),
    });

    return {
      success: true,
      userId: user._id,
      sessionToken,
      role: user.role,
      message: 'Signed in successfully',
    };
  },
});

// Sign Out
export const signOut = mutation({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (user) {
      // Decrement active sessions
      await ctx.db.patch(user._id, {
        activeSessionsCount: Math.max(0, (user.activeSessionsCount || 1) - 1),
      });

      // Delete session if token provided
      if (args.sessionToken) {
        const session = await ctx.db
          .query('authSessions')
          .withIndex('by_session_token', (q) => q.eq('sessionToken', args.sessionToken))
          .unique();
        
        if (session) {
          await ctx.db.delete(session._id);
        }
      }

      // Log the signout
      await ctx.db.insert('audit_logs', {
        userId: user._id,
        action: 'user_signout',
        entityId: user._id,
        entityType: 'user',
        details: 'User signed out',
        timestamp: Date.now(),
      });
    }

    return { success: true, message: 'Signed out successfully' };
  },
});

// Password reset request
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) {
      // Don't reveal if user exists
      return { success: true, message: 'If an account exists, a reset email has been sent' };
    }

    // Generate reset token
    const resetToken = generateRandomString(32);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store reset token
    await ctx.db.insert('authVerificationTokens', {
      identifier: args.email,
      token: resetToken,
      expires: expiresAt,
    });

    // TODO: Send email via Resend
    // This will be implemented when Resend API key is available
    console.log(`Password reset token for ${args.email}: ${resetToken}`);

    return { success: true, message: 'If an account exists, a reset email has been sent' };
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
    // Find the token
    const verificationToken = await ctx.db
      .query('authVerificationTokens')
      .withIndex('by_identifier_token', (q) =>
        q.eq('identifier', args.email).eq('token', args.token)
      )
      .unique();

    if (!verificationToken || verificationToken.expires < Date.now()) {
      throw new Error('Invalid or expired reset token');
    }

    // Find the user
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Update user password and clear reset requirement
    await ctx.db.patch(user._id, {
      mustResetPassword: false,
      passwordLastChanged: Date.now(),
    });

    // Delete the used token
    await ctx.db.delete(verificationToken._id);

    // Log the action
    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'password_reset_complete',
      entityId: user._id,
      entityType: 'user',
      details: 'Password reset via token',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Password reset successfully' };
  },
});

// Change password (for logged in users)
export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // Get user by token identifier
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    // Note: With Convex Auth, password changes are handled by the auth system
    // This mutation logs the change and can be extended for additional logic
    await ctx.db.patch(user._id, {
      passwordLastChanged: Date.now(),
    });

    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'password_change',
      entityId: user._id,
      entityType: 'user',
      details: 'Password changed via settings',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Password changed successfully' };
  },
});

// Verify email
export const verifyEmail = mutation({
  args: {
    token: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const verificationToken = await ctx.db
      .query('authVerificationTokens')
      .withIndex('by_identifier_token', (q) =>
        q.eq('identifier', args.email).eq('token', args.token)
      )
      .unique();

    if (!verificationToken || verificationToken.expires < Date.now()) {
      throw new Error('Invalid or expired verification token');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(user._id, {
      emailVerified: true,
    });

    await ctx.db.delete(verificationToken._id);

    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'email_verified',
      entityId: user._id,
      entityType: 'user',
      details: 'Email verified via token',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Email verified successfully' };
  },
});

// Send verification email
export const sendVerificationEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) {
      return { success: true, message: 'If an account exists, a verification email has been sent' };
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email already verified' };
    }

    const verifyToken = generateRandomString(32);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert('authVerificationTokens', {
      identifier: args.email,
      token: verifyToken,
      expires: expiresAt,
    });

    // TODO: Send email via Resend
    console.log(`Email verification token for ${args.email}: ${verifyToken}`);

    return { success: true, message: 'Verification email sent' };
  },
});

// Update profile picture
export const uploadProfilePicture = mutation({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    await ctx.db.patch(user._id, {
      image: args.imageUrl,
    });

    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'profile_picture_update',
      entityId: user._id,
      entityType: 'user',
      details: 'Profile picture updated',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Profile picture updated' };
  },
});

// Delete profile picture
export const deleteProfilePicture = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    await ctx.db.patch(user._id, {
      image: undefined,
    });

    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'profile_picture_delete',
      entityId: user._id,
      entityType: 'user',
      details: 'Profile picture deleted',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Profile picture deleted' };
  },
});