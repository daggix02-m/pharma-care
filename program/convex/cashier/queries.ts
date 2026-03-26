import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireCashier } from '../lib/auth';

export const getDashboardStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const sales = await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .collect();

    // Summing today's sales could be done by filtering timestamps (Convex has _creationTime)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySales = sales.filter((s) => s._creationTime > today.getTime());

    return {
      totalDailySales: dailySales.length,
      revenueToday: dailySales.reduce((acc, s) => acc + s.totalAmount, 0),
    };
  },
});

export const getProducts = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    if (!user.branchId) {
      throw new Error('Unauthorized: Cashier only');
    }

    // Cashiers just need to list products to sell them
    return await ctx.db
      .query('medicines')
      .filter((q) => q.eq(q.field('branchId'), user.branchId))
      .collect();
  },
});

export const getDailySales = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .filter((q) => q.gte(q.field('_creationTime'), today.getTime()));
  },
});

export const searchMedicines = query({
  args: { 
    query: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    if (!user.branchId) {
      throw new Error('Unauthorized: Cashier only');
    }

    if (!args.query.trim()) {
      return [];
    }

    const medicines = await ctx.db
      .query('medicines')
      .filter((q) => q.eq(q.field('branchId'), user.branchId))
      .collect();

    const filtered = medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(args.query.toLowerCase()) ||
        m.category?.toLowerCase().includes(args.query.toLowerCase()) ||
        m.manufacturer?.toLowerCase().includes(args.query.toLowerCase())
    );

    // Transform to snake_case for frontend compatibility
    return filtered.map((m: any) => ({
      medicine_id: m._id,
      medicine_name: m.name,
      unit_price: m.price,
      stock: m.stock,
      category: m.category,
      manufacturer: m.manufacturer,
      dosage: m.dosage,
      _id: m._id,
      _creationTime: m._creationTime,
      name: m.name,
      price: m.price,
    }));
  },
});

export const getTransactions = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    return await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .order('desc')
      .collect();
  },
});

export const getTransactionDetails = query({
  args: { 
    transactionId: v.id('sales'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const sale = await ctx.db.get(args.transactionId);
    if (!sale || sale.cashierId !== user._id) {
      throw new Error('Transaction not found or unauthorized');
    }

    const items = await Promise.all(
      sale.items.map(async (item) => {
        const medicine = await ctx.db.get(item.medicineId);
        return {
          ...item,
          medicineName: medicine?.name || 'Unknown',
          category: medicine?.category || 'Unknown',
        };
      })
    );

    return { ...sale, items };
  },
});

export const getReceipt = query({
  args: { 
    saleId: v.id('sales'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error('Sale not found');

    const branch = await ctx.db.get(sale.branchId);
    const cashier = await ctx.db.get(sale.cashierId);

    const items = await Promise.all(
      sale.items.map(async (item) => {
        const medicine = await ctx.db.get(item.medicineId);
        return {
          ...item,
          medicineName: medicine?.name || 'Unknown',
          manufacturer: medicine?.manufacturer || 'Unknown',
        };
      })
    );

    return {
      sale,
      branch,
      cashier: { name: cashier?.full_name, email: cashier?.email },
      items,
    };
  },
});

export const getReturnableSales = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const today = new Date();
    today.setDate(today.getDate() - 7); // Last 7 days

    return await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .filter((q) => q.gte(q.field('_creationTime'), today.getTime()));
  },
});

export const getReturnableItems = query({
  args: { 
    saleId: v.id('sales'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.cashierId !== user._id) {
      throw new Error('Sale not found or unauthorized');
    }

    return await Promise.all(
      sale.items.map(async (item) => {
        const medicine = await ctx.db.get(item.medicineId);
        return {
          ...item,
          medicineName: medicine?.name || 'Unknown',
          category: medicine?.category || 'Unknown',
          canReturn: true, // All items can be returned
        };
      })
    );
  },
});

