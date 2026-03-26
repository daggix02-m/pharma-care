// @ts-ignore
import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireManager } from '../lib/auth';

export const getDashboardStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();

    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db.query('medicines').collect();

    const pharmacyMedicines = medicines.filter((m: any) => branchIds.includes(m.branchId));

    // Calculate total stock and low stock
    const totalStock = pharmacyMedicines.reduce((acc: number, m: any) => acc + m.stock, 0);
    const lowStockItems = pharmacyMedicines.filter((m: any) => m.stock <= 10).length;

    // Get sales for today or last 30 days
    const sales = await ctx.db.query('sales').collect();
    const pharmacySales = sales.filter((s: any) => branchIds.includes(s.branchId));
    const totalRevenue = pharmacySales.reduce((acc: number, s: any) => acc + s.totalAmount, 0);

    return {
      totalStaff: 12, // Placeholder
      totalBranches: branches.length,
      totalRevenue,
      lowStockItems,
      stockLevel: totalStock,
      revenueChange: '+12.5%',
      stockChange: '-2.3%',
    };
  },
});

export const getStaffMembers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const staff = await ctx.db
      .query('users')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();

    return staff;
  },
});

export const getBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();

    return branches;
  },
});

export const getAllMedicines = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();

    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db.query('medicines').collect();

    return medicines.filter((m: any) => branchIds.includes(m.branchId));
  },
});

export const getMedicineDetails = query({
  args: { 
    id: v.id('medicines'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const medicine = await ctx.db.get(args.id);
    return medicine;
  },
});

export const getSalesByBranch = query({
  args: { 
    branchId: v.id('branches'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const sales = await ctx.db
      .query('sales')
      .withIndex('by_branch', (q: any) => q.eq('branchId', args.branchId))
      .collect();
    return sales;
  },
});

export const getSales = query({
  args: { 
    branchId: v.optional(v.id('branches')),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    let q = ctx.db.query('sales');
    if (args.branchId) {
      q = q.withIndex('by_branch', (q_obj: any) => q_obj.eq('branchId', args.branchId));
    }

    const allSales = await q.collect();

    // If no branchId, manually filter by pharmacy
    if (!args.branchId) {
      const branches = await ctx.db
        .query('branches')
        .filter((b: any) => b.eq(b.field('pharmacyId'), manager.pharmacyId))
        .collect();
      const branchIds = branches.map((b: any) => b._id);
      return allSales.filter((s: any) => branchIds.includes(s.branchId));
    }

    return allSales;
  },
});

export const getSalesSummary = query({
  args: { 
    branchId: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (_ctx: any, _args: any) => {
    // Mock for now
    return [
      { date: '2024-03-10', amount: 4500 },
      { date: '2024-03-11', amount: 5200 },
      { date: '2024-03-12', amount: 4800 },
      { date: '2024-03-13', amount: 6100 },
      { date: '2024-03-14', amount: 5900 },
      { date: '2024-03-15', amount: 7200 },
      { date: '2024-03-16', amount: 6800 },
    ];
  },
});

export const getInventorySummary = query({
  args: { 
    branchId: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (_ctx: any, _args: any) => {
    return [
      { name: 'Tablets', value: 45 },
      { name: 'Syrups', value: 25 },
      { name: 'Injections', value: 15 },
      { name: 'Other', value: 15 },
    ];
  },
});

export const getTopSelling = query({
  args: { 
    branchId: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (_ctx: any, _args: any) => {
    return [
      { name: 'Paracetamol 500mg', sales: 124, revenue: 1240 },
      { name: 'Amoxicillin 250mg', sales: 86, revenue: 2150 },
      { name: 'Ibuprofen 400mg', sales: 65, revenue: 975 },
      { name: 'Cough Syrup', sales: 48, revenue: 1440 },
    ];
  },
});

export const getNotifications = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q: any) => q.eq('userId', manager._id))
      .order('desc')
      .collect();

    return notifications;
  },
});

export const getBranchOverview = query({
  args: { 
    branchId: v.optional(v.id('branches')),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    if (!args.branchId) {
      return null;
    }
    const branch = await ctx.db.get(args.branchId);
    return branch;
  },
});

export const getMedicinesByBranch = query({
  args: { 
    branchId: v.id('branches'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    // Verify: branch belongs to this manager's pharmacy
    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error('Unauthorized: Branch does not belong to your pharmacy');
    }

    return await ctx.db
      .query('medicines')
      .withIndex('by_branch', (q: any) => q.eq('branchId', args.branchId))
      .collect();
  },
});

