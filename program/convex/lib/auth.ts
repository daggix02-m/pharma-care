import { v } from 'convex/values';

/**
 * Get authenticated user from either Convex Auth or session token
 * This helper supports both authentication methods for backward compatibility
 */
export async function getAuthenticatedUser(ctx: any, sessionToken?: string) {
  // First try Convex built-in auth
  const identity = await ctx.auth.getUserIdentity();
  if (identity !== null) {
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();
    return user;
  }

  // Fallback: lookup by session token
  if (sessionToken) {
    const session = await ctx.db
      .query('authSessions')
      .withIndex('by_session_token', (q: any) =>
        q.eq('sessionToken', sessionToken)
      )
      .first();

    if (session && session.expires > Date.now()) {
      const user = await ctx.db.get(session.userId);
      return user;
    }
  }

  return null;
}

/**
 * Require admin role
 */
export async function requireAdmin(ctx: any, sessionToken?: string) {
  console.log('[AUTH] requireAdmin called with sessionToken:', sessionToken ? 'present' : 'missing');
  
  const user = await getAuthenticatedUser(ctx, sessionToken);
  
  console.log('[AUTH] getAuthenticatedUser returned:', user ? `user ${user._id} with role ${user.role}` : 'null');

  if (!user) {
    console.log('[AUTH] FAILED: No user found');
    throw new Error('Unauthorized: No user found - session may be invalid or expired');
  }

  if (user.role !== 'admin') {
    console.log('[AUTH] FAILED: User role is', user.role, 'not admin');
    throw new Error(`Unauthorized: Admin only (user has role: ${user.role})`);
  }

  console.log('[AUTH] SUCCESS: Admin authenticated');
  return user;
}

/**
 * Require manager or admin role
 */
export async function requireManager(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!['admin', 'manager'].includes(user.role)) {
    throw new Error('Unauthorized: Manager or Admin only');
  }

  return user;
}

/**
 * Require pharmacist, manager, or admin role
 */
export async function requirePharmacist(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!['admin', 'manager', 'pharmacist'].includes(user.role)) {
    throw new Error('Unauthorized: Pharmacist, Manager, or Admin only');
  }

  return user;
}

/**
 * Require cashier, pharmacist, manager, or admin role
 */
export async function requireCashier(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!['admin', 'manager', 'pharmacist', 'cashier'].includes(user.role)) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require owner or admin role
 */
export async function requireOwner(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!['admin', 'owner'].includes(user.role)) {
    throw new Error('Unauthorized: Owner or Admin only');
  }

  return user;
}

/**
 * Require any authenticated user
 */
export async function requireAuth(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
