import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  MapPin,
  Mail,
  ShieldCheck,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Store,
  UserRound,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CACHE_TIMES } from '@/constants';
import { Badge } from '@/components/ui/badge';

import logger from '@/utils/logger';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ─── Manager Request Card ────────────────────────────────────────────────────
const ManagerRequestCard = ({ manager, onApprove, onReject, approvingId, rejectingId }) => (
  <div className="admin-section-card group">
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
             <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Owner / Manager</p>
             <p className="text-[13px] font-medium text-foreground truncate max-w-[140px]">
              {manager.full_name || 'N/A'}
             </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      </div>

      {/* Manager Info */}
      <div className="bg-violet-50/40 dark:bg-violet-900/8 rounded-xl p-4 mb-4 border border-violet-100/60 dark:border-violet-900/20">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
            <UserRound className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Owner / Manager</p>
            <p className="text-[13px] font-medium text-foreground">{manager.full_name || 'N/A'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 pl-1">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Mail className="w-3.5 h-3.5 opacity-60" />
            {manager.email || 'No email provided'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="medical-danger"
          className="flex-1 rounded-xl h-9 text-[13px]"
          onClick={() => onReject(manager._id, 'manager')}
          disabled={rejectingId === manager._id}
        >
          {rejectingId === manager._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
          Reject
        </Button>
        <Button
          variant="medical"
          className="flex-1 rounded-xl h-9 text-[13px]"
          onClick={() => onApprove(manager._id, 'manager')}
          disabled={approvingId === manager._id}
        >
          {approvingId === manager._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Approve
        </Button>
      </div>
    </div>
  </div>
);

// ─── Branch Request Card ─────────────────────────────────────────────────────
const BranchRequestCard = ({ branch, onApprove, onReject, approvingId, rejectingId }) => (
  <div className="admin-section-card">
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary">
          <Store className="w-5.5 h-5.5" />
        </div>
        <Badge variant="medical-pending" className="text-[10px] px-2 py-1">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-3.5 mb-4">
        <div>
          <h3 className="font-semibold text-[14px] text-foreground">{branch.branch_name}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> {branch.location}
          </p>
        </div>
        <div className="pt-3 border-t border-border/40">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Affiliated Pharmacy</p>
          <p className="text-[13px] font-medium text-foreground truncate">{branch.pharmacy_name}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="medical-danger"
          className="flex-1 rounded-xl h-9 text-[13px]"
          onClick={() => onReject(branch._id, 'branch')}
          disabled={rejectingId === branch._id}
        >
          {rejectingId === branch._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
          Reject
        </Button>
        <Button
          variant="medical"
          className="flex-1 rounded-xl h-9 text-[13px]"
          onClick={() => onApprove(branch._id, 'branch')}
          disabled={approvingId === branch._id}
        >
          {approvingId === branch._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Approve
        </Button>
      </div>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export function AdminApprovals() {
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // ─── Convex Hooks ───────────────────────────────────────────────────────
  const pendingManagersRaw = useQuery(api.admin.queries.getPendingManagers) || [];
  const pendingBranchesRaw = useQuery(api.admin.queries.getPendingBranches) || [];
  
  const activateManager = useMutation(api.admin.mutations.activateManager);
  const deactivateManager = useMutation(api.admin.mutations.deactivateManager);
  const approveBranch = useMutation(api.admin.mutations.approveBranch);
  const rejectBranch = useMutation(api.admin.mutations.rejectBranch);

  const isLoading = pendingManagersRaw === undefined || pendingBranchesRaw === undefined;

  const pendingManagers = useMemo(() => pendingManagersRaw.map(m => ({
    ...m,
    id: m._id,
    type: 'manager',
  })), [pendingManagersRaw]);

  const pendingBranches = useMemo(() => pendingBranchesRaw.map(b => ({
    ...b,
    id: b._id,
    type: 'branch',
    branch_name: b.name,
    pharmacy_name: b.pharmacyName || 'Unknown Pharmacy'
  })), [pendingBranchesRaw]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleApprove = async (id, type) => {
    setApprovingId(id);
    try {
      if (type === 'manager') {
        await activateManager({ id });
      } else if (type === 'branch') {
        await approveBranch({ id });
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully`);
    } catch (err) {
      toast.error(`Failed to approve ${type}`);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id, type) => {
    setRejectingId(id);
    try {
      if (type === 'branch') {
        await rejectBranch({ id });
      } else if (type === 'manager') {
        await deactivateManager({ id });
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} rejected`);
    } catch (err) {
      toast.error(`Failed to reject ${type}`);
    } finally {
      setRejectingId(null);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading approvals...</p>
        </div>
      </div>
    );
  }

  const totalPending = pendingManagers.length + pendingBranches.length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Pending Approvals
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Review and authorize new registration requests.
            {totalPending > 0 && (
              <span className="ml-2 text-muted-foreground/60">
                {totalPending} request{totalPending !== 1 ? 's' : ''} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {totalPending > 0 && (
            <Badge variant="medical-pending" className="text-[11px] px-3 py-1.5">
              {totalPending} Pending
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={() => {}} className="rounded-xl h-9 w-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {totalPending === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 admin-section-card">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-[17px] text-foreground">All caught up!</h3>
          <p className="text-[13px] text-muted-foreground mt-2 max-w-xs text-center">
            There are no pending approval requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Pending Managers Section */}
          {pendingManagers.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display text-[15px] font-semibold text-foreground">
                  Pharmacies & Owners
                  <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                    ({pendingManagers.length})
                  </span>
                </h2>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {pendingManagers.map((manager) => (
                  <ManagerRequestCard
                    key={manager.id}
                    manager={manager}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    approvingId={approvingId}
                    rejectingId={rejectingId}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Pending Branches Section */}
          {pendingBranches.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display text-[15px] font-semibold text-foreground">
                  Branch Requests
                  <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                    ({pendingBranches.length})
                  </span>
                </h2>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {pendingBranches.map((branch) => (
                  <BranchRequestCard
                    key={branch.id}
                    branch={branch}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    approvingId={approvingId}
                    rejectingId={rejectingId}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