export const getPendingBranches = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    return await ctx.db
      .query('branches')
      .filter((q: any) =>
        q.and(q.eq(q.field('pharmacyId'), manager.pharmacyId), q.eq(q.field('status'), 'pending'))
      )
      .collect();
  },
});

export const getBranchMedicineStats = query({
  args: { 
    branchId: v.id('branches'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    // Verify: branch belongs to this manager's pharmacy
    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.pharmacyId !== manager.pharmacyId) {
      throw new Error('Unauthorized: Branch does not belong to your pharmacy');
    }

    const medicines = await ctx.db
      .query('medicines')
      .withIndex('by_branch', (q: any) => q.eq('branchId', args.branchId))
      .collect();

    return {
      totalMedicines: medicines.length,
      totalStock: medicines.reduce((acc: number, m: any) => acc + m.stock, 0),
      lowStockItems: medicines.filter((m: any) => m.stock <= 10).length,
      categories: medicines.reduce((acc: any, m: any) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
      }, {}),
    };
  },
});

export const searchMedicines = query({
  args: { 
    query: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    if (!args.query.trim()) return [];

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();
    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db.query('medicines').collect();
    const pharmacyMedicines = medicines.filter((m: any) => branchIds.includes(m.branchId));

    return pharmacyMedicines.filter(
      (m: any) =>
        m.name?.toLowerCase().includes(args.query.toLowerCase()) ||
        m.category?.toLowerCase().includes(args.query.toLowerCase()) ||
        m.manufacturer?.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});

export const getMedicinesByCategory = query({
  args: { 
    category: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();
    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db.query('medicines').collect();
    const pharmacyMedicines = medicines.filter(
      (m: any) =>
        branchIds.includes(m.branchId) && m.category?.toLowerCase() === args.category.toLowerCase()
    );

    return pharmacyMedicines;
  },
});

export const getAuditTrail = query({
  args: { 
    limit: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    let logsQuery = ctx.db
      .query('audit_logs')
      .filter((q: any) => q.eq(q.field('userId'), manager._id))
      .order('desc');

    if (args.limit) {
      logsQuery = logsQuery.take(args.limit);
    }

    const logs = await logsQuery.collect();

    return logs;
  },
});

export const getReportsSales = query({
  args: { 
    period: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();
    const branchIds = branches.map((b: any) => b._id);

    let startDate = new Date();
    const period = args.period || '7days';

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const sales = await ctx.db.query('sales').collect();
    const pharmacySales = sales.filter(
      (s: any) => branchIds.includes(s.branchId) && s._creationTime >= startDate.getTime()
    );

    return {
      period,
      totalSales: pharmacySales.length,
      totalRevenue: pharmacySales.reduce((sum: number, s: any) => sum + s.totalAmount, 0),
      salesByBranch: await Promise.all(
        branches.map(async (branch: any) => {
          const branchSales = pharmacySales.filter((s: any) => s.branchId === branch._id);
          return {
            branchId: branch._id,
            branchName: branch.name,
            sales: branchSales.length,
            revenue: branchSales.reduce((sum: number, s: any) => sum + s.totalAmount, 0),
          };
        })
      ),
    };
  },
});

export const getReportsInventory = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();
    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db.query('medicines').collect();
    const pharmacyMedicines = medicines.filter((m: any) => branchIds.includes(m.branchId));

    return {
      totalMedicines: pharmacyMedicines.length,
      totalStock: pharmacyMedicines.reduce((sum: number, m: any) => sum + m.stock, 0),
      totalValue: pharmacyMedicines.reduce((sum: number, m: any) => sum + m.stock * m.price, 0),
      lowStockCount: pharmacyMedicines.filter((m: any) => m.stock <= 10).length,
      outOfStockCount: pharmacyMedicines.filter((m: any) => m.stock === 0).length,
      inventoryByBranch: await Promise.all(
        branches.map(async (branch: any) => {
          const branchMedicines = pharmacyMedicines.filter((m: any) => m.branchId === branch._id);
          return {
            branchId: branch._id,
            branchName: branch.name,
            totalMedicines: branchMedicines.length,
            totalStock: branchMedicines.reduce((sum: number, m: any) => sum + m.stock, 0),
            totalValue: branchMedicines.reduce((sum: number, m: any) => sum + m.stock * m.price, 0),
          };
        })
      ),
    };
  },
});

export const getReportsStaffActivity = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const staff = await ctx.db
      .query('users')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();

    const staffIds = staff.map((s: any) => s._id);
    const allLogs = await ctx.db.query('audit_logs').collect();
    const staffLogs = allLogs.filter((log: any) => staffIds.includes(log.userId));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await Promise.all(
      staff.map(async (member: any) => {
        const memberLogs = staffLogs.filter((log: any) => log.userId === member._id);
        const todayLogs = memberLogs.filter((log: any) => log._creationTime >= today.getTime());

        return {
          userId: member._id,
          name: member.full_name,
          email: member.email,
          role: member.role,
          totalActions: memberLogs.length,
          todayActions: todayLogs.length,
          lastActivity: memberLogs.length > 0 ? memberLogs[0].timestamp : null,
        };
      })
    );
  },
});

