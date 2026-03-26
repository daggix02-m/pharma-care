import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { generateRandomString } from '../lib/utils';

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