import { v } from 'convex/values';
import { query } from '../_generated/server';
import { getAuthenticatedUser } from '../lib/auth';

export const getCurrentUser = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.sessionToken);

    if (!user) return null;

    let pharmacy = null;
    if (user.pharmacyId) {
      pharmacy = await ctx.db.get(user.pharmacyId);
    }
    return { ...user, pharmacy };
  },
});

export const getUser = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.sessionToken);

    if (!user) return null;

    let pharmacy = null;
    if (user.pharmacyId) {
      pharmacy = await ctx.db.get(user.pharmacyId);
    }

    return { ...user, pharmacy };
  },
});
