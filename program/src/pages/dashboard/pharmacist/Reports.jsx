import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import { 
    FileText, 
    AlertTriangle, 
    Clock, 
    Package, 
    Loader2, 
    Download, 
    TrendingUp, 
    BarChart3, 
    PieChart, 
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2
} from 'lucide-react';

const ReportKPI = ({ title, value, subtext, icon: Icon, color, bg }) => (
    <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
            <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
        <div className="text-3xl font-black text-slate-900">{value}</div>
        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{subtext}</p>
    </div>
);

export function Reports() {
  const [activeTab, setActiveTab] = useState('inventory');
  
  const medicines = useQuery(api.pharmacist.queries.getMedicines) || [];
  const sales = useQuery(api.pharmacist.queries.getSoldItemsHistory) || [];
  const loading = medicines === undefined || sales === undefined;

  const inventorySummary = useMemo(() => {
    const totalUnits = medicines.reduce((acc, m) => acc + m.stock, 0);
    const totalValue = medicines.reduce((acc, m) => acc + (m.stock * m.price), 0);
    const lowStock = medicines.filter(m => m.stock < (m.minStock || 10)).length;
    const expiring = medicines.filter(m => {
        if (!m.expiryDate) return false;
        return (m.expiryDate - Date.now()) < (30 * 24 * 60 * 60 * 1000);
    }).length;

    const categoryBreakdown = medicines.reduce((acc, m) => {
        acc[m.category] = acc[m.category] || { count: 0, stock: 0, value: 0 };
        acc[m.category].count += 1;
        acc[m.category].stock += m.stock;
        acc[m.category].value += (m.stock * m.price);
        return acc;
    }, {});

    return { totalUnits, totalValue, lowStock, expiring, categoryBreakdown, totalMedicines: medicines.length };
  }, [medicines]);

  const salesSummary = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalSales = sales.length;
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    return { totalRevenue, totalSales, avgSale };
  }, [sales]);

  const handleExport = (reportType) => {
    toast.success(`Generating high-fidelity ${reportType} analytical export...`);
  };

  if (loading) {
    return (
      <div className='p-8 space-y-8 animate-pulse'>
        <div className="h-10 w-64 bg-slate-100 rounded-xl" />
        <div className='grid gap-6 grid-cols-4'>
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
        </div>
        <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className='space-y-8 p-4 md:p-8 animate-fade-in'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='font-display text-4xl font-black tracking-tight text-slate-900'>Analytical Insights</h1>
          <p className='text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1'>Branch-Specific Intelligence & Performance Metrics</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
            {['inventory', 'sales', 'logistics'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        activeTab === tab 
                        ? 'bg-white text-indigo-600 shadow-sm scale-105' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'inventory' && (
          <>
            <div className='grid gap-6 grid-cols-1 md:grid-cols-4'>
                <ReportKPI 
                    title="Asset Volume" 
                    value={inventorySummary.totalMedicines} 
                    subtext="Unique Unit Classifications" 
                    icon={Package} 
                    color="text-indigo-600" 
                    bg="bg-indigo-50" 
                />
                <ReportKPI 
                    title="Liquidity Valuation" 
                    value={`ETB ${inventorySummary.totalValue.toLocaleString()}`} 
                    subtext="Estimated Market Capital" 
                    icon={TrendingUp} 
                    color="text-emerald-600" 
                    bg="bg-emerald-50" 
                />
                <ReportKPI 
                    title="Restock Triggers" 
                    value={inventorySummary.lowStock} 
                    subtext="Items Below Threshold" 
                    icon={AlertTriangle} 
                    color="text-orange-600" 
                    bg="bg-orange-50" 
                />
                <ReportKPI 
                    title="Integrity Watch" 
                    value={inventorySummary.expiring} 
                    subtext="30-Day Expiry Protocol" 
                    icon={Clock} 
                    color="text-rose-600" 
                    bg="bg-rose-50" 
                />
            </div>

            <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl shadow-indigo-50/20 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black italic">Category Intelligence Matrix</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-referencing classification data</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => handleExport('inventory')} className="rounded-2xl border-slate-200 font-black uppercase text-[10px] h-12 px-6">
                        <Download className="w-4 h-4 mr-2" /> Export Dataset
                    </Button>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classification</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SKU Count</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bulk Quantity</th>
                                    <th className="text-right py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Valuation</th>
                                    <th className="text-right py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Vector</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Object.entries(inventorySummary.categoryBreakdown).map(([category, data]) => (
                                    <tr key={category} className="group hover:bg-slate-50/50 transition-all cursor-crosshair">
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-10 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="font-black text-slate-900 text-lg">{category}</span>
                                            </div>
                                        </td>
                                        <td className="text-center font-black text-slate-500">{data.count}</td>
                                        <td className="text-center font-black text-slate-900">{data.stock}</td>
                                        <td className="text-right font-black text-emerald-600">ETB {data.value.toLocaleString()}</td>
                                        <td className="text-right">
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase px-3 py-1 rounded-lg tracking-tighter shadow-none">Optimal Path</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
          </>
      )}

      {activeTab === 'sales' && (
          <>
            <div className='grid gap-6 grid-cols-1 md:grid-cols-3'>
                <ReportKPI 
                    title="Cycle Revenue" 
                    value={`ETB ${salesSummary.totalRevenue.toLocaleString()}`} 
                    subtext="Aggregated Transaction Volume" 
                    icon={Activity} 
                    color="text-indigo-600" 
                    bg="bg-indigo-50" 
                />
                <ReportKPI 
                    title="Transaction Velocity" 
                    value={salesSummary.totalSales} 
                    subtext="Confirmed Settlement Units" 
                    icon={BarChart3} 
                    color="text-indigo-600" 
                    bg="bg-indigo-50" 
                />
                <ReportKPI 
                    title="Average Yield" 
                    value={`ETB ${salesSummary.avgSale.toFixed(2)}`} 
                    subtext="Mean Settlement Value" 
                    icon={PieChart} 
                    color="text-indigo-600" 
                    bg="bg-indigo-50" 
                />
            </div>

            <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl shadow-indigo-50/20 overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black italic">Sales Performance Ledger</CardTitle>
                        <CardDescription className="text-xs font-bold text-indigo-300 uppercase tracking-widest mt-1 opacity-70">Recent transaction audit track</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[10px] h-12 px-6">
                        <Download className="w-4 h-4 mr-2" /> Generate PDF
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-800/50">
                                    <th className="text-left py-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                                    <th className="text-left py-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer Link</th>
                                    <th className="text-center py-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Items</th>
                                    <th className="text-center py-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment</th>
                                    <th className="text-right py-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Settlement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sales.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-5 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900">{new Date(s._creationTime).toLocaleDateString()}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{new Date(s._creationTime).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className="font-black text-slate-900 uppercase tracking-tight text-md">{s.customerName || 'Walk-in'}</span>
                                        </td>
                                        <td className="text-center py-5 px-8">
                                            <Badge variant="outline" className="font-black text-[10px] rounded-lg px-2 border-slate-200 text-slate-500">{s.items.length} units</Badge>
                                        </td>
                                        <td className="text-center py-5 px-8">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{s.paymentMethod}</span>
                                        </td>
                                        <td className="text-right py-5 px-8 font-black text-indigo-600 text-lg">ETB {s.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
          </>
      )}

      {activeTab === 'logistics' && (
          <div className="flex flex-col items-center justify-center py-40 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-8">
                  <Activity className="w-10 h-10 text-indigo-600 animate-pulse" />
              </div>
              <h2 className="text-4xl font-black italic text-slate-900 tracking-tighter">Logistic Node Integration</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Connecting real-time supply chain telemetry</p>
              <div className="flex gap-4 mt-12">
                  <Button className="h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest px-10 shadow-2xl">Establish Protocol</Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest px-10">Simulation</Button>
              </div>
          </div>
      )}
    </div>
  );
}
