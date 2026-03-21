import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeSalesData = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const adminSalesData = useQuery(api.admin.queries.getDashboardSales);
  const managerSalesData = useQuery(api.manager.queries.getReportsSales, 'daily');

  const salesData = isAdmin ? adminSalesData : managerSalesData;
  const loading = salesData === undefined;

  const data = {
    totalRevenue: salesData?.totalSales || salesData?.total_revenue || 0,
    salesCount: salesData?.salesCount || salesData?.transactionCount || 0,
    averageSale: salesData?.averageSale || 0,
    salesChartData: salesData?.salesChartData || [],
    cumulativeRevenueData: salesData?.cumulativeRevenueData || [],
    latestPayments: salesData?.latestPayments || [],
  };

  return { ...data, loading };
};
