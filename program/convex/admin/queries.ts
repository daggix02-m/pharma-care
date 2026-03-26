// @ts-ignore
import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '../lib/auth';

export const getDashboardStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const pharmacies = await ctx.db.query('pharmacies').collect();
    const branches = await ctx.db.query('branches').collect();
    const users = await ctx.db.query('users').collect();

    return {
      totalPharmacies: pharmacies.length,
      totalBranches: branches.length,
      totalUsers: users.length,
      // Sales require sum logic which we can extract later
      totalSales: 0,
    };
  },
});

export const getPharmacies = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query('pharmacies').collect();
  },
});

export const getBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);
    const branches = await ctx.db.query('branches').collect();
    // Resolve pharmacy names for the UI
    return Promise.all(
      branches.map(async (branch: any) => {
        const pharmacy = await ctx.db.get(branch.pharmacyId);
        return {
          ...branch,
          pharmacyName: pharmacy?.name || 'Unknown Pharmacy',
        };
      })
    );
  },
});

export const getPendingBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);
    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('status'), 'pending'))
      .collect();

    return Promise.all(
      branches.map(async (branch: any) => {
        const pharmacy = await ctx.db.get(branch.pharmacyId);
        const manager = await ctx.db.get(branch.managerId);
        return {
          ...branch,
          pharmacyName: pharmacy?.name,
          managerName: manager?.full_name,
          managerEmail: manager?.email,
          staffCount: pharmacy?.staffCount,
          subscriptionTier: pharmacy?.subscriptionTier,
        };
      })
    );
  },
});

export const getAllManagers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db
      .query('users')
      .filter((q: any) => q.eq(q.field('role'), 'manager'))
      .collect();
  },
});

export const getPendingManagers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db
      .query('users')
      .filter((q: any) =>
        q.and(q.eq(q.field('role'), 'manager'), q.eq(q.field('status'), 'pending'))
      )
      .collect();
  },
});

export const getAuditLogs = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);
    const logs = await ctx.db.query('audit_logs').order('desc').collect();
    return Promise.all(
      logs.map(async (log: any) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user_name: user?.full_name || 'System',
          user_email: user?.email || 'system@pharmacare.com',
        };
      })
    );
  },
});

export const getDashboardBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const branches = await ctx.db.query('branches').collect();

    return {
      totalBranches: branches.length,
      activeBranches: branches.filter((b: any) => b.status === 'active').length,
      pendingBranches: branches.filter((b: any) => b.status === 'pending').length,
      deactivatedBranches: branches.filter((b: any) => b.status === 'deactivated').length,
      recentBranches: branches.slice(-5).reverse(),
    };
  },
});

export const getDashboardUsers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const users = await ctx.db.query('users').collect();

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.status === 'active').length,
      pendingUsers: users.filter((u: any) => u.status === 'pending').length,
      deactivatedUsers: users.filter((u: any) => u.status === 'deactivated').length,
      usersByRole: {
        admin: users.filter((u: any) => u.role === 'admin').length,
        manager: users.filter((u: any) => u.role === 'manager').length,
        pharmacist: users.filter((u: any) => u.role === 'pharmacist').length,
        cashier: users.filter((u: any) => u.role === 'cashier').length,
      },
    };
  },
});

export const getDashboardSales = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const sales = await ctx.db.query('sales').collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const salesToday = sales.filter((s: any) => s._creationTime >= today.getTime());
    const salesYesterday = sales.filter(
      (s: any) => s._creationTime >= yesterday.getTime() && s._creationTime < today.getTime()
    );
    const salesThisMonth = sales.filter((s: any) => s._creationTime >= thisMonth.getTime());

    const revenueToday = salesToday.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const revenueYesterday = salesYesterday.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const revenueThisMonth = salesThisMonth.reduce((sum: number, s: any) => sum + s.totalAmount, 0);

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0),
      salesToday: salesToday.length,
      revenueToday,
      salesYesterday: salesYesterday.length,
      revenueYesterday,
      salesThisMonth: salesThisMonth.length,
      revenueThisMonth,
      averageOrderValue:
        sales.length > 0
          ? sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0) / sales.length
          : 0,
    };
  },
});

export const getBranchById = query({
  args: {
    id: v.id('branches'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const branch = await ctx.db.get(args.id);
    if (!branch) {
      throw new Error('Branch not found');
    }

    const pharmacy = await ctx.db.get(branch.pharmacyId);
    const manager = await ctx.db.get(branch.managerId);

    return {
      ...branch,
      pharmacyName: pharmacy?.name || 'Unknown',
      managerName: manager?.full_name || 'Unassigned',
      managerEmail: manager?.email || '',
    };
  },
});

export const getActivatedManagers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const managers = await ctx.db
      .query('users')
      .filter((q: any) => q.eq(q.field('role'), 'manager'))
      .collect();

    const activatedManagers = managers.filter((m: any) => m.status === 'active');

    return await Promise.all(
      activatedManagers.map(async (manager: any) => {
        const branch = manager.branchId ? await ctx.db.get(manager.branchId) : null;
        const pharmacy = manager.pharmacyId ? await ctx.db.get(manager.pharmacyId) : null;

        return {
          ...manager,
          branchName: branch?.name || 'Unassigned',
          pharmacyName: pharmacy?.name || 'Unknown',
        };
      })
    );
  },
});

