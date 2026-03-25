// @ts-ignore
import { query } from '../_generated/server';

export const getNotifications = query({
  handler: async (ctx: any) => {
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

    const notifications = await ctx.db
      .query('notifications')
      .filter((q: any) => q.eq(q.field('userId'), user._id))
      .order('desc')
      .take(50);

    return notifications;
  },
});

export const getUnreadCount = query({
  handler: async (ctx: any) => {
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

    const notifications = await ctx.db
      .query('notifications')
      .filter((q: any) => q.and(q.eq(q.field('userId'), user._id), q.eq(q.field('read'), false)))
      .collect();

    return notifications.length;
  },
});
