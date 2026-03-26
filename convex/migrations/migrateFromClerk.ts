import { mutation } from '../_generated/server';
import { v } from 'convex/values';

/**
 * Migration script to move users from Clerk to Convex Auth
 *
 * Usage:
 * 1. Export users from Clerk Dashboard as CSV
 * 2. Parse CSV and call this mutation for each user
 * 3. Set mustResetPassword: true for all migrated users
 * 4. Send password reset emails
 *
 * Note: This mutation handles the data migration only.
 * Users will need to reset their passwords as we cannot migrate password hashes.
 */

interface ClerkUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: number;
  // Additional Clerk fields...
}

export const migrateUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
    pharmacyId: v.optional(v.id('pharmacies')),
    branchId: v.optional(v.id('branches')),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user already migrated
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (existingUser) {
      // Check if already migrated from Clerk
      if (existingUser.migratedFromClerk) {
        return {
          success: false,
          message: 'User already migrated from Clerk',
          userId: existingUser._id,
        };
      }

      // User exists but wasn't migrated (maybe created manually)
      // Update with Clerk info
      await ctx.db.patch(existingUser._id, {
        clerkId: args.clerkId,
        migratedFromClerk: true,
        migrationCompletedAt: Date.now(),
        mustResetPassword: true,
        name:
          args.firstName && args.lastName
            ? `${args.firstName} ${args.lastName}`
            : existingUser.name,
        full_name:
          args.firstName && args.lastName
            ? `${args.firstName} ${args.lastName}`
            : existingUser.full_name,
        image: args.imageUrl || existingUser.image,
      });

      // Record migration status
      await ctx.db.insert('migration_status', {
        userId: existingUser._id,
        migratedFrom: 'clerk',
        migratedAt: Date.now(),
        passwordResetSent: false,
        emailVerified: true, // Assume verified if already in Clerk
      });

      return {
        success: true,
        message: 'Existing user updated with Clerk data',
        userId: existingUser._id,
      };
    }

    // Create new user from Clerk data
    const fullName =
      args.firstName && args.lastName
        ? `${args.firstName} ${args.lastName}`
        : args.email.split('@')[0];

    const userId = await ctx.db.insert('users', {
      email: args.email,
      emailVerified: true, // Clerk users are already verified
      name: fullName,
      full_name: fullName,
      image: args.imageUrl,
      role: args.role || 'pending',
      status: args.status || 'active',
      pharmacyId: args.pharmacyId,
      branchId: args.branchId,
      clerkId: args.clerkId,
      migratedFromClerk: true,
      migrationCompletedAt: Date.now(),
      mustResetPassword: true, // Force password reset
      // Set other default fields
      adminFlagged: false,
      adminLocked: false,
      mfaEnabled: false,
      activeSessionsCount: 0,
    });

    // Record migration status
    await ctx.db.insert('migration_status', {
      userId,
      migratedFrom: 'clerk',
      migratedAt: Date.now(),
      passwordResetSent: false,
      emailVerified: true,
    });

    // Create audit log
    await ctx.db.insert('audit_logs', {
      userId,
      action: 'user_migrated_from_clerk',
      entityId: userId,
      entityType: 'user',
      details: `User migrated from Clerk ID: ${args.clerkId}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: 'User migrated successfully',
      userId,
    };
  },
});

// Bulk migration status check
export const getMigrationStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const allMigrations = await ctx.db.query('migration_status').collect();

    const totalMigrated = allMigrations.length;
    const passwordResetSent = allMigrations.filter((m) => m.passwordResetSent).length;
    const pendingPasswordReset = totalMigrated - passwordResetSent;

    return {
      totalMigrated,
      passwordResetSent,
      pendingPasswordReset,
      migrations: allMigrations,
    };
  },
});

// Mark password reset as sent
export const markPasswordResetSent = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const migration = await ctx.db
      .query('migration_status')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .unique();

    if (migration) {
      await ctx.db.patch(migration._id, {
        passwordResetSent: true,
      });
    }

    return { success: true };
  },
});

// Helper to get all users needing password reset
export const getUsersNeedingPasswordReset = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('migratedFromClerk'), true))
      .filter((q) => q.eq(q.field('mustResetPassword'), true))
      .collect();

    return users.map((user) => ({
      userId: user._id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    }));
  },
});
