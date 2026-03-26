import { query } from '../_generated/server';

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    let pharmacy = null;
    if (user.pharmacyId) {
      pharmacy = await ctx.db.get(user.pharmacyId);
    }

    return { ...user, pharmacy };
  },
});

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    let pharmacy = null;
    if (user.pharmacyId) {
      pharmacy = await ctx.db.get(user.pharmacyId);
    }

    return { ...user, pharmacy };
  },
});
