import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import {
  Store,
  MapPin,
  Building2,
  Search,
  Loader2,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Hash,
  Copy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

// ─── Helpers ────────────────────────────────────────────────────────────────
const copyToClipboard = (text, e) => {
  if (e) e.stopPropagation();
  navigator.clipboard.writeText(String(text));
  toast.success(`Branch ID "${text}" copied to clipboard`);
};

const statusVariant = (status) => {
  if (status === 'active' || status === 'approved') return 'medical-active';
  if (status === 'pending') return 'medical-pending';
  if (status === 'rejected') return 'medical-rejected';
  return 'medical-inactive';
};

// ─── Branch Card ───────────────────────────────────────────────────────────
const BranchCard = ({ branch, isSelected, onToggleSelect, onToggleStatus, onApprove, onReject, onDelete, approvingId, rejectingId }) => {
  const isPending = branch.status === 'pending';
  const isActive = branch.status === 'active' || branch.status === 'approved';

  return (
    <div
      onClick={() => onToggleSelect(branch._id)}
      className={`admin-section-card transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        isSelected ? 'ring-1 ring-primary/30 shadow-md' : 'hover:shadow-md'
      }`}
    >
      {/* ... rest of component ... */}
      {isSelected && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary rounded-bl-xl rounded-tr-[calc(theme(borderRadius.2xl)-1px)] p-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
            isSelected ? 'bg-primary text-white' : 'bg-primary/8 dark:bg-primary/10 text-primary'
          }`}>
            <Store className="w-5.5 h-5.5" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => copyToClipboard(branch._id, e)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/6 dark:bg-primary/10 text-primary text-[11px] font-semibold border border-primary/15 dark:border-primary/20 hover:bg-primary/12 dark:hover:bg-primary/18 transition-colors"
              title="Click to copy Branch ID"
            >
              <Hash className="w-3 h-3" />
              {String(branch._id).substring(0, 8)}
              <Copy className="w-2.5 h-2.5 opacity-50" />
            </button>
            <Badge variant={statusVariant(branch.status)} className="text-[10px]">
              {branch.status}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3.5 mb-4">
          <div>
            <h3 className="font-semibold text-[14px] text-foreground truncate">{branch.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {branch.address || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3.5 border-t border-border/40 space-y-2.5">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Button
                variant="medical-danger"
                className="flex-1 rounded-xl h-9 text-[13px]"
                onClick={(e) => { e.stopPropagation(); onReject(branch); }}
                disabled={rejectingId === branch._id}
              >
                {rejectingId === branch._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                Reject
              </Button>
              <Button
                variant="medical"
                className="flex-1 rounded-xl h-9 text-[13px]"
                onClick={(e) => { e.stopPropagation(); onApprove(branch); }}
                disabled={approvingId === branch._id}
              >
                {approvingId === branch._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Approve
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-xl h-8 text-[12px] px-3 ${
                  isActive
                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                    : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                }`}
                onClick={(e) => { e.stopPropagation(); onToggleStatus(branch); }}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(branch._id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export function AdminBranches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, pending, inactive, approved
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDialog, setConfirmBulkDialog] = useState({ open: false, action: null });

  // ─── Convex Hooks ───────────────────────────────────────────────────────
  const branches = useQuery(api.admin.queries.getBranches) || [];
  const approveBranch = useMutation(api.admin.mutations.approveBranch);
  const rejectBranch = useMutation(api.admin.mutations.rejectBranch);
  const activateBranch = useMutation(api.admin.mutations.activateBranch);
  const deactivateBranch = useMutation(api.admin.mutations.deactivateBranch);
  const deleteBranch = useMutation(api.admin.mutations.deleteBranch);

  const isLoading = branches === undefined;

  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const matchesSearch =
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filter === 'all' || b.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [branches, searchQuery, filter]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredBranches.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBranches.map(b => b._id));
    }
  }, [selectedIds.length, filteredBranches]);

  const toggleBranchStatus = async (branch) => {
      const isActivating = branch.status !== 'active';
      try {
          if (isActivating) {
              await activateBranch({ id: branch._id });
              toast.success(`${branch.name} activated`);
          } else {
              await deactivateBranch({ id: branch._id });
              toast.success(`${branch.name} deactivated`);
          }
      } catch (err) {
          toast.error('Failed to update branch status');
      }
  };

  const handleApproveBranch = async (branch) => {
    setApprovingId(branch._id);
    try {
      await approveBranch({ id: branch._id });
      toast.success(`${branch.name} approved`);
    } catch (err) {
      toast.error(err.message || 'Failed to approve branch');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectBranch = async (branch) => {
    setRejectingId(branch._id);
    try {
      await rejectBranch({ id: branch._id });
      toast.success(`${branch.name} rejected`);
    } catch (err) {
      toast.error(err.message || 'Failed to reject branch');
    } finally {
      setRejectingId(null);
    }
  };

  const handleBulkAction = async () => {
    if (!confirmBulkDialog.action || selectedIds.length === 0) return;

    setBulkLoading(true);
    try {
        const promises = selectedIds.map(id => {
            if (confirmBulkDialog.action === 'activate') {
                return activateBranch({ id });
            } else if (confirmBulkDialog.action === 'deactivate') {
                return deactivateBranch({ id });
            } else if (confirmBulkDialog.action === 'delete') {
                return deleteBranch({ id });
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
        toast.success(`Successfully ${confirmBulkDialog.action}d ${selectedIds.length} branches`);
        setSelectedIds([]);
        setConfirmBulkDialog({ open: false, action: null });
    } catch (err) {
        const msg = err.message || `Failed to ${confirmBulkDialog.action} some branches`;
        toast.error(msg);
    } finally {
        setBulkLoading(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading branches...</p>
        </div>
      </div>
    );
  }

  const statusCounts = useMemo(() => {
    return {
      all: branches.length,
      active: branches.filter(b => b.status === 'active').length,
      pending: branches.filter(b => b.status === 'pending').length,
      inactive: branches.filter(b => b.status === 'inactive').length,
    };
  }, [branches]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Platform Branches
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Overview of all physical pharmacy locations across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl h-9 text-[13px]"
            />
          </div>
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
                onClick={toggleSelectAll}
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

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
                variant={filter === 'all' ? 'medical' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="rounded-full text-[12px] px-4 h-9"
            >
                All {statusCounts.all > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">{statusCounts.all}</span>}
            </Button>
            <Button
                variant={filter === 'active' ? 'outline' : 'ghost'}
                onClick={() => setFilter('active')}
                className={`rounded-full text-[12px] px-4 h-9 ${filter === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50' : 'text-muted-foreground'}`}
            >
                Active {statusCounts.active > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">{statusCounts.active}</span>}
            </Button>
            <Button
                variant={filter === 'pending' ? 'outline' : 'ghost'}
                onClick={() => setFilter('pending')}
                className={`rounded-full text-[12px] px-4 h-9 ${filter === 'pending' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700/50' : 'text-muted-foreground'}`}
            >
                Pending {statusCounts.pending > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">{statusCounts.pending}</span>}
            </Button>
            <Button
                variant={filter === 'inactive' ? 'outline' : 'ghost'}
                onClick={() => setFilter('inactive')}
                className={`rounded-full text-[12px] px-4 h-9 ${filter === 'inactive' ? 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600/50' : 'text-muted-foreground'}`}
            >
                Inactive {statusCounts.inactive > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">{statusCounts.inactive}</span>}
            </Button>
        </div>

        {selectedIds.length === 0 && filteredBranches.length > 0 && (
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider px-2.5 h-7 hover:text-foreground"
              >
                  {selectedIds.length === filteredBranches.length ? <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-primary" /> : <Square className="w-3.5 h-3.5 mr-1.5" />}
                  {selectedIds.length === filteredBranches.length ? 'Clear Selection' : 'Select All'}
              </Button>
        )}
      </div>

      {/* Branch Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.length === 0 && (
          <div className="col-span-full py-16 text-center admin-section-card">
            <Store className="w-6 h-6 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-[13px] font-medium text-muted-foreground">
              {filter !== 'all' ? `No ${filter} branches found.` : 'No branches found.'}
            </p>
          </div>
        )}
        {filteredBranches.map((branch) => (
          <BranchCard
            key={branch.id || branch.branch_id}
            branch={branch}
            isSelected={selectedIds.includes(branch.id || branch.branch_id)}
            onToggleSelect={toggleSelect}
            onToggleStatus={toggleBranchStatus}
            onApprove={handleApproveBranch}
            onReject={handleRejectBranch}
            onDelete={(id) => {
              setSelectedIds([id]);
              setConfirmBulkDialog({ open: true, action: 'delete' });
            }}
            approvingId={approvingId}
            rejectingId={rejectingId}
          />
        ))}
      </div>

      {/* Confirm Bulk Dialog */}
      <Dialog
        open={confirmBulkDialog.open}
        onOpenChange={(open) => {
            if (!bulkLoading && !open) {
                setConfirmBulkDialog(p => ({ ...p, open: false }));
                if (selectedIds.length === 1) setSelectedIds([]);
            }
        }}
      >
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
                Are you sure you want to <strong>{confirmBulkDialog.action}</strong> {selectedIds.length} selected branch{selectedIds.length !== 1 ? 'es' : ''}?
                {confirmBulkDialog.action === 'delete' && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] space-y-2">
                        <p className="font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Deletion Requirements
                        </p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Ensure no <strong>Managers</strong> are assigned to these branches.</li>
                            <li>Ensure all <strong>Staff</strong> (Pharmacists/Cashiers) have been removed.</li>
                            <li>The system will reject deletion if active dependencies exist.</li>
                        </ul>
                    </div>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmBulkDialog({ open: false, action: null })} disabled={bulkLoading} className="rounded-xl">Cancel</Button>
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
    </div>
  );
}
