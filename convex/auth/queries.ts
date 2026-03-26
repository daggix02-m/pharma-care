import { query } from '../_generated/server';
import { v } from 'convex/values';

export const checkAccountStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    if (!user) {
      return { exists: false, status: 'not_found' };
    }

    return {
      exists: true,
      status: user.status,
      role: user.role,
      emailVerified: true, // Clerk handles email verification
    };
  },
});
