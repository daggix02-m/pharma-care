import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/ui';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import gsap from 'gsap';
import {
  Search,
  Plus,
  Users,
  Package,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_SIZE = 15;

export function ManagerDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            immediateRender: true,
          }
        );
      }
    }, contentRef);
    return () => ctx.revert();
  }, [activeTab]);

  return (
    <div className='space-y-8 pb-12'>
      <div>
        <h1 className='text-3xl font-display font-bold tracking-tight text-foreground'>
          Manager Dashboard
        </h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Manage your pharmacy operations and staff
        </p>
      </div>

      <Tabs value={activeTab} className='w-full'>
        <div ref={contentRef}>
          <TabsContent value='overview' className='mt-0 focus:outline-none'>
            <OverviewTab />
          </TabsContent>

          <TabsContent value='branches' className='mt-0 focus:outline-none'>
            <BranchesTab />
          </TabsContent>

          <TabsContent value='staff' className='mt-0 focus:outline-none'>
            <StaffTab />
          </TabsContent>

          <TabsContent value='audit' className='mt-0 focus:outline-none'>
            <AuditTrailTab />
          </TabsContent>

          <TabsContent value='settings' className='mt-0 focus:outline-none'>
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const { sessionToken } = useAuth();
  const stats = useQuery(
    api.manager.queries.getDashboardStats,
    sessionToken ? { sessionToken } : 'skip'
  );
  const salesByPeriod = useQuery(
    api.manager.queries.getSalesByPeriod,
    sessionToken ? { sessionToken, period: '7days' } : 'skip'
  );
  const loading = stats === undefined || salesByPeriod === undefined;

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-32 rounded-2xl' />
          ))}
        </div>
        <Skeleton className='h-96 rounded-2xl' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard title='Total Staff' value={stats.totalStaff} icon={Users} color='text-primary' />
        <StatCard
          title='Branches'
          value={stats.totalBranches}
          icon={Building2}
          color='text-primary'
        />
        <StatCard
          title='Total Revenue'
          value={`ETB ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color='text-primary'
        />
        <StatCard
          title='Low Stock Items'
          value={stats.lowStockItems}
          icon={Package}
          color='text-destructive'
        />
      </div>

      <Card className='minimal-card'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>Performance Overview</CardTitle>
          <CardDescription>Activity and growth indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='flex items-center justify-between p-5 rounded-2xl bg-secondary/10 border border-border/40'>
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 rounded-xl bg-background flex items-center justify-center'>
                  <TrendingUp className='w-5 h-5 text-emerald-600' />
                </div>
                <div>
                  <p className='text-[12px] font-bold uppercase tracking-widest text-muted-foreground'>
                    Revenue Trend
                  </p>
                  <p className='font-semibold text-emerald-600'>{stats.revenueChange}</p>
                </div>
              </div>
            </div>
            <div className='flex items-center justify-between p-5 rounded-2xl bg-secondary/10 border border-border/40'>
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 rounded-xl bg-background flex items-center justify-center'>
                  <TrendingDown className='w-5 h-5 text-amber-600' />
                </div>
                <div>
                  <p className='text-[12px] font-bold uppercase tracking-widest text-muted-foreground'>
                    Stock Movement
                  </p>
                  <p className='font-semibold text-amber-600'>{stats.stockChange}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className='minimal-card p-6'>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
          {title}
        </p>
        <div
          className={cn('w-8 h-8 rounded-lg bg-secondary flex items-center justify-center', color)}
        >
          <Icon className='h-4 w-4' />
        </div>
      </div>
      <div className='text-2xl font-display font-bold'>{value}</div>
    </Card>
  );
}

interface Branch {
  _id: string;
  name: string;
  address?: string;
  status?: string;
}

function BranchesTab() {
  const { sessionToken } = useAuth();
  const branches = useQuery(
    api.manager.queries.getBranches,
    sessionToken ? { sessionToken } : 'skip'
  );
  const pendingBranches = useQuery(
    api.manager.queries.getPendingBranches,
    sessionToken ? { sessionToken } : 'skip'
  );
  const loading = branches === undefined || pendingBranches === undefined;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState({ name: '', address: '' });
  const [editBranch, setEditBranch] = useState({ name: '', address: '' });

  const requestBranchMutation = useMutation(api.manager.mutations.requestBranch);
  const updateBranchMutation = useMutation(api.manager.mutations.updateBranch);
  const removeBranchMutation = useMutation(api.manager.mutations.removeBranch);

  const handleAddBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBranch.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    try {
      await requestBranchMutation({
        name: newBranch.name.trim(),
        address: newBranch.address.trim(),
      });
      toast.success('Branch request submitted');
      setShowAddDialog(false);
      setNewBranch({ name: '', address: '' });
    } catch (err) {
      toast.error((err as Error).message || 'Failed to request branch');
    }
  };

  const handleUpdateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBranch) return;
    try {
      await updateBranchMutation({
        id: selectedBranch._id,
        data: {
          name: editBranch.name.trim(),
          address: editBranch.address.trim(),
        },
      });
      toast.success('Branch updated');
      setShowEditDialog(false);
      setSelectedBranch(null);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update branch');
    }
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    try {
      await removeBranchMutation({ id: selectedBranch._id });
      toast.success('Branch deleted');
      setShowDeleteDialog(false);
      setSelectedBranch(null);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to delete branch');
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setEditBranch({ name: branch.name, address: branch.address || '' });
    setShowEditDialog(true);
  };

  if (loading)
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className='h-48 rounded-2xl' />
        ))}
      </div>
    );

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold font-display'>Pharmacy Branches</h2>
          <p className='text-muted-foreground text-sm'>Manage physical locations</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className='rounded-xl h-10 gap-2'>
          <Plus className='h-4 w-4' />
          Add Branch
        </Button>
      </div>

      {pendingBranches && pendingBranches.length > 0 && (
        <Card className='border-primary/10 bg-primary/5'>
          <CardHeader>
            <CardTitle className='text-[14px] font-bold uppercase tracking-widest flex items-center gap-2'>
              <Clock className='w-4 h-4' />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3'>
              {pendingBranches.map((branch: Branch) => (
                <div
                  key={branch._id}
                  className='flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/40'
                >
                  <div>
                    <p className='font-bold text-[14px]'>{branch.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {branch.address || 'No address'}
                    </p>
                  </div>
                  <Badge
                    variant='secondary'
                    className='text-[10px] font-bold uppercase tracking-widest'
                  >
                    Awaiting Approval
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {branches.map((branch: Branch) => (
          <Card key={branch._id} className='minimal-card'>
            <CardHeader className='pb-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-lg font-bold'>{branch.name}</CardTitle>
                  <p className='text-xs text-muted-foreground flex items-center gap-1.5 mt-1'>
                    <MapPin className='w-3 h-3' /> {branch.address || 'No address'}
                  </p>
                </div>
                <Badge
                  variant={branch.status === 'active' ? 'default' : 'outline'}
                  className='text-[10px] font-bold uppercase'
                >
                  {branch.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2 pt-4 border-t border-border/40'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => openEditDialog(branch)}
                  className='rounded-lg h-8 flex-1 gap-1.5'
                >
                  <Pencil className='h-3.5 w-3.5' />
                  Edit
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-lg h-8 px-3 text-destructive hover:bg-destructive/5 border-border/60'
                  onClick={() => {
                    setSelectedBranch(branch);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className='rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>Request a new branch for your pharmacy</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBranch}>
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='name'>Branch Name</Label>
                <Input
                  id='name'
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder='e.g. Downtown Central'
                  className='rounded-xl h-11'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='address'>Full Address</Label>
                <Input
                  id='address'
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  placeholder='e.g. 123 Health Ave, Suite 100'
                  className='rounded-xl h-11'
                />
              </div>
            </div>
            <DialogFooter className='mt-8'>
              <Button type='button' variant='ghost' onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type='submit' className='rounded-xl h-11 px-8'>
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBranch}>
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-name'>Branch Name</Label>
                <Input
                  id='edit-name'
                  value={editBranch.name}
                  onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                  className='rounded-xl h-11'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-address'>Full Address</Label>
                <Input
                  id='edit-address'
                  value={editBranch.address}
                  onChange={(e) => setEditBranch({ ...editBranch, address: e.target.value })}
                  className='rounded-xl h-11'
                />
              </div>
            </div>
            <DialogFooter className='mt-8'>
              <Button type='button' variant='ghost' onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type='submit' className='rounded-xl h-11 px-8'>
                Update Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBranch?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-xl'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBranch}
              className='bg-destructive hover:bg-destructive/90 rounded-xl'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface StaffMember {
  _id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
}

function StaffTab() {
  const { sessionToken } = useAuth();
  const allStaff = useQuery(
    api.manager.queries.getStaffMembers,
    sessionToken ? { sessionToken } : 'skip'
  );
  const branches = useQuery(
    api.manager.queries.getBranches,
    sessionToken ? { sessionToken } : 'skip'
  );
  const loading = allStaff === undefined || branches === undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    email: '',
    role: 'pharmacist',
    branchId: '',
  });
  const [editForm, setEditForm] = useState({ full_name: '' });

  const updateStaffMutation = useMutation(api.manager.mutations.updateStaff);
  const removeStaffMutation = useMutation(api.manager.mutations.removeStaff);
  const createStaffMutation = useMutation(api.manager.mutations.createStaff);
  const createManagerMutation = useMutation(api.manager.mutations.createManager);

  const filteredStaff = useMemo(() => {
    if (!allStaff) return [];
    let list = allStaff;
    if (roleFilter !== 'all') {
      list = list.filter((s: { role?: string }) => s.role?.toLowerCase() === roleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s: { full_name?: string; email?: string }) =>
          s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStaff, roleFilter, searchQuery]);

  const metrics = useMemo(() => {
    if (!allStaff) return { total: 0, active: 0, pending: 0 };
    return {
      total: allStaff.length,
      active: allStaff.filter((s: { status: string }) => s.status === 'active').length,
      pending: allStaff.filter((s: { status: string }) => s.status === 'pending').length,
    };
  }, [allStaff]);

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newStaff.full_name.trim() || !newStaff.email.trim() || !newStaff.branchId) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setActionLoading('addStaff');
      if (newStaff.role === 'manager') {
        await createManagerMutation({
          full_name: newStaff.full_name.trim(),
          email: newStaff.email.trim(),
          branchId: newStaff.branchId,
        });
      } else {
        await createStaffMutation({
          full_name: newStaff.full_name.trim(),
          email: newStaff.email.trim(),
          role: newStaff.role,
          branchId: newStaff.branchId,
        });
      }
      toast.success('Staff member created successfully');
      setShowAddDialog(false);
      setNewStaff({ full_name: '', email: '', role: 'pharmacist', branchId: '' });
    } catch (err) {
      toast.error((err as Error).message || 'Failed to create staff');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setActionLoading('edit');
      await updateStaffMutation({
        id: editTarget._id,
        data: { full_name: editForm.full_name.trim() },
      });
      toast.success('Staff details updated');
      setShowEditDialog(false);
      setEditTarget(null);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update staff');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    const id = member._id;
    const isCurrentlyActive = member.status === 'active';
    try {
      setActionLoading(id);
      await updateStaffMutation({
        id,
        data: { status: isCurrentlyActive ? 'inactive' : 'active' },
      });
      toast.success(
        `${member.full_name} has been ${isCurrentlyActive ? 'deactivated' : 'activated'}`
      );
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update status');
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
      toast.error((err as Error).message || 'Failed to remove staff');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <Skeleton className='h-10 w-48 rounded-xl' />
          <Skeleton className='h-10 w-32 rounded-xl' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-24 rounded-2xl' />
          ))}
        </div>
        <Skeleton className='h-96 rounded-2xl' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-xl font-bold font-display'>Staff Management</h2>
          <p className='text-muted-foreground text-sm'>Manage team and permissions</p>
        </div>
        <Button
          onClick={() => {
            setNewStaff({
              full_name: '',
              email: '',
              role: 'pharmacist',
              branchId: (branches || [])[0]?._id,
            });
            setShowAddDialog(true);
          }}
          className='rounded-xl h-10 gap-2'
        >
          <Plus className='h-4 w-4' />
          Add Staff
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <StatCard title='Total Staff' value={metrics.total} icon={Users} color='text-primary' />
        <StatCard
          title='Active Staff'
          value={metrics.active}
          icon={CheckCircle}
          color='text-emerald-600'
        />
        <StatCard title='Pending' value={metrics.pending} icon={Clock} color='text-amber-600' />
      </div>

      <Card className='minimal-card'>
        <CardHeader className='pb-6'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
              <Input
                placeholder='Search by name or email...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 h-11 rounded-xl'
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className='w-full sm:w-44 h-11 rounded-xl'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='rounded-xl'>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='pharmacist'>Pharmacists</SelectItem>
                <SelectItem value='cashier'>Cashiers</SelectItem>
                <SelectItem value='manager'>Managers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-xl border border-border/40 overflow-hidden'>
            <Table>
              <TableHeader className='bg-secondary/20'>
                <TableRow>
                  <TableHead className='font-bold text-[11px] uppercase tracking-widest py-4'>
                    Name
                  </TableHead>
                  <TableHead className='font-bold text-[11px] uppercase tracking-widest py-4'>
                    Email
                  </TableHead>
                  <TableHead className='font-bold text-[11px] uppercase tracking-widest py-4'>
                    Role
                  </TableHead>
                  <TableHead className='font-bold text-[11px] uppercase tracking-widest py-4'>
                    Status
                  </TableHead>
                  <TableHead className='font-bold text-[11px] uppercase tracking-widest py-4 text-right pr-6'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member: StaffMember) => (
                  <TableRow key={member._id} className='hover:bg-secondary/5 transition-colors'>
                    <TableCell className='font-semibold py-4'>{member.full_name}</TableCell>
                    <TableCell className='text-muted-foreground'>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='capitalize text-[11px] px-2'>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className='text-[11px] px-2'
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right pr-6 py-4'>
                      <div className='flex gap-1 justify-end'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            setEditTarget(member);
                            setEditForm({ full_name: member.full_name });
                            setShowEditDialog(true);
                          }}
                          className='h-8 w-8 rounded-lg'
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleToggleActive(member)}
                          disabled={actionLoading === member._id}
                          className={cn(
                            'h-8 w-8 rounded-lg',
                            member.status === 'active' ? 'text-amber-600' : 'text-emerald-600'
                          )}
                        >
                          {actionLoading === member._id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : member.status === 'active' ? (
                            <XCircle className='h-4 w-4' />
                          ) : (
                            <CheckCircle className='h-4 w-4' />
                          )}
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            setRemoveTarget(member);
                            setShowRemoveDialog(true);
                          }}
                          className='h-8 w-8 rounded-lg text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className='rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Create a new staff account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff}>
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='staff-name'>Full Name</Label>
                <Input
                  id='staff-name'
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                  placeholder='Enter full name'
                  className='rounded-xl h-11'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='staff-email'>Email</Label>
                <Input
                  id='staff-email'
                  type='email'
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder='Enter email address'
                  className='rounded-xl h-11'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='staff-role'>Role</Label>
                <Select
                  value={newStaff.role}
                  onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
                >
                  <SelectTrigger className='rounded-xl h-11'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='rounded-xl'>
                    <SelectItem value='pharmacist'>Pharmacist</SelectItem>
                    <SelectItem value='cashier'>Cashier</SelectItem>
                    <SelectItem value='manager'>Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='staff-branch'>Branch</Label>
                <Select
                  value={newStaff.branchId}
                  onValueChange={(value) => setNewStaff({ ...newStaff, branchId: value })}
                >
                  <SelectTrigger className='rounded-xl h-11'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='rounded-xl'>
                    {(branches || []).map((branch: Branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className='mt-8'>
              <Button type='button' variant='ghost' onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-xl h-11 px-8'
                disabled={actionLoading === 'addStaff'}
              >
                {actionLoading === 'addStaff' ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : null}
                Create Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStaff}>
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-staff-name'>Full Name</Label>
                <Input
                  id='edit-staff-name'
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ full_name: e.target.value })}
                  className='rounded-xl h-11'
                />
              </div>
            </div>
            <DialogFooter className='mt-8'>
              <Button type='button' variant='ghost' onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-xl h-11 px-8'
                disabled={actionLoading === 'edit'}
              >
                {actionLoading === 'edit' ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : null}
                Update Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeTarget?.full_name}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-xl'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStaff}
              className='bg-destructive hover:bg-destructive/90 rounded-xl'
              disabled={!!removeTarget?._id && actionLoading === removeTarget._id}
            >
              {removeTarget?._id && actionLoading === removeTarget._id ? (
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface AuditLog {
  _id: string;
  action?: string;
  details?: string;
  timestamp?: string;
}

function AuditTrailTab() {
  const { sessionToken } = useAuth();
  const logs = useQuery(
    api.manager.queries.getAuditTrail,
    sessionToken ? { sessionToken } : 'skip'
  );
  const loading = logs === undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType] = useState('all');
  const [currentPage] = useState(1);

  const getActionType = (action: string) => {
    const a = (action || '').toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'create';
    if (a.includes('update') || a.includes('edit')) return 'update';
    if (a.includes('delete') || a.includes('remove')) return 'delete';
    if (a.includes('stock') || a.includes('inventory') || a.includes('import')) return 'inventory';
    return 'other';
  };

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log: AuditLog) => {
      const matchesSearch =
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || getActionType(log.action || '') === filterType;
      return matchesSearch && matchesType;
    });
  }, [logs, searchTerm, filterType]);

  const paginatedLogs = useMemo(
    () => filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredLogs, currentPage]
  );

  if (loading)
    return (
      <div className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-20 rounded-2xl' />
        ))}
      </div>
    );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-xl font-bold font-display'>Audit Trail</h2>
          <p className='text-muted-foreground text-sm'>System activity logs</p>
        </div>
      </div>

      <Card className='minimal-card overflow-hidden'>
        <div className='p-4 bg-secondary/10 border-b border-border/40 flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60' />
            <Input
              placeholder='Filter activities...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 h-10 rounded-xl bg-background border-border/40'
            />
          </div>
        </div>
        <div className='divide-y divide-border/40'>
          {paginatedLogs.map((log: AuditLog) => (
            <div key={log._id} className='p-5 flex gap-4 hover:bg-secondary/5 transition-colors'>
              <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0'>
                <Activity className='w-4 h-4 text-primary' />
              </div>
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-1'>
                  <p className='font-bold text-[14px]'>{log.action}</p>
                  <span className='text-[11px] text-muted-foreground font-mono'>
                    {new Date(log.timestamp || Date.now()).toLocaleString()}
                  </span>
                </div>
                <p className='text-[13px] text-muted-foreground'>
                  {log.details || 'No details available'}
                </p>
              </div>
            </div>
          ))}
          {paginatedLogs.length === 0 && (
            <div className='py-20 text-center text-muted-foreground'>No activities found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function SettingsTab() {
  const { sessionToken } = useAuth();
  const pharmacyData = useQuery(
    api.manager.queries.getMyPharmacy,
    sessionToken ? { sessionToken } : 'skip'
  );
  const loading = pharmacyData === undefined;
  if (loading) return <Skeleton className='h-96 rounded-2xl' />;

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <Card className='minimal-card'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>Pharmacy Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                Pharmacy Name
              </p>
              <p className='font-semibold text-lg'>{pharmacyData?.name}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                License Code
              </p>
              <p className='font-mono text-sm'>{pharmacyData?.licenseCode}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                Subscription
              </p>
              <Badge className='capitalize'>{pharmacyData?.subscriptionTier}</Badge>
            </div>
            <div className='space-y-1'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                Status
              </p>
              <Badge variant='outline'>{pharmacyData?.status}</Badge>
            </div>
          </div>
          <div className='pt-6 border-t border-border/40'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3'>
              Invite Code
            </p>
            <div className='flex items-center gap-4'>
              <div className='h-11 px-4 rounded-xl bg-secondary/20 border border-border/40 flex items-center font-mono font-bold text-primary flex-1'>
                {pharmacyData?.inviteCode}
              </div>
              <Button variant='outline' className='h-11 rounded-xl gap-2'>
                <RefreshCw className='w-4 h-4' />
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
