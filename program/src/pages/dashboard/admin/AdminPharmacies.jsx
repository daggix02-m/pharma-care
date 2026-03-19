import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  MapPin,
  Search,
  Loader2,
  Trash2,
  RefreshCw,
  Plus,
  Store,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronRight,
  Hash,
  Calendar,
  Shield,
  Mail,
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
import { Badge } from '@/components/ui/badge';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusVariant = (status) => {
  if (status === 'active' || status === 'approved') return 'medical-active';
  if (status === 'pending') return 'medical-pending';
  if (status === 'rejected') return 'medical-rejected';
  return 'medical-inactive';
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(String(text));
  toast.success(`Branch ID "${text}" copied to clipboard`);
};

// ─── Manager Info Row ───────────────────────────────────────────────────────
const ManagerInfoRow = ({ manager }) => (
  <div className="flex items-center gap-3 py-2.5 px-4 bg-violet-50/50 dark:bg-violet-900/8 rounded-xl border border-violet-100/60 dark:border-violet-900/20 transition-colors hover:bg-violet-50 dark:hover:bg-violet-900/15">
    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm flex-shrink-0">
      {manager.full_name?.charAt(0) || 'M'}
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-[13px] text-foreground truncate">
        {manager.full_name}
      </p>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
        <Mail className="w-3 h-3 flex-shrink-0" /> {manager.email}
      </p>
    </div>
    <Badge variant={manager.is_active ? 'medical-active' : 'medical-inactive'} className="text-[10px]">
      {manager.is_active ? 'Active' : 'Inactive'}
    </Badge>
  </div>
);

