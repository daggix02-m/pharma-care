import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Input,
} from '@/components/ui/ui';
import { 
    Package, 
    AlertTriangle, 
    TrendingDown, 
    Search, 
    Plus, 
    Zap, 
    History, 
    ArrowRight,
    RefreshCw,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

const KPICard = ({ title, value, icon: Icon, color, bg, label }) => (
    <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
            <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{label}</p>
    </div>
);

export function InventoryManagement() {
  const medicines = useQuery(api.pharmacist.queries.getMedicines) || [];
  const loading = medicines === undefined;
  
  const updateStockMutation = useMutation(api.pharmacist.mutations.updateMedicineStock);
  const requestRestockMutation = useMutation(api.pharmacist.mutations.requestRestock);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useMemo(() => {
    const total = medicines.length;
    const low = medicines.filter(m => m.stock < (m.minStock || 10)).length;
    const out = medicines.filter(m => m.stock === 0).length;
    
    // Mock expiry calculation for now
    const expiring = medicines.filter(m => {
        if (!m.expiryDate) return false;
        const days = Math.floor((m.expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days < 90;
    }).length;

    return { total, low, out, expiring };
  }, [medicines]);

  const filteredProducts = useMemo(() => {
    return medicines.filter(m => 
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [medicines, searchQuery]);

  const handleUpdateStock = async (id, currentStock) => {
    const newStock = prompt('Enter new stock level:', currentStock);
    if (newStock === null || isNaN(newStock)) return;

    try {
      setIsSubmitting(true);
      await updateStockMutation({ id, stock: parseInt(newStock) });
      toast.success('Stock updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestStock = async (medicineId) => {
    try {
      setIsSubmitting(true);
      await requestRestockMutation({ medicineId, quantity: 50 });
      toast.success('Replenishment request sent to manager');
    } catch (error) {
      toast.error(error.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGlobalRequest = async () => {
    const lowStockItems = medicines.filter(m => m.stock < (m.minStock || 10));
    if (lowStockItems.length === 0) {
      toast.info('No low stock items detected');
      return;
    }

    try {
      setIsSubmitting(true);
      for (const item of lowStockItems) {
          await requestRestockMutation({ medicineId: item._id, quantity: 50 });
      }
      toast.success(`Sent ${lowStockItems.length} replenishment requests`);
    } catch (error) {
      toast.error('Failed to send some requests');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='p-8 space-y-8 animate-pulse'>
        <div className="h-10 w-64 bg-slate-100 rounded-xl" />
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
        </div>
        <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className='space-y-8 p-4 md:p-8 animate-fade-in'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='font-display text-4xl font-black tracking-tight text-slate-900'>Inventory Intelligence</h1>
          <p className='text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1'>Branch-Specific Logistics & Oversight</p>
        </div>
        <div className="flex gap-3">
            <Button 
                onClick={handleGlobalRequest} 
                disabled={isSubmitting}
                className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black italic uppercase tracking-tighter"
            >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Auto-Replenish Low Stock
            </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <KPICard 
            title="Active Inventory" 
            value={stats.total} 
            label="Unique Stock Units" 
            icon={Package} 
            color="text-indigo-600" 
            bg="bg-indigo-50" 
        />
        <KPICard 
            title="Low Threshold" 
            value={stats.low} 
            label="Requiring Attention" 
            icon={TrendingDown} 
            color="text-orange-600" 
            bg="bg-orange-50" 
        />
        <KPICard 
            title="Expiring Soon" 
            value={stats.expiring} 
            label="90-Day Warning" 
            icon={AlertTriangle} 
            color="text-red-500" 
            bg="bg-red-50" 
        />
        <KPICard 
            title="Out of Stock" 
            value={stats.out} 
            label="Immediate Buy" 
            icon={Zap} 
            color="text-rose-600" 
            bg="bg-rose-50" 
        />
      </div>

      {/* Search and Filters */}
      <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400' />
              <Input 
                placeholder='Identify product or category...' 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-indigo-500 text-lg font-medium'
              />
            </div>
            <Button variant="outline" className="h-14 rounded-2xl px-8 border-slate-200 font-bold">
                Advanced Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Inventory Table */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl shadow-indigo-50/20 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle className="text-xl font-black">Pharmacy Stock Ledger</CardTitle>
                  <CardDescription className="font-bold text-xs uppercase tracking-tight text-slate-400 mt-1">Real-time branch inventory status</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Systems Nominal</span>
              </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Product Line</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Current Stock</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Threshold</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry State</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Integrity</TableHead>
                  <TableHead className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => {
                  const isLow = p.stock < (p.minStock || 10);
                  const isCritical = p.stock === 0;
                  
                  return (
                    <TableRow key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className='py-5 px-8'>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold transition-transform group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                                {p.name.charAt(0)}
                            </div>
                            <span className="font-black text-slate-900">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        <Badge variant="secondary" className="rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1 font-black text-[10px] uppercase">
                            {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={`py-5 px-8 text-center font-black text-lg ${isLow ? 'text-red-600' : 'text-slate-900'}`}>{p.stock}</TableCell>
                      <TableCell className='py-5 px-8 text-center font-bold text-slate-400 text-sm'>{p.minStock || 10}</TableCell>
                      <TableCell className="py-5 px-8">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-600">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'Dec 2026'}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Verified Static</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        {isCritical ? (
                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 font-black text-[10px] uppercase py-1 px-3 rounded-lg">Depleted</Badge>
                        ) : isLow ? (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 font-black text-[10px] uppercase py-1 px-3 rounded-lg">Low Level</Badge>
                        ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-black text-[10px] uppercase py-1 px-3 rounded-lg">Optimal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2">
                            <Button
                                size='icon'
                                variant='ghost'
                                className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-indigo-600"
                                onClick={() => handleUpdateStock(p._id, p.stock)}
                            >
                                <History className="w-4 h-4" />
                            </Button>
                            <Button
                                size='icon'
                                variant='ghost'
                                className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-emerald-600"
                                onClick={() => handleRequestStock(p._id)}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Side Alerts Section */}
      <div className='grid gap-8 grid-cols-1 lg:grid-cols-2'>
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className='flex items-center gap-3 text-lg font-black'>
              <AlertTriangle className='h-6 w-6 text-rose-600' />
              Critical Expiry Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
              {medicines.filter(m => {
                  if (!m.expiryDate) return false;
                  return Math.floor((m.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)) < 30;
              }).length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-[2rem]">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Zero Critical Threats</span>
                  </div>
              ) : (
                  medicines.filter(m => {
                    if (!m.expiryDate) return false;
                    return Math.floor((m.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)) < 30;
                  }).map((m) => (
                    <div key={m._id} className='flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 group'>
                      <div>
                        <p className='font-black text-slate-900'>{m.name}</p>
                        <p className='text-[10px] font-black uppercase text-rose-600 mt-1 tracking-tight'>
                            Expires {new Date(m.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size='sm'
                        className='rounded-xl bg-white text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white font-black text-[10px] uppercase'
                      >
                        Flag for Disposal
                      </Button>
                    </div>
                  ))
              )}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className='flex items-center gap-3 text-lg font-black'>
              <TrendingDown className='h-6 w-6 text-orange-600' />
              Replenishment Backlog
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
              {medicines.filter(m => m.stock < (m.minStock || 10)).map((m) => (
                <div key={m._id} className='flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50'>
                  <div>
                    <p className='font-black text-slate-900'>{m.name}</p>
                    <p className='text-[10px] font-black uppercase text-slate-400 mt-1 tracking-tight'>
                      Inventory Gap: {(m.minStock || 10) - m.stock} Units
                    </p>
                  </div>
                  <Button
                    size='sm'
                    className='rounded-xl bg-white text-orange-600 border border-orange-100 hover:bg-orange-600 hover:text-white font-black text-[10px] uppercase'
                    onClick={() => handleRequestStock(m._id)}
                  >
                    Request Bulk
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
