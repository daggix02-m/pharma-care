import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  Search,
  TrendingUp,
  Package,
  CreditCard,
  Zap,
  ArrowRight,
  History,
  Receipt,
  RotateCcw,
  Activity
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

export function CashierOverview() {
  const navigate = useNavigate();
  const dashboardStats = useQuery(api.cashier.queries.getDashboardStats);

  const [metrics, setMetrics] = useState({
    todaySales: 0,
    totalPayments: 0,
    totalReturns: 0,
    avgTransactionValue: 0,
    pendingPayments: 0,
  });

  const loading = dashboardStats === undefined;
  const error = null;

  useEffect(() => {
    if (dashboardStats) {
      setMetrics({
        todaySales: dashboardStats.totalDailySales || 0,
        totalPayments: dashboardStats.totalDailySales || 0,
        totalReturns: 0,
        avgTransactionValue: dashboardStats.totalDailySales > 0
          ? Math.round(dashboardStats.revenueToday / dashboardStats.totalDailySales)
          : 0,
        pendingPayments: 0,
      });
    }
  }, [dashboardStats]);

  const metricCards = [
    {
      title: "Today's Sales",
      value: `ETB ${metrics.todaySales.toLocaleString()}`,
      label: "Gross Revenue",
      icon: DollarSign,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.08)"
    },
    {
      title: "Avg Transaction",
      value: `ETB ${metrics.avgTransactionValue.toFixed(2)}`,
      label: "Per Customer",
      icon: TrendingUp,
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.08)"
    },
    {
      title: "Pending",
      value: metrics.pendingPayments,
      label: "Awaiting Payment",
      icon: Clock,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)"
    },
    {
      title: "Returns",
      value: metrics.totalReturns,
      label: "Items Processed",
      icon: RotateCcw,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.08)"
    },
  ];

  return (
    <div className='space-y-8 p-4 md:p-8 animate-fade-up'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='font-display text-3xl font-bold tracking-tight'>Cashier Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Sales processing and transaction management
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => navigate('/cashier/pos')} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                <ShoppingCart className="w-4 h-4 mr-2" /> Open POS
            </Button>
        </div>
      </div>

      {loading ? (
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
                <div key={i} className="admin-metric-card animate-pulse h-32" />
            ))}
        </div>
      ) : (
        <>
          <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
            {metricCards.map((m, i) => (
              <div key={i} className="admin-metric-card group">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.title}</span>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: m.bg }}>
                        <m.icon className="w-5 h-5" style={{ color: m.color }} />
                    </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{m.value}</div>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="w-6 h-6 text-indigo-600" /> Session Activity
                      </CardTitle>
                      <CardDescription>Live tracking for your current shift</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash in Drawer</p>
                                    <p className="text-xl font-black text-slate-900">ETB {metrics.todaySales.toLocaleString()}</p>
                                </div>
                          </div>
                          <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Transactions</p>
                                    <p className="text-xl font-black text-indigo-900">{metrics.totalPayments}</p>
                                </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Point of Sale</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {[
                                { label: 'Pending Payments', path: '/cashier/payments/pending', icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: 'Sales History', path: '/cashier/sales', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Shift Summary', path: '/cashier/shift-summary', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map((task, i) => (
                                <button 
                                    key={i}
                                    onClick={() => navigate(task.path)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl ${task.bg} ${task.color} flex items-center justify-center`}>
                                            <task.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">{task.label}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
              </div>
          </div>
        </>
      )}
    </div>
  );
}

