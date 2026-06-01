import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export function DailySalesView({ dailySales }: { dailySales: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {(dailySales.totalSales || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailySales.salesCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ETB {(dailySales.cashPayments || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailySales.cashCount || 0} cash transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Card Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ETB {(dailySales.cardPayments || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailySales.cardCount || 0} card transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Other Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ETB {(dailySales.otherPayments || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailySales.otherCount || 0} other transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Sales Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PaymentBreakdownBar
              label="Cash"
              amount={dailySales.cashPayments || 0}
              total={dailySales.totalSales}
              color="bg-green-600"
            />
            <PaymentBreakdownBar
              label="Card"
              amount={dailySales.cardPayments || 0}
              total={dailySales.totalSales}
              color="bg-blue-600"
            />
            <PaymentBreakdownBar
              label="Mobile"
              amount={dailySales.mobilePayments || 0}
              total={dailySales.totalSales}
              color="bg-purple-600"
            />
            <PaymentBreakdownBar
              label="Bank Transfer"
              amount={dailySales.bankTransferPayments || 0}
              total={dailySales.totalSales}
              color="bg-orange-600"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refunds &amp; Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Refunds</p>
              <p className="text-xl font-bold text-red-600">
                ETB {(dailySales.totalRefunds || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return Count</p>
              <p className="text-xl font-bold">{dailySales.returnCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentBreakdownBar({
  label,
  amount,
  total,
  color,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">ETB {amount.toFixed(2)}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function SalesSummaryView({ salesSummary }: { salesSummary: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {(salesSummary.totalRevenue || 0).toFixed(2)}
            </div>
            {salesSummary.revenueChange !== undefined && (
              <p
                className={`text-xs flex items-center ${salesSummary.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {salesSummary.revenueChange >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(salesSummary.revenueChange)}% from last period
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesSummary.totalOrders || 0}
            </div>
            {salesSummary.ordersChange !== undefined && (
              <p
                className={`text-xs flex items-center ${salesSummary.ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {salesSummary.ordersChange >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(salesSummary.ordersChange)}% from last period
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {(salesSummary.average_order_value || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ETB {(salesSummary.totalRefunds || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesSummary.refundCount || 0} refunds processed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PaymentBreakdownBar
              label="Cash"
              amount={salesSummary.cashTotal || 0}
              total={salesSummary.totalRevenue}
              color="bg-green-600"
            />
            <PaymentBreakdownBar
              label="Card"
              amount={salesSummary.cardTotal || 0}
              total={salesSummary.totalRevenue}
              color="bg-blue-600"
            />
            <PaymentBreakdownBar
              label="Mobile"
              amount={salesSummary.mobileTotal || 0}
              total={salesSummary.totalRevenue}
              color="bg-purple-600"
            />
            <PaymentBreakdownBar
              label="Bank Transfer"
              amount={salesSummary.bankTransferTotal || 0}
              total={salesSummary.totalRevenue}
              color="bg-orange-600"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {salesSummary.topCategories &&
          salesSummary.topCategories.length > 0 ? (
            <div className="space-y-3">
              {salesSummary.topCategories.map(
                (category: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">
                        {category.categoryName}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ETB {category.totalSales?.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.itemCount} items
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No category data available
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {salesSummary.periodStart
                  ? new Date(salesSummary.periodStart).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">
                {salesSummary.periodEnd
                  ? new Date(salesSummary.periodEnd).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className="font-medium text-green-600">
                ETB{" "}
                {(
                  salesSummary.totalRevenue - (salesSummary.totalRefunds || 0)
                ).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Refund Rate</p>
              <p className="font-medium">
                {salesSummary.totalRevenue > 0
                  ? (
                      ((salesSummary.totalRefunds || 0) /
                        salesSummary.totalRevenue) *
                      100
                    ).toFixed(2)
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