// ─── Branch Row ─────────────────────────────────────────────────────────────
const BranchRow = ({ branch }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 bg-slate-50/60 dark:bg-slate-800/20 rounded-xl border border-slate-100/80 dark:border-slate-800/60 transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        <Store className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[13px] text-foreground truncate">
          {branch.branch_name}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {branch.location || 'N/A'}
          </span>
          {branch.created_by_name && (
            <span className="flex items-center gap-1">
              <UserRound className="w-3 h-3" /> {branch.created_by_name}
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <Badge variant={statusVariant(branch.status)} className="text-[10px]">
        {branch.status}
      </Badge>
      <button
        onClick={() => copyToClipboard(branch.branch_id)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/6 dark:bg-primary/10 text-primary text-[11px] font-semibold border border-primary/15 dark:border-primary/20 hover:bg-primary/12 dark:hover:bg-primary/18 transition-colors cursor-pointer"
        title="Click to copy Branch ID"
      >
        <Hash className="w-3 h-3" />
        {branch.branch_id}
        <Copy className="w-3 h-3 opacity-50" />
      </button>
    </div>
  </div>
);

// ─── Pharmacy Card ──────────────────────────────────────────────────────────
const PharmacyCard = ({ pharmacy, branches, managers, onDelete, onExpand, isExpanded }) => {
  const pharmacyBranches = branches.filter(b => b.pharmacy_id === pharmacy.id);
  const branchIds = pharmacyBranches.map(b => b.branch_id);
  const pharmacyManagers = managers.filter(m => branchIds.includes(m.branch_id));

  return (
    <div className={`admin-section-card transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/15' : ''}`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="font-display font-bold text-lg text-foreground truncate">
                {pharmacy.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> {pharmacy.total_branches || pharmacyBranches.length} branch{(pharmacy.total_branches || pharmacyBranches.length) !== 1 ? 'es' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {pharmacyManagers.length} manager{pharmacyManagers.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(pharmacy.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              className="h-9 rounded-xl px-3.5 text-[13px] gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => onExpand(isExpanded ? null : pharmacy.id)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {isExpanded ? 'Collapse' : 'Details'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => onDelete(pharmacy)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-5 animate-fade-in">
          {/* Managers */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <UserRound className="w-3.5 h-3.5" /> Managers
            </h4>
            {pharmacyManagers.length === 0 ? (
              <div className="py-6 text-center bg-muted/30 rounded-xl border border-dashed border-border/60">
                <UserRound className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1.5" />
                <p className="text-[13px] text-muted-foreground">No managers registered yet</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {pharmacyManagers.map((manager) => (
                  <ManagerInfoRow key={manager.user_id} manager={manager} />
                ))}
              </div>
            )}
          </div>

          {/* Branches */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" /> Branches & IDs
              </h4>
              <p className="text-[11px] text-muted-foreground/60">
                Share Branch IDs with managers for registration
              </p>
            </div>
            {pharmacyBranches.length === 0 ? (
              <div className="py-6 text-center bg-muted/30 rounded-xl border border-dashed border-border/60">
                <Store className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1.5" />
                <p className="text-[13px] text-muted-foreground">No branches yet</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Created when managers register with this pharmacy</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {pharmacyBranches.map((branch) => (
                  <BranchRow key={branch.branch_id} branch={branch} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export function AdminPharmacies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, loading: false });
  const [createDialog, setCreateDialog] = useState({ open: false, loading: false });
  const [newPharmacyName, setNewPharmacyName] = useState('');

  const createPharmacyMutation = useMutation(api.admin.mutations.createPharmacy);
  const deletePharmacyMutation = useMutation(api.admin.mutations.deletePharmacy);

  const rawPharmacies = useQuery(api.admin.queries.getPharmacies) || [];
  const rawBranches = useQuery(api.admin.queries.getBranches) || [];
  const rawManagers = useQuery(api.admin.queries.getAllManagers) || [];

  const isLoading = rawPharmacies === undefined || rawBranches === undefined || rawManagers === undefined;

  const pharmacies = useMemo(() => rawPharmacies.map(p => ({
    ...p,
    id: p._id,
    name: p.name,
    total_branches: rawBranches.filter(b => b.pharmacyId === p._id).length,
  })), [rawPharmacies, rawBranches]);

  const branches = useMemo(() => rawBranches.map(b => ({
    ...b,
    id: b._id,
    branch_id: b._id, // Mapping _id to branch_id for consistency
    pharmacy_id: b.pharmacyId,
    branch_name: b.name,
  })), [rawBranches]);

  const managers = useMemo(() => rawManagers.map(m => ({
    ...m,
    id: m._id,
    user_id: m._id,
    branch_id: m.branchId,
  })), [rawManagers]);

  const filteredPharmacies = useMemo(() =>
    pharmacies.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [pharmacies, searchQuery]);

  const handleCreate = async () => {
    const name = newPharmacyName.trim();
    if (!name) {
      toast.error('Pharmacy name is required');
      return;
    }
    setCreateDialog(prev => ({ ...prev, loading: true }));
    try {
      await createPharmacyMutation({ name });
      toast.success(`Pharmacy "${name}" created successfully`);
      setCreateDialog({ open: false, loading: false });
      setNewPharmacyName('');
    } catch (err) {
      toast.error(err.message || 'Failed to create pharmacy');
      setCreateDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deletePharmacyMutation({ id: deleteDialog.item.id });
      toast.success('Pharmacy deleted successfully');
      setDeleteDialog({ open: false, item: null, loading: false });
      setExpandedId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete pharmacy');
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const hasBranches = deleteDialog.item ? (branches.filter(b => b.pharmacy_id === deleteDialog.item.id).length > 0) : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading pharmacies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Pharmacies
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage pharmacy organizations. Expand to see branches, managers, and Branch IDs.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              placeholder="Search pharmacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl h-9 text-[13px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => {}} className="rounded-xl h-9 w-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="medical"
            onClick={() => setCreateDialog({ open: true, loading: false })}
            className="rounded-xl h-9 gap-1.5 text-[13px] px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            New Pharmacy
          </Button>
        </div>
      </div>

      {/* Getting Started */}
      {pharmacies.length === 0 && (
        <div className="admin-section-card p-6 space-y-4 medical-accent-top">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-[15px]">Getting Started</h3>
              <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                When a head manager requests a new pharmacy, create it here. Once created, managers can register and branches will appear automatically with unique Branch IDs.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-12">
            {[
              { step: '1', title: 'Create Pharmacy', desc: 'Click "New Pharmacy" to add the organization' },
              { step: '2', title: 'Manager Registers', desc: 'Manager signs up with branch details, creating a Branch ID' },
              { step: '3', title: 'Approve Manager', desc: 'Activate the manager account from the Managers page' },
            ].map(s => (
              <div key={s.step} className="bg-muted/40 dark:bg-slate-800/30 rounded-xl p-3.5 border border-border/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">{s.step}</span>
                  <p className="text-[12px] font-semibold text-foreground">{s.title}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pharmacy List */}
      <div className="grid gap-4">
        {filteredPharmacies.length === 0 && pharmacies.length > 0 ? (
          <div className="py-16 text-center admin-section-card">
            <Search className="w-6 h-6 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-[13px] font-medium text-muted-foreground">No pharmacies match your search</p>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="py-16 text-center admin-section-card">
            <Building2 className="w-6 h-6 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-[13px] font-medium text-muted-foreground">No pharmacies yet. Create one to get started.</p>
          </div>
        ) : (
          filteredPharmacies.map((pharmacy) => (
            <PharmacyCard
              key={pharmacy.id}
              pharmacy={pharmacy}
              branches={branches}
              managers={managers}
              isExpanded={expandedId === pharmacy.id}
              onExpand={setExpandedId}
              onDelete={(p) => setDeleteDialog({ open: true, item: p, loading: false })}
            />
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog
        open={createDialog.open}
        onOpenChange={(open) => {
          if (!createDialog.loading) {
            setCreateDialog({ open, loading: false });
            if (!open) setNewPharmacyName('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              Create New Pharmacy
            </DialogTitle>
            <DialogDescription>
              Add a new pharmacy organization. Managers can then register and create branches under it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">
                Pharmacy Name
              </label>
              <Input
                placeholder="e.g. PharmaCare Central"
                value={newPharmacyName}
                onChange={(e) => setNewPharmacyName(e.target.value)}
                className="rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && !createDialog.loading && handleCreate()}
                autoFocus
              />
            </div>
            <div className="bg-muted/40 rounded-xl p-3 border border-border/40">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                After creation, managers can sign up and select this pharmacy. Branches and Branch IDs are generated automatically when managers register.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setCreateDialog({ open: false, loading: false }); setNewPharmacyName(''); }}
              disabled={createDialog.loading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="medical"
              onClick={handleCreate}
              disabled={createDialog.loading || !newPharmacyName.trim()}
              className="rounded-xl"
            >
              {createDialog.loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Pharmacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !deleteDialog.loading && setDeleteDialog(p => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Delete Pharmacy
            </DialogTitle>
            <DialogDescription>
              {hasBranches ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 text-[12px] space-y-2">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Cannot Delete
                  </p>
                  <p>
                    This pharmacy still has active branches. Delete all branches from the <strong>Branches</strong> page first.
                  </p>
                </div>
              ) : (
                <>This will permanently remove <strong>{deleteDialog.item?.name}</strong> and all associated data. This action cannot be undone.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, item: null, loading: false })} disabled={deleteDialog.loading} className="rounded-xl">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDialog.loading || hasBranches}
              className="rounded-xl"
            >
              {deleteDialog.loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {hasBranches ? 'Branches Exist' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
