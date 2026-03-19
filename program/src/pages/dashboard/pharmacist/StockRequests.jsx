import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import { 
  ClipboardList, 
  Plus, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Search,
  AlertTriangle,
  History,
  Zap,
  ArrowRight
} from 'lucide-react';

export function StockRequests() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    medicineId: '',
    quantity: '',
    urgency: 'normal',
    notes: '',
  });

  const requests = useQuery(api.pharmacist.queries.getStockRequests) || [];
  const medicines = useQuery(api.pharmacist.queries.getMedicines) || [];
  const createRequestMutation = useMutation(api.pharmacist.mutations.createStockRequest);

  const loading = requests === undefined || medicines === undefined;

  const filteredRequests = useMemo(() => {
    return requests.filter(r => 
        r.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [requests, searchQuery]);

  const stats = useMemo(() => {
    return {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        total: requests.length
    };
  }, [requests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineId || !formData.quantity) {
      toast.error('Please complete all mandatory fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await createRequestMutation({
        medicineId: formData.medicineId,
        quantity: parseInt(formData.quantity),
        urgency: formData.urgency,
        notes: formData.notes || undefined
      });
      toast.success('Replenishment request broadcasted successfully');
      setShowAddModal(false);
      setFormData({ medicineId: '', quantity: '', urgency: 'normal', notes: '' });
    } catch (error) {
      toast.error(error.message || 'Transmission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-black text-[10px] uppercase px-3 py-1 rounded-lg">Awaiting Oversight</Badge>;
      case 'approved': return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] uppercase px-3 py-1 rounded-lg">Approved / Active</Badge>;
      case 'rejected': return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-black text-[10px] uppercase px-3 py-1 rounded-lg">Denied</Badge>;
      case 'fulfilled': return <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[10px] uppercase px-3 py-1 rounded-lg">Restocked</Badge>;
      default: return <Badge variant="outline" className="font-black text-[10px] uppercase">{status || 'Unknown'}</Badge>;
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return <Zap className="w-3 h-3 text-rose-500" />;
      case 'normal': return <Clock className="w-3 h-3 text-slate-400" />;
      case 'low': return <Package className="w-3 h-3 text-slate-300" />;
      default: return null;
    }
  };

  if (loading) {
      return (
          <div className="p-8 space-y-8 animate-pulse">
              <div className="h-10 w-64 bg-slate-100 rounded-xl" />
              <div className="grid grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
              </div>
              <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
          </div>
      );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-slate-900">Stock Logistics</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Inventory Replenishment & Fulfillment Tracking</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="rounded-2xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black uppercase text-xs tracking-widest italic">
          <Plus className="w-4 h-4 mr-2" /> Initiate Request
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {[
            { label: 'Pending Action', val: stats.pending, color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
            { label: 'In Fulfillment', val: stats.approved, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
            { label: 'Total Volume', val: stats.total, color: 'text-indigo-500', bg: 'bg-indigo-50', icon: History },
        ].map((s, i) => (
            <Card key={i} className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
                        <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-slate-900">{s.val}</div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Current Cycle Units</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl shadow-indigo-50/20 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <CardTitle className="text-xl font-black">Replenishment Ledger</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase">Historical and active stock movements</CardDescription>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search ledger..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-white focus:ring-indigo-600 text-lg font-medium" 
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-40 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-slate-200" />
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest">Digital Ledger Empty</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-transparent">
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Medicine Unit</TableHead>
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Order Quantity</TableHead>
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Urgency Node</TableHead>
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                    <TableHead className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Status Matrix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {filteredRequests.map((request, i) => (
                    <TableRow key={request._id || i} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                {request.medicineName.charAt(0)}
                            </div>
                            <span className="font-black text-slate-900 text-md">{request.medicineName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        <span className="font-black text-slate-900">{request.quantity}</span>
                        <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">Units</span>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center gap-2">
                             {getUrgencyIcon(request.urgency)}
                             <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${request.urgency === 'high' ? 'text-rose-600' : 'text-slate-500'}`}>
                                {request.urgency}
                             </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">{new Date(request._creationTime).toLocaleDateString()}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Verified Entry</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8 text-right">{getStatusBadge(request.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Request Modal - Premium Upgrade */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-indigo-600 p-10 text-white">
            <DialogHeader>
                <DialogTitle className="text-3xl font-black flex items-center gap-4">
                    <Plus className="w-8 h-8 opacity-50" /> NEW LOGISTICS ENTRY
                </DialogTitle>
                <DialogDescription className="text-indigo-100 font-bold uppercase tracking-widest text-xs mt-2">
                    Submit a replenishment directive to central management.
                </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-10 space-y-8 bg-white">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Substance Classification</Label>
                  <Select
                    value={formData.medicineId}
                    onValueChange={(val) => setFormData(p => ({ ...p, medicineId: val }))}
                  >
                    <SelectTrigger className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 font-bold focus:ring-indigo-600">
                      <SelectValue placeholder="LOCATE MEDICINE..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      {medicines.map((m) => (
                        <SelectItem key={m._id} value={m._id} className="rounded-xl font-bold py-3">
                          {m.name} <span className="text-[10px] font-black opacity-30 ml-2">@{m.category}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Quantity</Label>
                        <Input 
                            type="number"
                            placeholder="0000"
                            value={formData.quantity}
                            onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
                            className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 font-black text-center text-lg focus:ring-indigo-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Urgency Priority</Label>
                        <Select
                            value={formData.urgency}
                            onValueChange={(val) => setFormData(p => ({ ...p, urgency: val }))}
                        >
                            <SelectTrigger className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 font-black uppercase tracking-widest focus:ring-indigo-600">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                <SelectItem value="low" className="rounded-xl font-black text-[10px] uppercase">LOW / STATIC</SelectItem>
                                <SelectItem value="normal" className="rounded-xl font-black text-[10px] uppercase">NORMAL / ROUTINE</SelectItem>
                                <SelectItem value="high" className="rounded-xl font-black text-[10px] uppercase text-rose-600">HIGH / CRITICAL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Logistic Directives (Optional)</Label>
                    <Input 
                        placeholder="SPECIFY ADDITIONAL REQUIREMENTS..."
                        value={formData.notes}
                        onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                        className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 font-bold focus:ring-indigo-600"
                    />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <Button variant="ghost" onClick={() => setShowAddModal(false)} className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border-none">Abort</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200">
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'TRANSMIT DIRECTIVE'}
                </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
