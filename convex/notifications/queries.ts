// @ts-ignore
import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireAuth } from '../lib/auth';

export const getNotifications = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireAuth(ctx, args.sessionToken);

    const notifications = await ctx.db
      .query('notifications')
      .filter((q: any) => q.eq(q.field('userId'), user._id))
      .order('desc')
      .take(50);

    return notifications;
  },
});

export const getUnreadCount = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireAuth(ctx, args.sessionToken);

    const notifications = await ctx.db
      .query('notifications')
      .filter((q: any) => q.and(q.eq(q.field('userId'), user._id), q.eq(q.field('read'), false)))
      .collect();

    return notifications.length;
  },
});
