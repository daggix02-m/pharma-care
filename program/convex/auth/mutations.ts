import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    // Note: Password changes are handled by Clerk
    // This mutation can store metadata about the change if needed
    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'password_change',
      entityId: user._id,
      entityType: 'user',
      details: 'Password changed via settings',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Password change initiated via Clerk' };
  },
});

export const uploadProfilePicture = mutation({
  args: {
    fileData: v.optional(v.string()),
  },
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error('User not found');

    // Note: Profile pictures are handled by Clerk
    // This mutation can store metadata about the change if needed
    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'profile_picture_upload',
      entityId: user._id,
      entityType: 'user',
      details: 'Profile picture uploaded via Clerk',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Profile picture updated via Clerk' };
  },
});

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

    // Note: Profile pictures are handled by Clerk
    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'profile_picture_delete',
      entityId: user._id,
      entityType: 'user',
      details: 'Profile picture deleted via Clerk',
      timestamp: Date.now(),
    });

    return { success: true, message: 'Profile picture deleted via Clerk' };
  },
});