export const getManagersByBranch = query({
  args: {
    branchId: v.id('branches'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const branch = await ctx.db.get(args.branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    const managers = await ctx.db
      .query('users')
      .filter((q: any) =>
        q.and(q.eq(q.field('role'), 'manager'), q.eq(q.field('branchId'), args.branchId))
      )
      .collect();

    return managers;
  },
});

export const getSubscriptionPlans = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    return await ctx.db
      .query('subscription_plans')
      .filter((q: any) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

export const getSubscriptionHistory = query({
  args: {
    pharmacyId: v.id('pharmacies'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const history = await ctx.db
      .query('subscription_history')
      .withIndex('by_pharmacy', (q: any) => q.eq('pharmacyId', args.pharmacyId))
      .order('desc')
      .collect();

    return await Promise.all(
      history.map(async (record: any) => {
        const changedBy = await ctx.db.get(record.changedBy);
        const pharmacy = await ctx.db.get(record.pharmacyId);
        return {
          ...record,
          changedByName: changedBy?.full_name || 'System',
          pharmacyName: pharmacy?.name || 'Unknown',
        };
      })
    );
  },
});

export const getSubscriptionAnalytics = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const pharmacies = await ctx.db.query('pharmacies').collect();
    const subscriptionHistory = await ctx.db.query('subscription_history').collect();
    const subscriptionPlans = await ctx.db.query('subscription_plans').collect();

    const totalPharmacies = pharmacies.length;
    const activePharmacies = pharmacies.filter((p: any) => p.status === 'active').length;

    const subscriptionDistribution = {
      basic: pharmacies.filter((p: any) => p.subscriptionTier === 'basic').length,
      premium: pharmacies.filter((p: any) => p.subscriptionTier === 'premium').length,
      enterprise: pharmacies.filter((p: any) => p.subscriptionTier === 'enterprise').length,
    };

    const monthlyRevenue = pharmacies.reduce((sum: number, p: any) => {
      const plan = subscriptionPlans.find((pl: any) => pl.code === p.subscriptionTier);
      return sum + (plan?.price || 0);
    }, 0);

    const recentChanges = subscriptionHistory
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .slice(0, 10);

    const changeDistribution = {
      upgrade: subscriptionHistory.filter((h: any) => h.changeType === 'upgrade').length,
      downgrade: subscriptionHistory.filter((h: any) => h.changeType === 'downgrade').length,
      initial: subscriptionHistory.filter((h: any) => h.changeType === 'initial').length,
      renewal: subscriptionHistory.filter((h: any) => h.changeType === 'renewal').length,
      cancellation: subscriptionHistory.filter((h: any) => h.changeType === 'cancellation').length,
    };

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const changesThisMonth = subscriptionHistory.filter(
      (h: any) => h.createdAt >= thisMonth.getTime()
    );

    return {
      totalPharmacies,
      activePharmacies,
      subscriptionDistribution,
      monthlyRevenue,
      currency: 'ETB',
      recentChanges: recentChanges.length,
      changeDistribution,
      changesThisMonth: changesThisMonth.length,
      plans: subscriptionPlans.filter((p: any) => p.isActive).length,
    };
  },
});

export const getPharmacySubscriptionDetails = query({
  args: {
    pharmacyId: v.id('pharmacies'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error('Pharmacy not found');
    }

    const subscriptionPlan = await ctx.db
      .query('subscription_plans')
      .filter((q: any) => q.eq(q.field('code'), pharmacy.subscriptionTier))
      .first();

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), args.pharmacyId))
      .collect();

    const users = await ctx.db
      .query('users')
      .filter((q: any) => q.eq(q.field('pharmacyId'), args.pharmacyId))
      .collect();

    return {
      pharmacy: {
        ...pharmacy,
        planName: subscriptionPlan?.name || 'Unknown Plan',
        planPrice: subscriptionPlan?.price || 0,
        planFeatures: subscriptionPlan?.features || [],
      },
      usage: {
        branchesUsed: branches.length,
        branchesAllowed: subscriptionPlan?.maxBranches || 0,
        usersUsed: users.length,
        usersAllowed: subscriptionPlan?.maxUsers || 0,
      },
      isOverLimit: {
        branches: branches.length > (subscriptionPlan?.maxBranches || 0),
        users: users.length > (subscriptionPlan?.maxUsers || 0),
      },
    };
  },
});

