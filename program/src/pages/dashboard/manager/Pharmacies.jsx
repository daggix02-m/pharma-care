import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PHARMACY_STATUS } from '@/constants';
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
} from '@/components/ui/dropdown-menu';
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
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export function Pharmacies() {
  // Convex Hooks
  const pharmacies = useQuery(api.manager.queries.getBranches) || [];
  const pendingBranches = useQuery(api.manager.queries.getPendingBranches) || [];
  const loading = pharmacies === undefined;
 
  const requestBranchMutation = useMutation(api.manager.mutations.requestBranch);
  const updateBranchMutation = useMutation(api.manager.mutations.updateBranch);
  const removeBranchMutation = useMutation(api.manager.mutations.removeBranch);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
  });

  const resetForm = useCallback(() => {
    setFormData({ 
      name: '', 
      location: '', 
      address: '', 
      phone: '', 
      email: '', 
    });
  }, []);

  const handleCreatePharmacy = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Pharmacy name is required');
      return;
    }
    
    try {
      setActionLoading('create');
      const response = await requestBranchMutation({
        name: formData.name.trim(),
        address: formData.address || "",
        // location is missing in schema's requestBranch but added here for UI consistency if needed
      });
      
      if (response.success) {
        toast.success('Pharmacy request submitted successfully');
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create pharmacy');
    } finally {
      setActionLoading(null);
    }
  }, [formData, requestBranchMutation, resetForm]);

  const handleEditPharmacy = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedPharmacy) return;
    try {
      setActionLoading('edit');
      const response = await updateBranchMutation({
        id: selectedPharmacy._id,
        data: {
          name: formData.name.trim(),
          address: formData.address.trim(),
        }
      });
      if (response.success) {
        toast.success('Pharmacy updated successfully');
        setShowEditModal(false);
        setSelectedPharmacy(null);
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update pharmacy');
    } finally {
      setActionLoading(null);
    }
  }, [selectedPharmacy, formData, updateBranchMutation, resetForm]);

  const handleDeletePharmacy = async () => {
    if (!selectedPharmacy) return;
    try {
      setActionLoading('delete');
      const response = await removeBranchMutation({ id: selectedPharmacy._id });
      if (response.success) {
        toast.success('Pharmacy deleted successfully');
        setShowDeleteDialog(false);
        setSelectedPharmacy(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete pharmacy');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (pharmacy) => {
    // Managers can only view branch status, not toggle it
    // Only admins can activate/deactivate branches
    const isActive = pharmacy.status === 'active';
    const statusMessage = isActive 
      ? 'This branch is active and requires admin approval to deactivate'
      : 'This branch is pending and requires admin approval to activate';
    toast.info(statusMessage);
  };

  const openEditModal = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name || '',
      location: pharmacy.location || '',
      address: pharmacy.address || '',
      phone: pharmacy.phone || '',
      email: pharmacy.email || '',
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowDeleteDialog(true);
  };

  const { activePharmacies, inactivePharmacies, pendingPharmacies } = useMemo(() => {
    return {
      activePharmacies: pharmacies.filter((b) => b.status === 'active').length,
      inactivePharmacies: pharmacies.filter((b) => b.status === 'inactive').length,
      pendingPharmacies: pharmacies.filter((b) => b.status === 'pending').length,
    };
  }, [pharmacies]);

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const location = (p.location || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.includes(search) || location.includes(search);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pharmacies, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Branches</h2>
          <p className="text-muted-foreground mt-1">Manage your pharmacy locations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Branch
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Branches" value={pharmacies.length} icon={Building2} />
        <KPICard title="Active" value={activePharmacies} icon={CheckCircle2} iconColor="text-green-600" valueColor="text-green-600" />
        <KPICard title="Inactive" value={inactivePharmacies} icon={XCircle} iconColor="text-red-600" valueColor="text-red-600" />
        <KPICard title="Pending" value={pendingPharmacies} icon={Clock} iconColor="text-yellow-600" valueColor="text-yellow-600" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branches ({filteredPharmacies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPharmacies.map((p) => {
                const isActive = p.status === 'active';
                return (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Building2 className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 min-w-[200px]">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm truncate">{p.address || 'No address'}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(p)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDeleteDialog(p)} className="text-red-600 focus:text-red-700">
                             <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Branch</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreatePharmacy} disabled={actionLoading === 'create'}>Request Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Edit Modal */}
       <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Branch</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditPharmacy} disabled={actionLoading === 'edit'}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Branch?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePharmacy} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
