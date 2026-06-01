import { useRealtimeSalesData } from "@/hooks/useRealtimeSalesData";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, TrendingUp, Repeat2, Clock } from "lucide-react";
import { MetricCard, RealtimeChart, formatCurrency } from "./LiveSalesChart";

export const LiveSalesDashboard = () => {
  const {
    totalRevenue,
    cumulativeRevenueData,
    salesCount,
    averageSale,
    salesChartData,
    latestPayments,
    loading,
  } = useRealtimeSalesData();

  const safeSalesChartData = Array.isArray(salesChartData)
    ? salesChartData
    : [];
  const safeCumulativeRevenueData = Array.isArray(cumulativeRevenueData)
    ? cumulativeRevenueData
    : [];
  const safeLatestPayments = Array.isArray(latestPayments)
    ? latestPayments
    : [];

  if (loading) {
    return (
      <div className="w-full bg-background text-foreground p-4 md:p-8 flex flex-col gap-4 md:gap-8 items-center justify-center">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
            Active Sales Tracker
          </h1>
          <p className="text-md md:text-lg text-muted-foreground">
            Loading real-time sales data...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground p-4 md:p-8 flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          Active Sales Tracker
        </h1>
        <p className="text-md md:text-lg text-muted-foreground">
          Real-time insights into your sales performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={totalRevenue || 0}
          unit="$"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Cumulative revenue generated"
          valueClassName="text-emerald-500"
        />
        <MetricCard
          title="Total Transactions"
          value={salesCount || 0}
          icon={<Repeat2 className="h-4 w-4 text-muted-foreground" />}
          description="Number of sales recorded"
          valueClassName=""
        />
        <MetricCard
          title="Average Sale"
          value={averageSale || 0}
          unit="$"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Average value per transaction"
          valueClassName="text-blue-400"
        />
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activity Status
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Data streaming in real-time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RealtimeChart
          data={safeSalesChartData}
          title="Sales per Second"
          dataKey="sales"
          lineColor="#3b82f6"
          tooltipFormatter={formatCurrency}
          legendName="Sales Amount"
        />
        <RealtimeChart
          data={safeCumulativeRevenueData}
          title="Cumulative Revenue Trend"
          dataKey="sales"
          lineColor="#8b5cf6"
          tooltipFormatter={formatCurrency}
          legendName="Cumulative Revenue"
        />
      </div>

      <Card className="col-span-1 md:col-span-2 lg:col-span-4 max-h-[400px] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Latest Payments
          </CardTitle>
          <CardDescription>
            Recently completed transactions, updated live.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[250px] md:h-[300px] lg:h-[300px]">
            <div className="divide-y divide-border">
              {safeLatestPayments.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">
                  No payments yet...
                </p>
              ) : (
                safeLatestPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-lg">
                        {formatCurrency(payment.amount || 0)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {payment.product} by {payment.customer}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {payment.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 text-sm text-muted-foreground">
          <p>Displaying the 10 most recent transactions.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

LiveSalesDashboard.displayName = "LiveSalesDashboard";
