// @ts-ignore
import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { hasPermission, Permission } from '../lib/permissions';

export const sendOwnerMessage = mutation({
  args: {
    message: v.string(),
    isUrgent: v.optional(v.boolean()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const owner = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!owner || !hasPermission(owner, Permission.SEND_OWNER_MESSAGES)) {
      throw new Error('Unauthorized: Owner only');
    }

    const pharmacyId = owner.pharmacyId;
    if (!pharmacyId) {
      throw new Error('No pharmacy associated with this owner');
    }

    await ctx.db.insert('owner_messages', {
      pharmacyId,
      ownerId: owner._id,
      message: args.message,
      isUrgent: args.isUrgent || false,
      sentAt: Date.now(),
      status: 'unread',
      repliedAt: null,
      reply: null,
    });

    await ctx.db.insert('audit_logs', {
      userId: owner._id,
      action: 'send_owner_message',
      entityId: null,
      entityType: 'owner_message',
      details: `Owner sent message${args.isUrgent ? ' (urgent)' : ''}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const submitAppeal = mutation({
  args: {
    appealType: v.string(),
    description: v.string(),
    actionId: v.optional(v.id('admin_actions')),
    flagId: v.optional(v.id('manager_flags')),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    let targetId = args.actionId || args.flagId;
    let targetEntityType = args.actionId ? 'admin_action' : 'manager_flag';

    if (!targetId) {
      throw new Error('Must provide either actionId or flagId');
    }

    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'submit_appeal',
      entityId: targetId,
      entityType: targetEntityType,
      details: `Appeal submitted: ${args.appealType}`,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