export const getRefundPolicy = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const pharmacy = await ctx.db.get(manager.pharmacyId);
    if (!pharmacy) {
      return {
        allow_refunds: true,
        refund_window_days: 7,
        allow_discounts: true,
        max_discount_percent: 20,
        require_manager_approval: false,
      };
    }

    return (
      pharmacy.refundPolicy || {
        allow_refunds: true,
        refund_window_days: 7,
        allow_discounts: true,
        max_discount_percent: 20,
        require_manager_approval: false,
      }
    );
  },
});

export const getPharmacyByCode = query({
  args: { 
    code: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const pharmacies = await ctx.db.query('pharmacies').collect();
    const pharmacy = pharmacies.find(
      (p: any) => p.licenseCode === args.code || p.inviteCode === args.code
    );

    if (!pharmacy) {
      return null;
    }

    return {
      _id: pharmacy._id,
      name: pharmacy.name,
      licenseCode: pharmacy.licenseCode,
      status: pharmacy.status,
      subscriptionTier: pharmacy.subscriptionTier,
    };
  },
});

export const getMyPharmacy = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const pharmacy = await ctx.db.get(manager.pharmacyId);
    if (!pharmacy) {
      return null;
    }

    return {
      _id: pharmacy._id,
      name: pharmacy.name,
      inviteCode: pharmacy.inviteCode || null,
      licenseCode: pharmacy.licenseCode || null,
      status: pharmacy.status,
      subscriptionTier: pharmacy.subscriptionTier || null,
      refundPolicy: pharmacy.refundPolicy || null,
    };
  },
});

export const getStaffActivityLogs = query({
  args: { 
    staffId: v.id('users'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const staffMember = await ctx.db.get(args.staffId);
    if (!staffMember || staffMember.pharmacyId !== manager.pharmacyId) {
      throw new Error('Unauthorized: Staff member not found or not in your pharmacy');
    }

    const logs = await ctx.db
      .query('audit_logs')
      .filter((q: any) => q.eq(q.field('userId'), args.staffId))
      .order('desc')
      .take(50)
      .collect();

    return logs;
  },
});

export const getSalesByPeriod = query({
  args: { 
    period: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();
    const branchIds = branches.map((b: any) => b._id);

    let startDate = new Date();
    const period = args.period || '7days';

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const sales = await ctx.db.query('sales').collect();
    const pharmacySales = sales.filter(
      (s: any) => branchIds.includes(s.branchId) && s._creationTime >= startDate.getTime()
    );

    const salesByDay: Record<string, number> = {};
    pharmacySales.forEach((sale: any) => {
      const date = new Date(sale._creationTime).toISOString().split('T')[0];
      salesByDay[date] = (salesByDay[date] || 0) + sale.totalAmount;
    });

    return {
      period,
      startDate: startDate.getTime(),
      endDate: Date.now(),
      totalSales: pharmacySales.length,
      totalRevenue: pharmacySales.reduce((sum: number, s: any) => sum + s.totalAmount, 0),
      salesByDay: Object.entries(salesByDay).map(([date, revenue]) => ({ date, revenue })),
      dailyAverage:
        pharmacySales.length > 0
          ? pharmacySales.reduce((sum: number, s: any) => sum + s.totalAmount, 0) / 7
          : 0,
    };
  },
});

export const getExpiringMedicines = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();
    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db.query('medicines').collect();
    const pharmacyMedicines = medicines.filter((m: any) => branchIds.includes(m.branchId));

    const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const expiringMedicines = pharmacyMedicines.filter((m: any) => {
      if (!m.expiryDate) return false;
      return m.expiryDate <= thirtyDaysFromNow;
    });

    return expiringMedicines;
  },
});

export const getLowStockMedicines = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const manager = await requireManager(ctx, args.sessionToken);

    const branches = await ctx.db
      .query('branches')
      .filter((q: any) => q.eq(q.field('pharmacyId'), manager.pharmacyId))
      .collect();
    const branchIds = branches.map((b: any) => b._id);

    const medicines = await ctx.db.query('medicines').collect();
    const pharmacyMedicines = medicines.filter((m: any) => branchIds.includes(m.branchId));

    const lowStockMedicines = pharmacyMedicines.filter((m: any) => m.stock <= 10);

    return lowStockMedicines;
  },
});
