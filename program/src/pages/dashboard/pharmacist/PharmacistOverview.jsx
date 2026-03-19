import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  AlertTriangle,
  Clock,
  Package,
  ArrowRight,
  ClipboardList,
  Bell,
  History,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

export function PharmacistOverview() {
  const navigate = useNavigate();
  const stats = useQuery(api.pharmacist.queries.getDashboardStats);
  const loading = stats === undefined;

  const metricCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: "Inventory",
        value: stats.totalMedicines,
        label: "Total Items",
        icon: Package,
        color: "#3b82f6",
        bg: "rgba(59, 130, 246, 0.08)"
      },
      {
        title: "Low Stock",
        value: stats.lowStockItems,
        label: "Action Needed",
        icon: AlertTriangle,
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.08)"
      },
      {
        title: "Expiring",
        value: stats.expiredItems,
        label: "Watchlist",
        icon: Clock,
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.08)"
      },
      {
        title: "Today",
        value: `ETB ${stats.todaySales.toFixed(2)}`,
        label: "Gross Sales",
        icon: DollarSign,
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.08)"
      },
    ];
  }, [stats]);

  return (
    <div className='space-y-8 p-4 md:p-8 animate-fade-up'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='font-display text-3xl font-bold tracking-tight'>Pharmacist Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Real-time inventory and sales operations
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => navigate('/pharmacist/sale')} className="rounded-xl h-11 px-6 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
                <ShoppingCart className="w-4 h-4 mr-2" /> New Sale
            </Button>
        </div>
      </div>

      {loading ? (
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
        </div>
      ) : (
        <>
          <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
            {metricCards.map((m, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
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
                        <Zap className="w-6 h-6 text-indigo-600" /> Operational Efficiency
                      </CardTitle>
                      <CardDescription>Performance tracking for current shifts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Weekly Target</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span>Sales Volume</span>
                                        <span className="text-indigo-600">84%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '84%' }} />
                                    </div>
                                </div>
                          </div>
                          <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Status</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">Optimal</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">92% In Stock</p>
                                    </div>
                                </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Quick Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {[
                                { label: 'Stock Requests', path: '/pharmacist/stock-requests', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Expiry Alerts', path: '/pharmacist/expiry-alerts', icon: Bell, color: 'text-red-600', bg: 'bg-red-50' },
                                { label: 'Medicine Audit', path: '/pharmacist/medicines', icon: History, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
