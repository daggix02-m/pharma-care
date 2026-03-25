import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
  ShoppingCart,
  CreditCard,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export function FinancialOperations() {
  const [view, setView] = useState('daily');

  const dailySales = useQuery(api.cashier.queries.getSalesSummary);
  const salesSummary = useQuery(api.cashier.queries.getSalesSummary);

  if (dailySales === undefined) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Financial Operations</h2>
        <p className='text-muted-foreground'>View sales reports and financial summaries</p>
      </div>

      <div className='flex gap-2'>
        <Button variant={view === 'daily' ? 'default' : 'outline'} onClick={() => setView('daily')}>
          <Calendar className='h-4 w-4 mr-2' />
          Daily Sales
        </Button>
        <Button
          variant={view === 'summary' ? 'default' : 'outline'}
          onClick={() => setView('summary')}
        >
          <TrendingUp className='h-4 w-4 mr-2' />
          Sales Summary
        </Button>
      </div>

      {view === 'daily' && dailySales && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Sales</CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ETB {(dailySales.totalSales || 0).toFixed(2)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {dailySales.salesCount || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Cash Payments</CardTitle>
                <DollarSign className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>
                  ETB {(dailySales.cashPayments || 0).toFixed(2)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {dailySales.cashCount || 0} cash transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Card Payments</CardTitle>
                <CreditCard className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-blue-600'>
                  ETB {(dailySales.cardPayments || 0).toFixed(2)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {dailySales.cardCount || 0} card transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Other Payments</CardTitle>
                <CreditCard className='h-4 w-4 text-purple-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-purple-600'>
                  ETB {(dailySales.otherPayments || 0).toFixed(2)}
                </div>
                <p className='text-xs text-muted-foreground'>
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
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Cash</span>
                    <span className='font-medium'>
                      ETB {(dailySales.cashPayments || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-green-600 h-2 rounded-full'
                      style={{
                        width: `${
                          dailySales.totalSales > 0
                            ? ((dailySales.cashPayments || 0) / dailySales.totalSales) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Card</span>
                    <span className='font-medium'>
                      ETB {(dailySales.cardPayments || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{
                        width: `${
                          dailySales.totalSales > 0
                            ? ((dailySales.cardPayments || 0) / dailySales.totalSales) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Mobile</span>
                    <span className='font-medium'>
                      ETB {(dailySales.mobilePayments || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-purple-600 h-2 rounded-full'
                      style={{
                        width: `${
                          dailySales.totalSales > 0
                            ? ((dailySales.mobilePayments || 0) / dailySales.totalSales) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Bank Transfer</span>
                    <span className='font-medium'>
                      ETB {(dailySales.bankTransferPayments || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-orange-600 h-2 rounded-full'
                      style={{
                        width: `${
                          dailySales.totalSales > 0
                            ? ((dailySales.bankTransferPayments || 0) / dailySales.totalSales) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refunds & Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Refunds</p>
                  <p className='text-xl font-bold text-red-600'>
                    ETB {(dailySales.totalRefunds || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Return Count</p>
                  <p className='text-xl font-bold'>{dailySales.returnCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === 'summary' && salesSummary && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ETB {(salesSummary.totalRevenue || 0).toFixed(2)}
                </div>
                {salesSummary.revenueChange !== undefined && (
                  <p
                    className={`text-xs flex items-center ${salesSummary.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {salesSummary.revenueChange >= 0 ? (
                      <ArrowUp className='h-3 w-3 mr-1' />
                    ) : (
                      <ArrowDown className='h-3 w-3 mr-1' />
                    )}
                    {Math.abs(salesSummary.revenueChange)}% from last period
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
                <ShoppingCart className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{salesSummary.totalOrders || 0}</div>
                {salesSummary.ordersChange !== undefined && (
                  <p
                    className={`text-xs flex items-center ${salesSummary.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {salesSummary.ordersChange >= 0 ? (
                      <ArrowUp className='h-3 w-3 mr-1' />
                    ) : (
                      <ArrowDown className='h-3 w-3 mr-1' />
                    )}
                    {Math.abs(salesSummary.ordersChange)}% from last period
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Average Order Value</CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ETB {(salesSummary.average_order_value || 0).toFixed(2)}
                </div>
                <p className='text-xs text-muted-foreground'>Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Refunds</CardTitle>
                <ArrowDown className='h-4 w-4 text-red-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-red-600'>
                  ETB {(salesSummary.totalRefunds || 0).toFixed(2)}
                </div>
                <p className='text-xs text-muted-foreground'>
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
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Cash</span>
                    <span className='font-medium'>
                      ETB {(salesSummary.cashTotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-green-600 h-2 rounded-full'
                      style={{
                        width: `${
                          salesSummary.totalRevenue > 0
                            ? ((salesSummary.cashTotal || 0) / salesSummary.totalRevenue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Card</span>
                    <span className='font-medium'>
                      ETB {(salesSummary.cardTotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{
                        width: `${
                          salesSummary.totalRevenue > 0
                            ? ((salesSummary.cardTotal || 0) / salesSummary.totalRevenue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Mobile</span>
                    <span className='font-medium'>
                      ETB {(salesSummary.mobileTotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-purple-600 h-2 rounded-full'
                      style={{
                        width: `${
                          salesSummary.totalRevenue > 0
                            ? ((salesSummary.mobileTotal || 0) / salesSummary.totalRevenue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Bank Transfer</span>
                    <span className='font-medium'>
                      ETB {(salesSummary.bankTransferTotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='bg-orange-600 h-2 rounded-full'
                      style={{
                        width: `${
                          salesSummary.totalRevenue > 0
                            ? ((salesSummary.bankTransferTotal || 0) / salesSummary.totalRevenue) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {salesSummary.topCategories && salesSummary.topCategories.length > 0 ? (
                <div className='space-y-3'>
                  {salesSummary.topCategories.map((category, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <span className='w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                          {index + 1}
                        </span>
                        <span className='font-medium'>{category.categoryName}</span>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>ETB {category.totalSales?.toFixed(2)}</p>
                        <p className='text-xs text-muted-foreground'>{category.itemCount} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-center text-muted-foreground'>No category data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Period Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Start Date</p>
                  <p className='font-medium'>
                    {salesSummary.periodStart
                      ? new Date(salesSummary.periodStart).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>End Date</p>
                  <p className='font-medium'>
                    {salesSummary.periodEnd
                      ? new Date(salesSummary.periodEnd).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Net Revenue</p>
                  <p className='font-medium text-green-600'>
                    ETB {(salesSummary.totalRevenue - (salesSummary.totalRefunds || 0)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Refund Rate</p>
                  <p className='font-medium'>
                    {salesSummary.totalRevenue > 0
                      ? (
                          ((salesSummary.totalRefunds || 0) / salesSummary.totalRevenue) *
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
      )}
    </div>
  );
}