// v4.0: Get pharmacy detail with all sections
export const getPharmacyDetail = query({
  args: {
    pharmacyId: v.id('pharmacies'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) throw new Error('Pharmacy not found');

    // Get owner details
    const owner = await ctx.db.get(pharmacy.ownerId);

    // Get all managers
    const managers = await ctx.db
      .query('users')
      .filter((q: any) =>
        q.eq(q.field('pharmacyId'), args.pharmacyId).eq(q.field('role'), 'manager')
      )
      .collect();

    // Get all staff
    const staff = await ctx.db
      .query('users')
      .filter((q: any) =>
        q.eq(q.field('pharmacyId'), args.pharmacyId).neq(q.field('role'), 'manager')
      )
      .collect();

    // Get branches
    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), args.pharmacyId))
      .collect();

    // Get recent audit logs
    const auditLogs = await ctx.db
      .query('audit_logs')
      .filter((q: any) => q.eq(q.field('entityId'), args.pharmacyId.toString()))
      .order('desc')
      .take(50);

    return {
      pharmacy,
      owner,
      managers,
      staff,
      branches,
      auditLogs,
    };
  },
});

// v4.0: Get flagged accounts
export const getFlaggedAccounts = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const users = await ctx.db
      .query('users')
      .filter((q: any) => q.eq(q.field('adminFlagged'), true))
      .collect();

    return Promise.all(
      users.map(async (user: any) => {
        const pharmacy = user.pharmacyId ? ((await ctx.db.get(user.pharmacyId)) as any) : null;
        return {
          ...user,
          pharmacyName: pharmacy?.name,
        };
      })
    );
  },
});

// v4.0: Get diagnostic sessions for a pharmacy
export const getDiagnosticSessions = query({
  args: {
    pharmacyId: v.id('pharmacies'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const sessions = await ctx.db
      .query('diagnostic_sessions')
      .filter((q: any) => q.eq(q.field('targetPharmacyId'), args.pharmacyId))
      .order('desc')
      .collect();

    return Promise.all(
      sessions.map(async (session: any) => {
        const admin = (await ctx.db.get(session.adminId)) as any;
        const targetUser = (await ctx.db.get(session.targetUserId)) as any;
        return {
          ...session,
          adminName: admin?.full_name || 'Unknown',
          targetUserName: targetUser?.full_name || 'Unknown',
        };
      })
    );
  },
});

// v4.0: Get pending appeals for admin review
export const getPendingAppeals = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const managerFlagAppeals = await ctx.db
      .query('manager_flags')
      .filter((q: any) =>
        q.and(q.eq(q.field('status'), 'flagged'), q.neq(q.field('ownerResponse'), undefined))
      )
      .collect();

    const managerFlagAppealsWithDetails = await Promise.all(
      managerFlagAppeals.map(async (flag: any) => {
        const manager = (await ctx.db.get(flag.managerId)) as any;
        const flaggedBy = (await ctx.db.get(flag.flaggedBy)) as any;
        const pharmacy = manager?.pharmacyId ? ((await ctx.db.get(manager.pharmacyId)) as any) : null;
        const owner = pharmacy?.ownerId ? ((await ctx.db.get(pharmacy.ownerId)) as any) : null;

        return {
          id: flag._id,
          type: 'manager_flag',
          managerId: flag.managerId,
          managerName: manager?.full_name || 'Unknown',
          managerEmail: manager?.email || '',
          pharmacyId: pharmacy?._id,
          pharmacyName: pharmacy?.name || 'Unknown',
          ownerId: owner?._id,
          ownerName: owner?.full_name || 'Unknown',
          flaggedBy: flaggedBy?.full_name || 'System',
          flaggedAt: flag.flaggedAt,
          flagReason: flag.flagReason,
          ownerResponse: flag.ownerResponse,
          ownerRespondedAt: flag.ownerRespondedAt,
          status: flag.status,
        };
      })
    );

    const adminActions = await ctx.db
      .query('admin_actions')
      .filter((q: any) =>
        q.and(q.eq(q.field('actionStatus'), 'active'), q.eq(q.field('ownerNotified'), true))
      )
      .collect();

    const adminActionAppeals = await Promise.all(
      adminActions.map(async (action: any) => {
        const targetUser = (await ctx.db.get(action.targetUserId)) as any;
        const performedBy = (await ctx.db.get(action.performedBy)) as any;
        const pharmacy = action.targetPharmacyId
          ? ((await ctx.db.get(action.targetPharmacyId)) as any)
          : null;
        const owner = pharmacy?.ownerId ? ((await ctx.db.get(pharmacy.ownerId)) as any) : null;

        return {
          id: action._id,
          type: 'admin_action',
          targetUserId: action.targetUserId,
          targetUserName: targetUser?.full_name || 'Unknown',
          targetUserEmail: targetUser?.email || '',
          pharmacyId: pharmacy?._id,
          pharmacyName: pharmacy?.name || 'Unknown',
          ownerId: owner?._id,
          ownerName: owner?.full_name || 'Unknown',
          performedBy: performedBy?.full_name || 'System',
          actionType: action.actionType,
          reason: action.reason,
          timestamp: action.timestamp,
          ownerNotifiedAt: action.ownerNotifiedAt,
          actionStatus: action.actionStatus,
        };
      })
    );

    return {
      managerFlagAppeals: managerFlagAppealsWithDetails,
      adminActionAppeals,
      totalPending: managerFlagAppealsWithDetails.length + adminActionAppeals.length,
    };
  },
});
