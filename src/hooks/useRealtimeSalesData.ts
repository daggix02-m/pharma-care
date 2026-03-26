import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeSalesData = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const adminSalesData = useQuery((api.admin as any).getDashboardSales);
  const managerSalesData = useQuery((api.manager as any).getReportsSales, 'daily');

  const salesData = isAdmin ? adminSalesData : managerSalesData;
  const loading = salesData === undefined;

  const data: any = {
    totalRevenue: (salesData as any)?.totalSales || (salesData as any)?.total_revenue || 0,
    salesCount: (salesData as any)?.salesCount || (salesData as any)?.transactionCount || 0,
    averageSale: (salesData as any)?.averageSale || 0,
    salesChartData: (salesData as any)?.salesChartData || [],
    cumulativeRevenueData: (salesData as any)?.cumulativeRevenueData || [],
    latestPayments: (salesData as any)?.latestPayments || [],
  };

  return { ...data, loading };
};