export const getSalesSummary = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const sales = await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .collect();

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;

    // Calculate payment method breakdowns
    const cashPayments = sales
      .filter((s) => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const cardPayments = sales
      .filter((s) => s.paymentMethod === 'card')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const mobilePayments = sales
      .filter((s) => s.paymentMethod === 'mobile')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const bankTransferPayments = sales
      .filter((s) => s.paymentMethod === 'bank_transfer')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const cashTotal = cashPayments;
    const cardTotal = cardPayments;
    const mobileTotal = mobilePayments;
    const bankTransferTotal = bankTransferPayments;

    // Count by payment method
    const cashCount = sales.filter((s) => s.paymentMethod === 'cash').length;
    const cardCount = sales.filter((s) => s.paymentMethod === 'card').length;

    // Additional snake_case fields for compatibility
    const totalRefunds = 0;
    const returnCount = 0;
    const revenueChange = 0;
    const totalOrders = sales.length;
    const ordersChange = 0;
    const averageOrderValue = averageSale;
    const refundCount = 0;

    return {
      // camelCase fields
      totalSales: sales.length,
      totalRevenue,
      averageSale,
      salesCount: sales.length,
      cashPayments,
      cashCount,
      cardPayments,
      cardCount,
      mobilePayments,
      bankTransferPayments,
      cashTotal,
      cardTotal,
      mobileTotal,
      bankTransferTotal,
      totalRefunds,
      returnCount,
      revenueChange,
      totalOrders,
      ordersChange,
      averageOrderValue,
      refundCount,
      // snake_case fields for compatibility
      total_sales: totalRevenue,
      sales_count: sales.length,
      cash_payments: cashPayments,
      cash_count: cashCount,
      card_payments: cardPayments,
      card_count: cardCount,
      mobile_payments: mobilePayments,
      bank_transfer_payments: bankTransferPayments,
      cash_total: cashTotal,
      card_total: cardTotal,
      mobile_total: mobileTotal,
      bank_transfer_total: bankTransferTotal,
      total_refunds: totalRefunds,
      return_count: returnCount,
      revenue_change: revenueChange,
      total_orders: totalOrders,
      orders_change: ordersChange,
      average_order_value: averageOrderValue,
      refund_count: refundCount,
      otherPayments: 0,
      otherCount: 0,
      // Additional fields expected by FinancialOperations.tsx
      topCategories: [] as { categoryName: string; totalSales: number; itemCount: number }[],
      periodStart: null as number | null,
      periodEnd: null as number | null,
    };
  },
});

export const getPaymentsReport = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    let sales = await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .collect();

    if (args.startDate !== undefined && args.startDate !== null) {
      sales = sales.filter((s) => s._creationTime >= args.startDate!);
    }
    if (args.endDate !== undefined && args.endDate !== null) {
      sales = sales.filter((s) => s._creationTime <= args.endDate!);
    }

    const paymentMethodTotals: Record<string, number> = {};
    sales.forEach((s) => {
      paymentMethodTotals[s.paymentMethod] =
        (paymentMethodTotals[s.paymentMethod] || 0) + s.totalAmount;
    });

    const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    return {
      // camelCase fields
      totalPayments: sales.length,
      totalAmount,
      byPaymentMethod: paymentMethodTotals,
      sales,
      // snake_case fields for compatibility
      total_payments: sales.length,
      total_amount: totalAmount,
      by_payment_method: paymentMethodTotals,
    };
  },
});

export const getReturnsReport = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    // For now, return empty report (returns feature to be implemented)
    return {
      totalReturns: 0,
      totalRefundAmount: 0,
      returns: [],
    };
  },
});

export const getSessions = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    // For now, return current user's sales as sessions (to be enhanced)
    await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .order('desc')
      .take(1);

    const now = Date.now();

    return [
      {
        // camelCase fields
        sessionId: user._id,
        cashierName: user.full_name,
        startTime: now,
        endTime: null,
        totalSales: 0,
        totalAmount: 0,
        status: 'active',
        openingBalance: 0,
        closingBalance: 0,
        // snake_case fields for compatibility
        id: user._id,
        cashier_name: user.full_name,
        cashier_id: user._id,
        start_time: now,
        end_time: null,
        total_sales: 0,
        opening_balance: 0,
        closing_balance: 0,
        created_at: now,
      },
    ];
  },
});

export const getShiftSummary = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await ctx.db
      .query('sales')
      .filter((q) => q.eq(q.field('cashierId'), user._id))
      .filter((q) => q.gte(q.field('_creationTime'), today.getTime()))
      .collect();

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalSales = sales.length;
    const averageTransaction = totalSales > 0 ? totalRevenue / totalSales : 0;
    const itemsSold = sales.reduce(
      (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
      0
    );

    // Calculate payment method totals
    const cashSales = sales
      .filter((s) => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const cardSales = sales
      .filter((s) => s.paymentMethod === 'card')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const mobileSales = sales
      .filter((s) => s.paymentMethod === 'mobile')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const transactionCount = sales.length;
    const averageSale = averageTransaction;

    return {
      // camelCase fields
      totalSales,
      totalRevenue,
      averageTransaction,
      itemsSold,
      date: today.toISOString().split('T')[0],
      // snake_case fields for compatibility
      total_sales: totalRevenue,
      transaction_count: transactionCount,
      average_sale: averageSale,
      items_sold: itemsSold,
      cash_sales: cashSales,
      card_sales: cardSales,
      mobile_sales: mobileSales,
      // Additional fields expected by frontend
      cashier_name: user.full_name,
      cashier_id: user._id,
      branch_name: 'Main Branch',
      start_time: today.getTime(),
      duration: '8h 0m',
      categories: [],
    };
  },
});

export const getPendingPayments = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    // For now, return empty (pending payments to be implemented)
    return [];
  },
});

export const getPaymentDetails = query({
  args: { 
    saleId: v.id('sales'),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCashier(ctx, args.sessionToken);

    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.cashierId !== user._id) {
      throw new Error('Sale not found or unauthorized');
    }

    return {
      saleId: sale._id,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      chapaTransactionId: sale.chapaTransactionId,
      chapaStatus: sale.chapaStatus,
      chapaReference: sale.chapaReference,
      createdAt: sale._creationTime,
    };
  },
});
