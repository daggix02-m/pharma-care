import { mutation } from './_generated/server';
import { v } from 'convex/values';

// Helper function to hash password (same as auth/mutations.ts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.CONVEX_AUTH_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Seeding Mutation
 * Use this to initialize the platform with a designated admin account.
 * This can be called from the Convex dashboard or via a script.
 */
export const seedAdmin = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user already exists
    const existingUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    if (existingUser) {
      // Ensure existing user has admin role
      await ctx.db.patch(existingUser._id, {
        role: 'admin',
        status: 'active',
      });
      return { success: true, message: 'Existing user elevated to admin.' };
    }

    // Insert the new admin user
    await ctx.db.insert('users', {
      email: args.email,
      full_name: args.fullName,
      role: 'admin',
      status: 'active',
      clerkId: 'seed_admin', // Placeholder until first login
      tokenIdentifier: 'seed_admin', // Placeholder until first login
    });

    return { success: true, message: 'Admin account seeded successfully.' };
  },
});

/**
 * Seed Admin with Credentials
 * Creates or elevates an admin user with email/password authentication.
 * Use this from the Convex dashboard to create the initial admin account.
 *
 * Example usage in Convex dashboard:
 * {
 *   "email": "daggi.x02@gmail.com",
 *   "fullName": "Admin User",
 *   "password": "Pharma@524"
 * }
 */
export const seedAdminWithCredentials = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate password strength
    if (args.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash the password
    const passwordHash = await hashPassword(args.password);

    // Check if the user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (existingUser) {
      // Elevate existing user to admin with credentials
      await ctx.db.patch(existingUser._id, {
        role: 'admin',
        status: 'active',
        full_name: args.fullName,
        passwordHash,
        emailVerified: true,
        passwordLastChanged: Date.now(),
      });

      // Log the action
      await ctx.db.insert('audit_logs', {
        userId: existingUser._id,
        action: 'admin_seeded',
        entityId: existingUser._id,
        entityType: 'user',
        details: 'Existing user elevated to admin with credentials via seed',
        timestamp: Date.now(),
      });

      return {
        success: true,
        message: 'Existing user elevated to admin with credentials.',
        userId: existingUser._id,
      };
    }

    // Create new admin user with credentials
    const userId = await ctx.db.insert('users', {
      email: args.email,
      full_name: args.fullName,
      name: args.fullName,
      role: 'admin',
      status: 'active',
      passwordHash,
      emailVerified: true,
      adminFlagged: false,
      adminLocked: false,
      mfaEnabled: false,
      activeSessionsCount: 0,
      passwordLastChanged: Date.now(),
      clerkId: 'seed_admin',
      tokenIdentifier: 'seed_admin',
    });

    // Log the creation
    await ctx.db.insert('audit_logs', {
      userId,
      action: 'admin_seeded',
      entityId: userId,
      entityType: 'user',
      details: 'New admin user created with credentials via seed',
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: 'Admin account seeded successfully with credentials.',
      userId,
    };
  },
});
