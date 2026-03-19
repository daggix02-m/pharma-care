import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/ui';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  AlertCircle, 
  Search, 
  Loader2, 
  Trash2, 
  History,
  TrendingDown,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2
} from 'lucide-react';

export function ExpiryAlerts() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const medicines = useQuery(api.pharmacist.queries.getMedicines) || [];
  const loading = medicines === undefined;
  const markForReturnMutation = useMutation(api.pharmacist.mutations.markMedicineForReturn);

  const filteredMedicines = useMemo(() => {
    // Only show items with expiry dates and not already returned
    return medicines
      .filter(m => m.expiryDate && m.status !== 'returned')
      .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [medicines, searchQuery]);

  const stats = useMemo(() => {
    const now = Date.now();
    const expired = filteredMedicines.filter(m => m.expiryDate <= now).length;
    const critical = filteredMedicines.filter(m => {
        const diff = m.expiryDate - now;
        return diff > 0 && diff <= (30 * 24 * 60 * 60 * 1000);
    }).length;
    const approaching = filteredMedicines.filter(m => {
        const diff = m.expiryDate - now;
        return diff > (30 * 24 * 60 * 60 * 1000) && diff <= (90 * 24 * 60 * 60 * 1000);
    }).length;

    return { expired, critical, approaching };
  }, [filteredMedicines]);

  const getExpiryStatus = (expiryDate) => {
    const now = Date.now();
    const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Expired', color: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (diffDays <= 30) return { label: `${diffDays} Days Remaining`, color: 'bg-orange-50 text-orange-600 border-orange-100' };
    if (diffDays <= 90) return { label: `${Math.ceil(diffDays/30)} Months Remaining`, color: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { label: 'Stable Shelf Life', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  };

  const handleMarkForReturn = async (id, name) => {
      try {
          await markForReturnMutation({ id, reason: 'Approaching Expiry / Logistical Precaution' });
          toast.success(`${name} marked for reverse logistics`);
      } catch (err) {
          toast.error(err.message || 'Action failed');
      }
  };

  if (loading) {
      return (
          <div className="p-8 space-y-8 animate-pulse">
              <div className="h-10 w-64 bg-slate-100 rounded-xl" />
              <div className="grid grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
              </div>
              <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
          </div>
      );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-slate-900">Substance Monitoring</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Real-time Expiry Intelligence & Disposal Management</p>
        </div>
        <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
                placeholder="Identify unit for auditing..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-white shadow-inner focus:ring-indigo-600 text-lg font-medium" 
            />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        {[
            { label: 'Critically Expired', val: stats.expired, color: 'text-rose-600', bg: 'bg-rose-50', icon: ShieldAlert },
            { label: '30-Day Threshold', val: stats.critical, color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
            { label: '90-Day Warning', val: stats.approaching, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
            { label: 'System Integrity', val: 'Healthy', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Zap },
        ].map((s, i) => (
            <Card key={i} className={`rounded-[2rem] border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all ${i === 3 ? 'bg-indigo-600 border-none' : ''}`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${i === 3 ? 'text-indigo-200' : 'text-slate-400'}`}>{s.label}</span>
                        <div className={`w-10 h-10 rounded-2xl ${i === 3 ? 'bg-white/10' : s.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <s.icon className={`w-5 h-5 ${i === 3 ? 'text-white' : s.color}`} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className={`text-4xl font-black ${i === 3 ? 'text-white' : 'text-slate-900'}`}>{s.val}</div>
                    <p className={`text-[10px] font-bold ${i === 3 ? 'text-indigo-300' : 'text-slate-400'} mt-1 uppercase tracking-tight`}>Current Audit Cycle</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl shadow-indigo-50/20 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black">Substance Expiry Matrix</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase">Proactive shelf-life tracking ledger</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Inventory Secure</span>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-40 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Audit Complete</h3>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Zero expiry threats detected in active stock.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-transparent">
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Substance Line</TableHead>
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Node</TableHead>
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Active Stock</TableHead>
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry Node</TableHead>
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status Vector</TableHead>
                    <TableHead className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {filteredMedicines.map((m) => {
                    const status = getExpiryStatus(m.expiryDate);
                    return (
                      <TableRow key={m._id} className="hover:bg-slate-50/50 transition-all group">
                        <TableCell className="py-5 px-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="font-black text-slate-900 text-lg leading-tight">{m.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="py-5 px-8 border-none">
                            <Badge variant="secondary" className="rounded-lg bg-indigo-50 text-indigo-700 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                                {m.category}
                            </Badge>
                        </TableCell>
                        <TableCell className="py-5 px-8">
                            <span className="font-black text-slate-900 text-lg">{m.stock}</span>
                            <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">Units</span>
                        </TableCell>
                        <TableCell className="py-5 px-8">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-600">
                                    {new Date(m.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">Verified Timestamp</span>
                            </div>
                        </TableCell>
                        <TableCell className="py-5 px-8">
                            <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-wider border shadow-none ${status.color}`}>
                                {status.label}
                            </Badge>
                        </TableCell>
                        <TableCell className="py-5 px-8 text-right">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleMarkForReturn(m._id, m.name)}
                                className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 hover:text-white hover:bg-indigo-600 transition-all gap-2 italic"
                            >
                                Initiate Return <ArrowRight className="w-4 h-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disposal Protocol Banner */}
      <div className="p-8 rounded-[2.5rem] bg-rose-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-rose-200 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-8 h-8 text-white" />
              </div>
              <div>
                  <h3 className="text-2xl font-black italic tracking-tight">Mass Disposal Protocol</h3>
                  <p className="text-rose-100 font-bold text-xs uppercase tracking-widest mt-1 opacity-80">Batch-processing of expired units for logistical clearing</p>
              </div>
          </div>
          <Button className="h-16 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black uppercase tracking-widest px-10 italic shadow-xl">
              Initiate Disposal Sweep
          </Button>
      </div>
    </div>
  );
}
