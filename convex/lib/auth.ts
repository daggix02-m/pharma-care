/**
 * Get authenticated user from either Convex Auth or session token
 * This helper supports both authentication methods for backward compatibility
 */
export async function getAuthenticatedUser(ctx: any, sessionToken?: string) {
  // First try Convex built-in auth
  const identity = await ctx.auth.getUserIdentity();
  if (identity !== null) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    // If Convex identity exists but isn't mapped to an app user yet,
    // fall back to session-token auth instead of treating as unauthenticated.
    if (user) {
      return user;
    }
  }

  // Fallback: lookup by session token
  if (sessionToken) {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_session_token", (q: any) =>
        q.eq("sessionToken", sessionToken),
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
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error(
      "Unauthorized: No user found - session may be invalid or expired",
    );
  }

  if (user.role !== "admin") {
    throw new Error(`Unauthorized: Admin only (user has role: ${user.role})`);
  }
  return user;
}

/**
 * Require manager role
 */
export async function requireManager(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "manager") {
    throw new Error("Unauthorized: Manager only");
  }

  return user;
}

/**
 * Require pharmacist role
 */
export async function requirePharmacist(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "pharmacist") {
    throw new Error("Unauthorized: Pharmacist only");
  }

  return user;
}

/**
 * Require cashier role
 */
export async function requireCashier(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "cashier") {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Check if user is admin (returns null instead of throwing)
 */
export async function checkAdmin(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);
  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * Check if user is authenticated (returns null instead of throwing)
 */
export async function checkAuth(ctx: any, sessionToken?: string) {
  return await getAuthenticatedUser(ctx, sessionToken);
}

/**
 * Require admin role
 */
export async function requireOwner(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!["admin", "owner"].includes(user.role)) {
    throw new Error("Unauthorized: Owner or Admin only");
  }

  return user;
}

/**
 * Require any authenticated user
 */
export async function requireAuth(ctx: any, sessionToken?: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
