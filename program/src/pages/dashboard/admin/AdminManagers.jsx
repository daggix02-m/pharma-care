import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import {
  Users,
  Mail,
  ShieldCheck,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Loader2,
  RefreshCw,
  KeyRound,
  CheckSquare,
  Square,
  Trash2,
  AlertTriangle,
  MapPin,
  Store,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/select';

// ─── Manager Card ───────────────────────────────────────────────────────────
const ManagerCard = ({ manager, isSelected, onToggleSelect, onToggleStatus, onResetPassword }) => {
  const isActive = manager.is_active || manager.status === 'activated';

  return (
    <div
      onClick={() => onToggleSelect(manager.id || manager.user_id)}
      className={`admin-section-card transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        isSelected ? 'ring-1 ring-primary/30 shadow-md' : 'hover:shadow-md'
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary rounded-bl-xl rounded-tr-[calc(theme(borderRadius.2xl)-1px)] p-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Top row: avatar + name + actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base font-display transition-colors ${
              isSelected
                ? 'bg-primary text-white'
                : 'bg-primary/8 dark:bg-primary/10 text-primary'
            }`}>
              {manager.full_name?.charAt(0) || 'M'}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[14px] text-foreground truncate max-w-[160px]">
                {manager.full_name}
              </h3>
              <Badge
                variant={isActive ? 'medical-active' : 'medical-inactive'}
                className="text-[10px] mt-1"
              >
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/60 min-w-[180px]">
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onToggleStatus(manager); }}
                className="rounded-lg text-[13px] gap-2.5 py-2"
              >
                {isActive
                  ? <><XCircle className="w-4 h-4 text-amber-500" /> Deactivate Account</>
                  : <><CheckCircle className="w-4 h-4 text-emerald-500" /> Activate Account</>
                }
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onResetPassword(manager); }}
                className="rounded-lg text-[13px] gap-2.5 py-2"
              >
                <KeyRound className="w-4 h-4 text-primary" />
                Reset Password
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
            <Mail className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
            <span className="truncate">{manager.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
            <Store className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
            <span className="truncate">{manager.branch_name || 'No Branch'}</span>
          </div>
          {manager.location && (
            <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span className="truncate">{manager.location}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-border/40 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            ID: {String(manager.id || manager.user_id)}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" /> Manager
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export function AdminManagers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPharmacy, setFilterPharmacy] = useState('all');
  const [resetPwDialog, setResetPwDialog] = useState({ open: false, manager: null, loading: false });
  const [newPassword, setNewPassword] = useState('');
  
  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDialog, setConfirmBulkDialog] = useState({ open: false, action: null });

  // ─── Convex Hooks ───────────────────────────────────────────────────────
  const managers = useQuery(api.admin.queries.getAllManagers) || [];
  const pharmacies = useQuery(api.admin.queries.getPharmacies) || [];
  const branches = useQuery(api.admin.queries.getBranches) || [];

  const activateManager = useMutation(api.admin.mutations.activateManager);
  const deactivateManager = useMutation(api.admin.mutations.deactivateManager);
  const deleteManager = useMutation(api.admin.mutations.deleteManager);

  const isLoading = managers === undefined || pharmacies === undefined || branches === undefined;

  // Build a branch_id -> pharmacy_id lookup
  const branchToPharmacy = useMemo(() => {
    const map = {};
    branches.forEach(b => { map[b._id] = b.pharmacyId; });
    return map;
  }, [branches]);

  const filteredManagers = useMemo(() =>
    managers.filter(m => {
      const matchesSearch =
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterPharmacy && filterPharmacy !== 'all') {
        const managerPharmacyId = branchToPharmacy[m.branchId];
        if (managerPharmacyId !== filterPharmacy) return false;
      }

      return true;
    }), [managers, searchQuery, filterPharmacy, branchToPharmacy]);

  // ─── Selection ──────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredManagers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredManagers.map(m => m.id || m.user_id));
    }
  }, [selectedIds.length, filteredManagers]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const toggleManagerStatus = async (manager) => {
    const isActivating = manager.status !== 'activated';
    try {
        if (isActivating) {
            await activateManager({ id: manager._id });
            toast.success(`${manager.full_name} activated`);
        } else {
            await deactivateManager({ id: manager._id });
            toast.success(`${manager.full_name} deactivated`);
        }
    } catch (err) {
        toast.error('Failed to update manager status');
    }
  };

  const handleBulkAction = async () => {
    if (!confirmBulkDialog.action || selectedIds.length === 0) return;
    
    setBulkLoading(true);
    try {
        const promises = selectedIds.map(id => {
            if (confirmBulkDialog.action === 'activate') {
                return activateManager({ id });
            } else if (confirmBulkDialog.action === 'deactivate') {
                return deactivateManager({ id });
            } else if (confirmBulkDialog.action === 'delete') {
                return deleteManager({ id });
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
        toast.success(`Successfully ${confirmBulkDialog.action}d ${selectedIds.length} managers`);
        setSelectedIds([]);
        setConfirmBulkDialog({ open: false, action: null });
    } catch (err) {
        toast.error(`Failed to ${confirmBulkDialog.action} some managers`);
    } finally {
        setBulkLoading(false);
    }
  };

  const handleResetPassword = async () => {
      // With Clerk, password reset should be handled via Clerk's API or UI.
      // For now, we'll just show a toast as it's a managed auth system.
      toast.info('Password reset is managed by Clerk. Please use Clerk dashboard or send reset email.');
      setResetPwDialog({ open: false, manager: null, loading: false });
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading managers...</p>
        </div>
      </div>
    );
  }

  // ─── Stats ────────────────────────────────────────────────────────────────
  const activeCount = managers.filter(m => m.is_active || m.status === 'activated').length;
  const inactiveCount = managers.length - activeCount;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Manager Accounts
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Activate, deactivate, and manage pharmacy managers.
            <span className="ml-2 text-muted-foreground/60">
              {managers.length} total &middot; {activeCount} active &middot; {inactiveCount} pending
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              placeholder="Search managers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl h-9 text-[13px]"
            />
          </div>
          <Select value={filterPharmacy} onValueChange={setFilterPharmacy}>
            <SelectTrigger className="rounded-xl h-9 w-48 text-[13px] border-border/60">
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Pharmacies</SelectItem>
              {pharmacies.map(p => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => {}} className="rounded-xl h-9 w-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary text-white rounded-2xl p-3.5 flex items-center justify-between animate-in slide-in-from-top-4 duration-300 shadow-lg shadow-primary/15">
          <div className="flex items-center gap-3 ml-1">
            <span className="text-[12px] font-bold uppercase tracking-wider">{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-white/20" />
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIds([])} 
                className="text-white hover:bg-white/15 text-[11px] font-semibold uppercase tracking-wider h-7 px-2.5"
            >
                Deselect All
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setConfirmBulkDialog({ open: true, action: 'activate' })}
                className="text-white hover:bg-white/15 text-[11px] font-semibold uppercase tracking-wider gap-1.5 h-7"
            >
                <CheckCircle className="w-3.5 h-3.5" /> Activate
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setConfirmBulkDialog({ open: true, action: 'deactivate' })}
                className="text-white hover:bg-white/15 text-[11px] font-semibold uppercase tracking-wider gap-1.5 h-7"
            >
                <XCircle className="w-3.5 h-3.5" /> Deactivate
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setConfirmBulkDialog({ open: true, action: 'delete' })}
                className="text-white hover:bg-white/15 text-[11px] font-semibold uppercase tracking-wider gap-1.5 h-7"
            >
                <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Select All toggle */}
      {selectedIds.length === 0 && filteredManagers.length > 0 && (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSelectAll}
            className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider px-2.5 h-7 hover:text-foreground"
          >
              <Square className="w-3.5 h-3.5 mr-1.5" />
              Select All
          </Button>
        </div>
      )}

      {/* Manager Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredManagers.length === 0 && (
          <div className="col-span-full py-16 text-center admin-section-card">
            <Users className="w-6 h-6 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-[13px] font-medium text-muted-foreground">
              {managers.length === 0
                ? 'No managers registered yet.'
                : 'No managers match your filters.'}
            </p>
            {managers.length === 0 && (
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Managers will appear here after they sign up through the registration flow.
              </p>
            )}
          </div>
        )}
        {filteredManagers.map((manager) => (
          <ManagerCard
            key={manager.id || manager.user_id}
            manager={manager}
            isSelected={selectedIds.includes(manager.id || manager.user_id)}
            onToggleSelect={toggleSelect}
            onToggleStatus={toggleManagerStatus}
            onResetPassword={(m) => setResetPwDialog({ open: true, manager: m, loading: false })}
          />
        ))}
      </div>

      {/* Confirm Bulk Dialog */}
      <Dialog open={confirmBulkDialog.open} onOpenChange={(open) => !bulkLoading && setConfirmBulkDialog(p => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                confirmBulkDialog.action === 'delete'
                  ? 'bg-red-50 dark:bg-red-500/10'
                  : 'bg-amber-50 dark:bg-amber-500/10'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${
                  confirmBulkDialog.action === 'delete' ? 'text-red-500' : 'text-amber-500'
                }`} />
              </div>
              Confirm Bulk {confirmBulkDialog.action === 'delete' ? 'Delete' : confirmBulkDialog.action === 'activate' ? 'Activation' : 'Deactivation'}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
                Are you sure you want to <strong>{confirmBulkDialog.action}</strong> {selectedIds.length} selected manager account{selectedIds.length !== 1 ? 's' : ''}?
                {confirmBulkDialog.action === 'delete' && (
                  <span className="block mt-2 text-red-500 text-[12px]">This action cannot be undone.</span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmBulkDialog({ open: false, action: null })}
              disabled={bulkLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
                onClick={handleBulkAction} 
                disabled={bulkLoading} 
                variant={confirmBulkDialog.action === 'delete' ? 'destructive' : 'medical'}
                className="rounded-xl"
            >
              {bulkLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {confirmBulkDialog.action === 'delete'
                ? 'Yes, Delete All'
                : `${confirmBulkDialog.action === 'activate' ? 'Activate' : 'Deactivate'} All`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwDialog.open} onOpenChange={(open) => !resetPwDialog.loading && setResetPwDialog(p => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-primary" />
              </div>
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-[13px]">
                Set a new password for <strong>{resetPwDialog.manager?.full_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
              <label className="text-[13px] font-medium text-foreground block">New Password</label>
              <Input 
                type="password"
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <div className="bg-muted/40 rounded-xl p-3 border border-border/40">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The manager will need to use this new password to log in. Consider sharing it securely.
                </p>
              </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setResetPwDialog({ open: false, manager: null, loading: false }); setNewPassword(''); }}
              disabled={resetPwDialog.loading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="medical"
              onClick={handleResetPassword}
              disabled={resetPwDialog.loading || !newPassword || newPassword.length < 6}
              className="rounded-xl"
            >
              {resetPwDialog.loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Set New Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
