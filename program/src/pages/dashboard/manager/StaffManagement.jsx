import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Users,
  Plus,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Loader2,
  UserCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  Pencil,
  Trash2,
  UserPlus,
  Building2,
  Send,
  History,
} from 'lucide-react';
import { PharmacySelector } from './components/PharmacySelector';
import { StaffActivityTimeline } from '@/components/manager/StaffActivityTimeline';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_MAP = { 1: 'Admin', 2: 'Manager', 3: 'Pharmacist', 4: 'Cashier' };

// ─── Staff Card Component ──────────────────────────────────────────────────
const StaffCard = ({ member, onEdit, onToggle, onRemove, onActivity, actionLoading }) => {
  const memberId = member._id;
  const isActive = member.status === 'active';
  
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager': return 'from-purple-500 to-indigo-600';
      case 'pharmacist': return 'from-blue-500 to-cyan-600';
      case 'cashier': return 'from-emerald-500 to-teal-600';
      default: return 'from-slate-500 to-slate-700';
    }
  };

  const isVerified = member.status !== 'pending';

  return (
    <div className="group relative bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-500 animate-fade-up">
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-b-full bg-gradient-to-r ${getRoleColor(member.role)} opacity-80`} />
      
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${getRoleColor(member.role)} flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
            {getInitials(member.full_name)}
          </div>
          {isActive && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-sm" />
          )}
        </div>

        <div className="space-y-1 mb-6 w-full">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 truncate px-2">
            {member.full_name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {member.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
           <Badge variant="outline" className="rounded-full px-3 py-0.5 bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600 capitalize">
             {member.role}
           </Badge>
           {!isVerified ? (
             <Badge className="rounded-full bg-amber-50 text-amber-700 border-amber-100 font-bold uppercase tracking-wider animate-pulse">
                Pending
             </Badge>
           ) : (
             <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
               Verified
             </Badge>
           )}
           <button 
                onClick={() => onActivity(member)}
                className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors"
           >
                <History className="w-3 h-3" /> Activity
           </button>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-9 text-[11px] font-bold uppercase tracking-tight border-slate-200"
            onClick={() => onEdit(member)}
          >
            <Pencil className="w-3 h-3 mr-1.5" /> Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-9 text-[11px] font-bold uppercase tracking-tight border-slate-200"
            onClick={() => toast.info('Password reset is handled by Clerk.')}
          >
            <Key className="w-3 h-3 mr-1.5" /> Reset
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`rounded-xl h-9 text-[11px] font-bold uppercase tracking-tight col-span-2 ${isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            onClick={() => onToggle(member)}
            disabled={actionLoading === memberId}
          >
            {actionLoading === memberId ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : isActive ? <XCircle className="w-3 h-3 mr-1.5" /> : <CheckCircle className="w-3 h-3 mr-1.5" />}
            {isActive ? 'Deactivate Account' : 'Activate Account'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl h-9 text-[10px] font-bold uppercase tracking-tight col-span-2 text-red-500 hover:bg-red-50"
            onClick={() => onRemove(member)}
          >
            <Trash2 className="w-3 h-3 mr-1.5" /> Remove from team
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">ID: {String(memberId).slice(-6)}</span>
           <span className="text-[9px] font-medium text-slate-400">Joined {new Date(member._creationTime).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export function StaffManagement() {
  // Convex Hooks
  const allStaff = useQuery(api.manager.queries.getStaffMembers) || [];
  const pharmacies = useQuery(api.manager.queries.getBranches) || [];
  const loading = allStaff === undefined || pharmacies === undefined;

  const updateStaffMutation = useMutation(api.manager.mutations.updateStaff);
  const removeStaffMutation = useMutation(api.manager.mutations.removeStaff);
  const createStaffMutation = useMutation(api.manager.mutations.createStaff);
  const createManagerMutation = useMutation(api.manager.mutations.createManager);

  // ── Data state ──
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // ── Action loading ──
  const [actionLoading, setActionLoading] = useState(null);

  // ── Add Staff Modal ──
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [addStaffSuccess, setAddStaffSuccess] = useState(false);
  const [newStaff, setNewStaff] = useState({ full_name: '', email: '', role: 'pharmacist', branch_id: '' });

  // ── Add Manager Modal ──
  const [showAddManager, setShowAddManager] = useState(false);
  const [newManager, setNewManager] = useState({ full_name: '', email: '', branch_id: '' });

  // ── Edit Staff Modal ──
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '' });

  // ── Remove Confirmation ──
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  // ── Staff Activity ──
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityTarget, setActivityTarget] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchActivityLogs = async (staffId) => {
    try {
      setActivitiesLoading(true);
      // Placeholder until we use useQuery properly in a modal component
      toast.info('Activity logs integration is coming soon.');
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      toast.error('Failed to load activity logs');
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const pharmacyStaff = useMemo(() => {
    const activePharmacyId = selectedPharmacy || (pharmacies.length === 1 ? pharmacies[0]._id : null);
    if (!activePharmacyId) return allStaff;
    
    return allStaff.filter(s => String(s.branchId) === String(activePharmacyId) || String(s.pharmacyId) === String(activePharmacyId));
  }, [allStaff, selectedPharmacy, pharmacies]);

  const filteredStaff = useMemo(() => {
    let list = pharmacyStaff;
    if (roleFilter !== 'all') {
      list = list.filter((s) => s.role?.toLowerCase() === roleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }
    return list;
  }, [pharmacyStaff, roleFilter, searchQuery]);

  const metrics = useMemo(() => {
    const total = pharmacyStaff.length;
    const active = pharmacyStaff.filter(s => s.status === 'active').length;
    const pending = pharmacyStaff.filter(s => s.status === 'pending').length;
    
    const activePharmacyId = selectedPharmacy || (pharmacies.length === 1 ? pharmacies[0]._id : null);
    let displayPharmacyName = 'all pharmacies';
    if (activePharmacyId) {
       const b = pharmacies.find((b) => String(b._id) === String(activePharmacyId));
       if (b) displayPharmacyName = b.name;
    }
    return { total, active, pending, displayPharmacyName };
  }, [pharmacyStaff, selectedPharmacy, pharmacies]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.full_name.trim() || !newStaff.email.trim() || !newStaff.branch_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setActionLoading('addStaff');
      const response = await createStaffMutation({
        full_name: newStaff.full_name.trim(),
        email: newStaff.email.trim(),
        role: newStaff.role,
        branchId: newStaff.branch_id
      });
      if (response.success) {
        toast.success(`Staff member created successfully.`);
        setAddStaffSuccess(true);
        setTimeout(() => {
          setShowAddStaff(false);
          setAddStaffSuccess(false);
          setNewStaff({ full_name: '', email: '', role: 'pharmacist', branch_id: '' });
        }, 2000);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create staff');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!newManager.full_name.trim() || !newManager.email.trim() || !newManager.branch_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setActionLoading('addManager');
      const response = await createManagerMutation({
        full_name: newManager.full_name.trim(),
        email: newManager.email.trim(),
        branchId: newManager.branch_id
      });
      if (response.success) {
        toast.success(`Manager created successfully. Pending admin approval.`);
        setShowAddManager(false);
        setNewManager({ full_name: '', email: '', branch_id: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create manager');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('edit');
      const response = await updateStaffMutation({
        id: editTarget._id,
        data: { full_name: editForm.full_name.trim() }
      });
      if (response.success) {
        toast.success('Staff details updated');
        setShowEditStaff(false);
        setEditTarget(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update staff');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (member) => {
    const id = member._id;
    const isCurrentlyActive = member.status === 'active';
    try {
      setActionLoading(id);
      await updateStaffMutation({
        id: id,
        data: { status: isCurrentlyActive ? 'inactive' : 'active' }
      });
      toast.success(`${member.full_name} has been ${isCurrentlyActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveStaff = async () => {
    if (!removeTarget) return;
    try {
      setActionLoading(removeTarget._id);
      await removeStaffMutation({ id: removeTarget._id });
      toast.success(`${removeTarget.full_name} removed`);
      setShowRemoveDialog(false);
      setRemoveTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to remove staff');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground mt-1">Manage pharmacy staff across branches</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setNewStaff({ full_name: '', email: '', role: 'pharmacist', branch_id: pharmacies[0]?._id });
              setShowAddStaff(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {pharmacies.length > 1 && (
        <PharmacySelector
          pharmacies={pharmacies}
          selectedId={selectedPharmacy}
          onChange={setSelectedPharmacy}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">Staff in {metrics.displayPharmacyName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending / Inactive</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting registration</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <StaffCard
            key={member._id}
            member={member}
            onEdit={() => {
              setEditTarget(member);
              setEditForm({ full_name: member.full_name });
              setShowEditStaff(true);
            }}
            onToggle={() => handleToggleActive(member)}
            onRemove={() => {
              setRemoveTarget(member);
              setShowRemoveDialog(true);
            }}
            onActivity={(m) => {
              setActivityTarget(m);
              fetchActivityLogs(m._id);
              setShowActivityModal(true);
            }}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      {/* Add Staff Modal */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new pharmacist or cashier to your pharmacy.</DialogDescription>
          </DialogHeader>
           <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff_name">Full Name</Label>
                <Input
                  id="staff_name"
                  placeholder="John Doe"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff_email">Email</Label>
                <Input
                  id="staff_email"
                  type="email"
                  placeholder="john@example.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newStaff.role} onValueChange={(val) => setNewStaff({ ...newStaff, role: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label>Branch</Label>
                <Select value={newStaff.branch_id} onValueChange={(val) => setNewStaff({ ...newStaff, branch_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacies.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={actionLoading === 'addStaff'}>
                {actionLoading === 'addStaff' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={showEditStaff} onOpenChange={setShowEditStaff}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStaff} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
               <Button type="submit" disabled={actionLoading === 'edit'}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently remove the staff member.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveStaff} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Modal */}
      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Activity Log: {activityTarget?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[50vh] overflow-y-auto">
             <StaffActivityTimeline activities={activities} loading={activitiesLoading} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowActivityModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
