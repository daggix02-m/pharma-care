import { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';

export const useRealtimeSalesData = () => {
  const [data, setData] = useState({
    totalRevenue: 0,
    salesCount: 0,
    averageSale: 0,
    salesChartData: [],
    cumulativeRevenueData: [],
    latestPayments: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    try {
      // Get the user role to determine the correct endpoint
      const userRole = localStorage.getItem('userRole');
      const endpoint = userRole === 'admin' 
        ? '/admin/dashboard/sales' 
        : '/manager/dashboard/sales';

      // Fetch real sales data from the backend
      const response = await apiClient(endpoint, { method: 'GET' });

      // If the response is an error (like the 500 year() error), we'll skip updating
      if (response && (response.success === false || response.status === 500)) {
        console.warn('Backend returned error for sales data:', response.message);
        setLoading(false);
        return;
      }

      if (response && response.success) {
        const salesData = response.data || response;

        // The dashboard endpoint might return just { count: X } or { totalSales: X }
        // We've seen 'totalSales' and 'count' being used in AdminOverview.jsx
        const revenue = salesData.totalSales ?? salesData.count ?? 0;

        // Update state with mapped data
        setData({
          totalRevenue: revenue,
          salesCount: salesData.salesCount || salesData.transactionCount || 0,
          averageSale: salesData.averageSale || 0,
          salesChartData: salesData.salesChartData || [],
          cumulativeRevenueData: salesData.cumulativeRevenueData || [],
          latestPayments: salesData.latestPayments || [],
        });
      } else {
        console.error('Failed to fetch sales data:', response.message);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // If backend fails with 500 (SQL error), don't show loading forever
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchSalesData();

    // Set up periodic refresh
    const interval = setInterval(fetchSalesData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Return loading state indicator if needed by the component
  return { ...data, loading };
};
