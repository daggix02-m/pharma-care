import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/ui';
import { Pagination, usePagination } from '@/components/ui/pagination';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Pill,
  Edit,
  Trash2,
  RefreshCw,
  MoreVertical,
  History,
  TrendingDown,
  Calendar,
  Layers,
  FileDown,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Users,
  Building2,
  ArrowRightLeft,
} from 'lucide-react';
import { BranchTabs } from './components/BranchTabs';
import { StockTransferModal } from '@/components/manager/StockTransferModal';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
  }).format(amount || 0);
}

function isNearExpiry(dateStr) {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  return expiry > now && expiry <= thirtyDaysFromNow;
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const now = new Date();
  return expiry <= now;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function InventoryManagement() {
  // Convex Hooks
  const branches = useQuery(api.manager.queries.getBranches) || [];
  const allMedicines = useQuery(api.manager.queries.getAllMedicines) || [];
  const soldHistory = useQuery(api.manager.queries.getSales) || [];
  const loading = branches === undefined || allMedicines === undefined || soldHistory === undefined;
 
  const addMedicineMutation = useMutation(api.manager.mutations.addMedicine);
  const updateMedicineStockMutation = useMutation(api.manager.mutations.updateMedicineStock);
  const removeMedicineMutation = useMutation(api.manager.mutations.removeMedicine);
  
  // Branch-specific medicine queries
  const getBranchMedicines = (branchId) => {
    return allMedicines.filter(m => m.branchId === branchId);
  };

  // Add medicine count to each branch for the tab badges
  const branchesWithCounts = useMemo(() => {
    return branches.map(branch => {
      const branchMedicines = allMedicines.filter(m => m.branchId === branch._id);
      return {
        ...branch,
        medicineCount: branchMedicines.length
      };
    });
  }, [branches, allMedicines]);
 
  // ── Data state ──
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [branchTab, setBranchTab] = useState('all');
  
  // Set default branch when branches load
  const medicines = useMemo(() => {
    if (branchTab === 'all') {
      return allMedicines;
    }
    return getBranchMedicines(branchTab);
  }, [allMedicines, branchTab]);
 
  // ── Filters & Tabs ──
  const [activeTab, setActiveTab ] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Action loading ──
  const [actionLoading, setActionLoading] = useState(null);

  // ── Modals ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    branchId: '',
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockTarget, setStockTarget] = useState(null); // { id, name, current_stock }
  const [newStockQty, setNewStockQty] = useState('');

  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // ── Pagination ──
  const invPagination = usePagination({ initialItemsPerPage: 10 });
  const historyPagination = usePagination({ initialItemsPerPage: 10 });

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
        setRefreshing(false);
        toast.success('Inventory data refreshed');
    }, 500);
  };

  // ─── Derived Data ─────────────────────────────────────────────────────────

  const selectedBranchData = useMemo(() => {
    if (branchTab === 'all' || !branches.length) return null;
    return branches.find(b => String(b._id) === String(branchTab)) || null;
  }, [branches, branchTab]);

  const filteredMedicines = useMemo(() => {
    let result = medicines;
    
    // Apply branch filter
    if (branchTab !== 'all' && selectedBranchData) {
      result = result.filter(m => String(m.branchId) === String(branchTab));
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name?.toLowerCase().includes(q));
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(m => m.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'low_stock') result = result.filter(m => m.stock > 0 && m.stock <= 10);
      if (statusFilter === 'out_of_stock') result = result.filter(m => m.stock <= 0);
      if (statusFilter === 'near_expiry') result = result.filter(m => isNearExpiry(m.expiryDate));
      if (statusFilter === 'expired') result = result.filter(m => isExpired(m.expiryDate));
    }
    
    return result;
  }, [medicines, branchTab, selectedBranchData, searchQuery, categoryFilter, statusFilter]);

  const filteredSoldHistory = useMemo(() => {
    let result = soldHistory;
    
    // Apply branch filter
    if (branchTab !== 'all' && selectedBranchData) {
      result = result.filter(h => String(h.branchId) === String(branchTab));
    }
    
    // Apply search filter
    if (searchQuery.trim() && activeTab === 'history') {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => {
        // Search in medicine names within the sale items
        const medicineNames = h.items?.map(item => {
          const medicine = allMedicines.find(m => m._id === item.medicineId);
          return medicine?.name?.toLowerCase().includes(q);
        });
        return medicineNames.some(Boolean);
      });
    }
    
    return result;
  }, [soldHistory, branchTab, selectedBranchData, searchQuery, activeTab, allMedicines]);

  const metrics = useMemo(() => {
    const total = filteredMedicines.length;
    const lowStock = filteredMedicines.filter(m => m.stock > 0 && m.stock <= 10).length;
    const outOfStock = filteredMedicines.filter(m => m.stock <= 0).length;
    const nearExpiryCount = filteredMedicines.filter(m => isNearExpiry(m.expiryDate)).length;
    const expiredCount = filteredMedicines.filter(m => isExpired(m.expiryDate)).length;
    const totalValue = filteredMedicines.reduce((sum, m) => sum + (m.price * m.stock), 0);
 
    return { total, lowStock, outOfStock, nearExpiryCount, expiredCount, totalValue };
  }, [filteredMedicines]);
 
  const categories = useMemo(() => {
    const names = filteredMedicines.map(m => m.category).filter(Boolean);
    return ['all', ...new Set(names)];
  }, [filteredMedicines]);



  const currentInvPageData = invPagination.paginate(filteredMedicines);
  const currentHistoryPageData = historyPagination.paginate(filteredSoldHistory);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newMedicine.name.trim() || !newMedicine.price || !newMedicine.stock || !newMedicine.branchId) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      setActionLoading('add');
      const response = await addMedicineMutation({
        name: newMedicine.name.trim(),
        category: newMedicine.category,
        price: parseFloat(newMedicine.price),
        stock: parseInt(newMedicine.stock, 10),
        branchId: newMedicine.branchId
      });
      if (response.success) {
        toast.success('Medicine added successfully');
        setShowAddModal(false);
        setNewMedicine({ name: '', category: '', price: '', stock: '', branchId: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add medicine');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!newStockQty || isNaN(newStockQty)) {
      toast.error('Please enter a valid quantity');
      return;
    }
    try {
      setActionLoading(stockTarget.id);
      const response = await updateMedicineStockMutation({
        id: stockTarget.id,
        stock: parseInt(newStockQty, 10)
      });
      if (response.success) {
        toast.success(`Stock updated for ${stockTarget.name}`);
        setShowStockModal(false);
        setStockTarget(null);
        setNewStockQty('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update stock');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMedicine = async () => {
    if (!removeTarget) return;
    try {
      setActionLoading(removeTarget.id);
      const response = await removeMedicineMutation({ id: removeTarget.id });
      if (response.success) {
        toast.success(`${removeTarget.name} removed from inventory`);
        setShowRemoveDialog(false);
        setRemoveTarget(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove medicine');
    } finally {
      setActionLoading(null);
    }
  };

  const getStockBadge = (qty) => {
    if (qty <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty <= 10) return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Low Stock ({qty})</Badge>;
    return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">In Stock ({qty})</Badge>;
  };

  const getExpiryBadge = (date) => {
    if (!date) return <Badge variant="outline">N/A</Badge>;
    if (isExpired(date)) return <Badge variant="destructive">Expired</Badge>;
    if (isNearExpiry(date)) return <Badge className="bg-amber-500 text-white">Near Expiry</Badge>;
    return <Badge variant="outline">{new Date(date).toLocaleDateString()}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-full sm:w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage medicines and stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => {
              setNewMedicine({ ...newMedicine, branchId: pharmacies[0]?._id || '' });
              setShowAddModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      <BranchTabs
        branches={branchesWithCounts}
        activeTab={branchTab}
        onTabChange={setBranchTab}
        loading={loading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-emerald-600 font-medium">{formatCurrency(metrics.totalValue)} value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{metrics.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.nearExpiryCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-2 rounded-lg">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Sold History
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === 'inventory' && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvPageData.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Pill className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">{m.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                      <TableCell className="font-medium">{formatCurrency(m.price)}</TableCell>
                      <TableCell>{getStockBadge(m.stock)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                setStockTarget({ id: m._id, name: m.name, current_stock: m.stock });
                                setNewStockQty(String(m.stock));
                                setShowStockModal(true);
                            }}>
                                <RefreshCw className="h-4 w-4 mr-2" /> Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setRemoveTarget({ id: m._id, name: m.name });
                                setShowRemoveDialog(true);
                            }} className="text-red-600 focus:text-red-700">
                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
             <Card><CardContent className="p-10 text-center text-muted-foreground">Sold history integration coming soon.</CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Add Medicine Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
            <DialogHeader><DialogTitle>Add New Medicine</DialogTitle></DialogHeader>
            <form onSubmit={handleAddMedicine} className="space-y-4">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={newMedicine.name} onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={newMedicine.category} onChange={e => setNewMedicine({...newMedicine, category: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Price (ETB)</Label>
                        <Input type="number" step="0.01" value={newMedicine.price} onChange={e => setNewMedicine({...newMedicine, price: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Initial Stock</Label>
                        <Input type="number" value={newMedicine.stock} onChange={e => setNewMedicine({...newMedicine, stock: e.target.value})} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Branch</Label>
                    <Select value={newMedicine.branchId} onValueChange={val => setNewMedicine({...newMedicine, branchId: val})}>
                        <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                        <SelectContent>
                            {pharmacies.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter><Button type="submit" disabled={actionLoading === 'add'}>Add Medicine</Button></DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent>
            <DialogHeader><DialogTitle>Adjust Stock: {stockTarget?.name}</DialogTitle></DialogHeader>
            <form onSubmit={handleAdjustStock} className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label>New Stock Quantity</Label>
                    <Input type="number" value={newStockQty} onChange={e => setNewStockQty(e.target.value)} required />
                </div>
                <DialogFooter><Button type="submit" disabled={actionLoading === stockTarget?.id}>Update Stock</Button></DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Remove {removeTarget?.name}?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveMedicine} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
