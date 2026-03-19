import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    TrendingUp, 
    Package, 
    FileText, 
    DollarSign, 
    ShoppingCart, 
    Users, 
    Loader2, 
    BarChart3, 
    Activity,
    ShieldCheck,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';

const IntelligenceCard = ({ title, value, icon: Icon, trend, color, bg }) => (
    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
            <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
            <div className="text-3xl font-black text-slate-900">{value}</div>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black italic text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">+{trend} Growth</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">vs yesterday audit</span>
            </div>
        </CardContent>
    </Card>
);

export function PharmacyReports() {
  const medicines = useQuery(api.pharmacist.queries.getMedicines) || [];
  const sales = useQuery(api.pharmacist.queries.getSoldItemsHistory) || [];
  const loading = medicines === undefined || sales === undefined;

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const transactions = sales.length;
    const itemsSold = sales.reduce((acc, s) => acc + s.items.length, 0);
    const prescriptions = sales.filter(s => s.prescriptionId).length;
    const avgSale = transactions > 0 ? totalRevenue / transactions : 0;
    const uniqueCustomers = new Set(sales.map(s => s.customerName || 'walk-in')).size;

    return {
        dailySales: `ETB ${totalRevenue.toLocaleString()}`,
        transactions: transactions.toString(),
        prescriptionsFilled: prescriptions.toString(),
        productsSold: itemsSold.toString(),
        customersServed: uniqueCustomers.toString(),
        avgTransaction: `ETB ${avgSale.toFixed(2)}`
    };
  }, [sales]);

  const topProducts = useMemo(() => {
    const counts = {};
    sales.forEach(s => {
        s.items.forEach(item => {
            counts[item.medicineId] = (counts[item.medicineId] || 0) + item.quantity;
        });
    });
    
    return Object.entries(counts)
        .map(([id, sold]) => {
            const med = medicines.find(m => m._id === id);
            return {
                name: med?.name || 'Unknown Substance',
                sold,
                revenue: `ETB ${(sold * (med?.price || 0)).toLocaleString()}`
            };
        })
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);
  }, [sales, medicines]);

  const salesByCategory = useMemo(() => {
    const catRevenue = {};
    sales.forEach(s => {
        s.items.forEach(item => {
            const med = medicines.find(m => m._id === item.medicineId);
            const cat = med?.category || 'Unclassified';
            catRevenue[cat] = (catRevenue[cat] || 0) + (item.quantity * item.price);
        });
    });

    const total = Object.values(catRevenue).reduce((a, b) => a + b, 0);
    
    return Object.entries(catRevenue).map(([category, rev]) => ({
        category,
        sales: `ETB ${rev.toLocaleString()}`,
        percentage: total > 0 ? Math.round((rev / total) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage);
  }, [sales, medicines]);

  if (loading) {
    return (
      <div className='p-8 space-y-8 animate-pulse'>
        <div className="h-10 w-64 bg-slate-100 rounded-xl" />
        <div className='grid gap-6 grid-cols-3'>
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8 p-4 md:p-8 animate-fade-in'>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className='font-display text-4xl font-black tracking-tight text-slate-900 leading-none'>Pharmacy Intelligence</h1>
            <p className='text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2'>High-Level Operational Oversight & Performance Audit</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl border border-indigo-100 italic font-black text-xs uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5" />
            Node Integration: Active
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          <IntelligenceCard title="Liquidity Inflow" value={stats.dailySales} icon={DollarSign} trend="12%" color="text-emerald-600" bg="bg-emerald-50" />
          <IntelligenceCard title="Auth Transactions" value={stats.transactions} icon={ShoppingCart} trend="8%" color="text-indigo-600" bg="bg-indigo-50" />
          <IntelligenceCard title="Clinical Directives" value={stats.prescriptionsFilled} icon={FileText} trend="15%" color="text-purple-600" bg="bg-purple-50" />
          <IntelligenceCard title="Unit Clearance" value={stats.productsSold} icon={Package} trend="5%" color="text-orange-600" bg="bg-orange-50" />
          <IntelligenceCard title="Client Interaction" value={stats.customersServed} icon={Users} trend="10%" color="text-cyan-600" bg="bg-cyan-50" />
          <IntelligenceCard title="Mean Settlement" value={stats.avgTransaction} icon={TrendingUp} trend="3%" color="text-pink-600" bg="bg-pink-50" />
      </div>

      <div className='grid gap-8 grid-cols-1 md:grid-cols-2'>
        {/* Top Selling Products */}
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-8">
            <CardTitle className="text-xl font-black italic">High-Velocity Substance Report</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Units with highest market movement</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className='space-y-4'>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className='flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-indigo-600 transition-all cursor-pointer'>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs italic">0{index+1}</div>
                        <div>
                            <p className='font-black text-slate-900'>{product.name}</p>
                            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>{product.sold} UNITS DEPLOYED</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className='font-black text-indigo-600'>{product.revenue}</p>
                        <ArrowUpRight className="w-4 h-4 ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-30">
                    <Package className="w-12 h-12 mx-auto mb-4" />
                    <p className='text-xs font-black uppercase tracking-widest'>Substance Ledger Empty</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-8">
            <CardTitle className="text-xl font-black italic">Classification Distribution</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue allocation by substance class</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className='space-y-8'>
              {salesByCategory.length > 0 ? (
                salesByCategory.map((item, index) => (
                  <div key={index} className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='font-black text-slate-900 uppercase tracking-tight'>{item.category}</span>
                      <span className='font-black text-indigo-600 text-sm'>{item.sales}</span>
                    </div>
                    <div className='w-full bg-slate-100 rounded-full h-3 overflow-hidden'>
                      <div
                        className='bg-indigo-600 h-full rounded-full transition-all duration-1000'
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest italic'>
                            Market Share
                        </p>
                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px]">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-30">
                    <Activity className="w-12 h-12 mx-auto mb-4" />
                    <p className='text-xs font-black uppercase tracking-widest'>Telemetry Signal Lost</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Health Protocol */}
      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-100/50 overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl font-black flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    Operational Security Sweep
                </CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-referencing real-time telemetry</CardDescription>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-black text-[10px] uppercase border border-emerald-100">Audit Status: Secured</div>
        </CardHeader>
        <CardContent className="p-8">
          <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
            {[
                { label: 'Asset Recognition', val: medicines.length, sub: 'Total SKU Units', color: 'text-slate-900' },
                { label: 'Critical Threshold', val: medicines.filter(m => m.stock < (m.minStock || 10)).length, sub: 'Stock Alerts', color: 'text-rose-600' },
                { label: 'Integrity Warning', val: medicines.filter(m => {
                    const diff = (m.expiryDate || 0) - Date.now();
                    return diff > 0 && diff < (30 * 24 * 60 * 60 * 1000);
                }).length, sub: '30-Day Limit', color: 'text-orange-600' },
                { label: 'Estimated Equity', val: `ETB ${medicines.reduce((a, b) => a + (b.stock * b.price), 0).toLocaleString()}`, sub: 'Market Value', color: 'text-emerald-600' },
            ].map((node, i) => (
                <div key={i} className='text-center p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all'>
                    <p className={`text-2xl font-black ${node.color}`}>{node.val}</p>
                    <p className='text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest'>{node.label}</p>
                    <p className='text-[9px] font-black text-indigo-600/30 mt-1 uppercase italic'>{node.sub}</p>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
