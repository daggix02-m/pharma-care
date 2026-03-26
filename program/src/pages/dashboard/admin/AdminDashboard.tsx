import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import gsap from 'gsap';
import {
  CheckCircle,
  XCircle,
  Store,
  Users,
  Search,
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
  Activity,
  MapPin,
  Mail,
  Megaphone,
  Building2,
  CreditCard,
  TrendingUp,
  DollarSign,
  Flag,
  AlertTriangle,
  MessageSquare,
  Phone,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AdminBroadcastDialog } from '@/components/shared/messaging';
import { DiagnosticViewModal } from '@/components/shared';
import { LandingPageManagement } from './landing-page/LandingPageManagement';

type AdminTab =
  | 'overview'
  | 'approvals'
  | 'pharmacies'
  | 'feedbacks'
  | 'audit-logs'
  | 'settings'
  | 'landing-page';

interface Pharmacy {
  _id: string;
  name: string;
  email: string;
  status: string;
  address?: string;
  subscription_tier?: string;
  created_at?: string;
}

interface Branch {
  _id: string;
  name: string;
  address?: string;
  status: string;
  pharmacyId?: string;
}

interface Manager {
  _id: string;
  id?: string;
  user_id?: string;
  full_name: string;
  email: string;
  status: string;
  is_active?: boolean;
  branch_name?: string;
  location?: string;
  branchId?: string;
}

export function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as AdminTab) || 'overview';
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [diagnosticDialogOpen, setDiagnosticDialogOpen] = useState(false);

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
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-display font-bold tracking-tight text-foreground'>
            Platform Admin
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Global management and system configuration
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='h-9 rounded-lg gap-2 text-[13px]'>
            <Activity className='w-4 h-4 text-primary' />
            System Status
          </Button>
          <Button
            onClick={() => setDiagnosticDialogOpen(true)}
            size='sm'
            className='h-9 rounded-lg gap-2 text-[13px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
          >
            <Activity className='w-4 h-4' />
            Diagnostic Session
          </Button>
          <Button
            onClick={() => setBroadcastDialogOpen(true)}
            size='sm'
            className='h-9 rounded-lg gap-2 text-[13px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
          >
            <Megaphone className='w-4 h-4' />
            Broadcast
          </Button>
        </div>
      </div>

      <AdminBroadcastDialog open={broadcastDialogOpen} onOpenChange={setBroadcastDialogOpen} />
      <DiagnosticViewModal open={diagnosticDialogOpen} onOpenChange={setDiagnosticDialogOpen} />

      <Tabs value={activeTab} className='w-full'>
        <div ref={contentRef} className='outline-none focus:outline-none'>
          <TabsContent value='overview' className='mt-0 focus:outline-none'>
            <OverviewSection />
          </TabsContent>
          <TabsContent value='approvals' className='mt-0 focus:outline-none'>
            <ApprovalsSection />
          </TabsContent>
          <TabsContent value='pharmacies' className='mt-0 focus:outline-none'>
            <PharmaciesSection />
          </TabsContent>
          <TabsContent value='feedbacks' className='mt-0 focus:outline-none'>
            <FeedbacksSection />
          </TabsContent>
          <TabsContent value='audit-logs' className='mt-0 focus:outline-none'>
            <AuditLogsSection />
          </TabsContent>
          <TabsContent value='settings' className='mt-0 focus:outline-none'>
            <SettingsSection />
          </TabsContent>
          <TabsContent value='landing-page' className='mt-0 focus:outline-none'>
            <LandingPageManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function OverviewSection() {
  const pharmacies = useQuery(api.admin.queries.getPharmacies);
  const branches = useQuery(api.admin.queries.getBranches);
  const managers = useQuery(api.admin.queries.getAllManagers);
  const subscriptionPlans = useQuery(api.admin.queries.getSubscriptionPlans);
  const subscriptionAnalytics = useQuery(api.admin.queries.getSubscriptionAnalytics);
  const flaggedAccounts = useQuery(api.admin.queries.getFlaggedAccounts);
  const pendingAppeals = useQuery(api.admin.queries.getPendingAppeals);
  const aiEscalations = useQuery(api.ai.queries.getEscalationStats);

  const isLoading =
    pharmacies === undefined ||
    branches === undefined ||
    managers === undefined ||
    subscriptionAnalytics === undefined ||
    subscriptionPlans === undefined ||
    flaggedAccounts === undefined ||
    pendingAppeals === undefined ||
    aiEscalations === undefined;

  const stats = useMemo(() => {
    if (isLoading)
      return {
        totalPharmacies: 0,
        activePharmacies: 0,
        pendingPharmacies: 0,
        totalBranches: 0,
        activeBranches: 0,
        totalManagers: 0,
        activeManagers: 0,
        totalPlans: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        flaggedCount: 0,
        pendingAppealsCount: 0,
        aiEscalationsToday: 0,
        aiEscalationsPending: 0,
      };

    return {
      totalPharmacies: pharmacies?.length || 0,
      activePharmacies: (pharmacies || []).filter(
        (p: Pharmacy) => p.status === 'active' || p.status === 'approved'
      ).length,
      pendingPharmacies: (pharmacies || []).filter((p: Pharmacy) => p.status === 'pending').length,
      totalBranches: branches?.length || 0,
      activeBranches: (branches || []).filter((b: Branch) => b.status === 'active').length,
      totalManagers: managers?.length || 0,
      activeManagers: (managers || []).filter(
        (m: Manager) => m.is_active || m.status === 'activated'
      ).length,
      totalPlans: subscriptionPlans?.length || 0,
      monthlyRevenue: subscriptionAnalytics?.monthlyRevenue || 0,
      activeSubscriptions: (pharmacies || []).filter(
        (p: Pharmacy) => p.status === 'active' || p.status === 'approved'
      ).length,
      flaggedCount: flaggedAccounts?.length || 0,
      pendingAppealsCount: pendingAppeals?.totalPending || 0,
      aiEscalationsToday: aiEscalations?.today || 0,
      aiEscalationsPending: aiEscalations?.pending || 0,
    };
  }, [
    pharmacies,
    branches,
    managers,
    subscriptionPlans,
    subscriptionAnalytics,
    isLoading,
    flaggedAccounts,
    pendingAppeals,
    aiEscalations,
  ]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-primary/40' />
          <p className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
            Synchronizing Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Total Pharmacies'
          value={stats.totalPharmacies}
          change={stats.activePharmacies}
          changeLabel='Active'
          icon={Building2}
          color='text-primary'
        />
        <MetricCard
          title='Total Branches'
          value={stats.totalBranches}
          change={stats.activeBranches}
          changeLabel='Active'
          icon={Store}
          color='text-blue-600'
        />
        <MetricCard
          title='Managers'
          value={stats.totalManagers}
          change={stats.activeManagers}
          changeLabel='Active'
          icon={Users}
          color='text-primary'
        />
        <MetricCard
          title='Monthly Revenue'
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change={stats.activeSubscriptions}
          changeLabel='Active Subscriptions'
          icon={DollarSign}
          color='text-primary'
        />
      </div>

      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
        {/* v4.0: Flagged Accounts Widget */}
        <Card className='minimal-card border-l-4 border-l-amber-500'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
              <Flag className='w-4 h-4 text-amber-600' />
              Flagged Accounts
              {stats.flaggedCount > 0 && (
                <Badge variant='destructive' className='ml-2'>
                  {stats.flaggedCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.flaggedCount > 0 ? (
              <div className='space-y-2'>
                {flaggedAccounts?.slice(0, 3).map((account: any) => (
                  <div
                    key={account._id}
                    className='flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-amber-300 transition-colors bg-amber-50/30'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center'>
                        <Users className='w-4 h-4 text-amber-600' />
                      </div>
                      <div>
                        <p className='font-semibold text-[14px]'>{account.full_name}</p>
                        <p className='text-[12px] text-muted-foreground'>{account.pharmacyName}</p>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className='text-[10px] bg-amber-100 text-amber-800 border-amber-300'
                    >
                      Flagged
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <Flag className='w-8 h-8 mx-auto mb-2 opacity-30' />
                <p className='text-sm'>No flagged accounts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* v4.0: Pending Appeals Widget */}
        <Card className='minimal-card border-l-4 border-l-blue-500'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
              <AlertTriangle className='w-4 h-4 text-blue-600' />
              Pending Appeals
              {stats.pendingAppealsCount > 0 && (
                <Badge variant='default' className='ml-2'>
                  {stats.pendingAppealsCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.pendingAppealsCount > 0 ? (
              <div className='space-y-2'>
                {pendingAppeals?.managerFlagAppeals?.slice(0, 2).map((appeal: any) => (
                  <div
                    key={appeal.id}
                    className='flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-blue-300 transition-colors bg-blue-50/30'
                  >
                    <div>
                      <p className='font-semibold text-[14px]'>Manager Flag Appeal</p>
                      <p className='text-[12px] text-muted-foreground'>
                        From: {appeal.ownerName || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant='outline' className='text-[10px]'>
                      Pending Review
                    </Badge>
                  </div>
                ))}
                {pendingAppeals?.adminActionAppeals?.slice(0, 2).map((appeal: any) => (
                  <div
                    key={appeal.id}
                    className='flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-blue-300 transition-colors bg-blue-50/30'
                  >
                    <div>
                      <p className='font-semibold text-[14px]'>Admin Action Appeal</p>
                      <p className='text-[12px] text-muted-foreground'>
                        From: {appeal.ownerName || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant='outline' className='text-[10px]'>
                      Pending Review
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <AlertTriangle className='w-8 h-8 mx-auto mb-2 opacity-30' />
                <p className='text-sm'>No pending appeals</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* v4.0: AI Escalations Widget */}
        <Card className='minimal-card border-l-4 border-l-purple-500'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
              <MessageSquare className='w-4 h-4 text-purple-600' />
              AI Assistant Escalations
              {stats.aiEscalationsPending > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {stats.aiEscalationsPending}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between p-4 rounded-xl border border-border/40 bg-purple-50/30'>
                <div>
                  <p className='font-semibold text-[14px]'>Today's Escalations</p>
                  <p className='text-[12px] text-muted-foreground'>
                    {stats.aiEscalationsToday} new today
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-purple-600'>{stats.aiEscalationsPending}</p>
                  <p className='text-[10px] text-muted-foreground'>pending</p>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-2 mt-3'>
                <div className='text-center p-2 rounded-lg bg-muted/30'>
                  <Phone className='w-4 h-4 mx-auto mb-1 text-emerald-600' />
                  <p className='text-[10px] text-muted-foreground'>Phone</p>
                </div>
                <div className='text-center p-2 rounded-lg bg-muted/30'>
                  <Mail className='w-4 h-4 mx-auto mb-1 text-blue-600' />
                  <p className='text-[10px] text-muted-foreground'>Email</p>
                </div>
                <div className='text-center p-2 rounded-lg bg-muted/30'>
                  <AlertTriangle className='w-4 h-4 mx-auto mb-1 text-amber-600' />
                  <p className='text-[10px] text-muted-foreground'>Complaints</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing: Subscription Plans */}
        <Card className='minimal-card'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
              <CreditCard className='w-4 h-4' />
              Subscription Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {subscriptionPlans?.slice(0, 4).map((plan: any) => (
                <div
                  key={plan._id}
                  className='flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-border transition-colors'
                >
                  <div>
                    <p className='font-semibold text-[14px]'>{plan.name}</p>
                    <p className='text-[12px] text-muted-foreground'>
                      ${plan.price} / {plan.currency}
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2',
                      plan.isActive
                        ? 'bg-primary/5 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Existing: System Activity */}
        <Card className='minimal-card'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
              <TrendingUp className='w-4 h-4' />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center gap-4 p-4 rounded-xl border border-border/40'>
                <div className='w-9 h-9 rounded-lg bg-secondary flex items-center justify-center'>
                  <Plus className='w-4.5 h-4.5 text-primary' />
                </div>
                <div className='flex-1'>
                  <p className='text-[13px] font-medium'>New pharmacy registration</p>
                  <p className='text-[11px] text-muted-foreground uppercase tracking-tight'>
                    Just now
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-4 p-4 rounded-xl border border-border/40'>
                <div className='w-9 h-9 rounded-lg bg-secondary flex items-center justify-center'>
                  <ShieldCheck className='w-4.5 h-4.5 text-primary' />
                </div>
                <div className='flex-1'>
                  <p className='text-[13px] font-medium'>Branch approval processed</p>
                  <p className='text-[11px] text-muted-foreground uppercase tracking-tight'>
                    14 minutes ago
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-4 p-4 rounded-xl border border-border/40'>
                <div className='w-9 h-9 rounded-lg bg-secondary flex items-center justify-center'>
                  <Users className='w-4.5 h-4.5 text-primary' />
                </div>
                <div className='flex-1'>
                  <p className='text-[13px] font-medium'>Manager account updated</p>
                  <p className='text-[11px] text-muted-foreground uppercase tracking-tight'>
                    2 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ApprovalsSection() {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pendingManagers = useQuery(api.admin.queries.getPendingManagers);
  const pendingBranches = useQuery(api.admin.queries.getPendingBranches);

  const approveBranch = useMutation(api.admin.mutations.approveBranch);
  const rejectBranch = useMutation(api.admin.mutations.rejectBranch);

  const isLoading = pendingManagers === undefined || pendingBranches === undefined;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary/40' />
      </div>
    );
  }

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      {pendingManagers.length > 0 && (
        <Card className='minimal-card border-primary/10'>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>Manager Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='divide-y divide-border/40'>
              {pendingManagers.map((manager: any) => (
                <div
                  key={manager._id}
                  className='flex items-center justify-between py-4 first:pt-0 last:pb-0'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary'>
                      {manager.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className='font-semibold text-[14px]'>{manager.full_name}</p>
                      <p className='text-[12px] text-muted-foreground'>{manager.email}</p>
                    </div>
                  </div>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => toast.info('Review pharmacy registration first')}
                    className='rounded-lg h-8 text-[12px]'
                  >
                    Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='minimal-card'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-base font-semibold'>Branch Approvals</CardTitle>
          <Badge variant='secondary' className='rounded-full px-2.5'>
            {pendingBranches.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {pendingBranches.length === 0 ? (
            <div className='text-center py-12'>
              <Store className='w-8 h-8 text-muted-foreground/20 mx-auto mb-3' />
              <p className='text-sm text-muted-foreground'>All clear. No pending branches.</p>
            </div>
          ) : (
            <div className='grid gap-4'>
              {pendingBranches.map((branch: any) => (
                <div
                  key={branch._id}
                  className='flex items-center justify-between p-5 rounded-2xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-background border border-border/60 flex items-center justify-center'>
                      <Store className='w-6 h-6 text-primary' />
                    </div>
                    <div>
                      <p className='font-bold text-[15px]'>{branch.name}</p>
                      <p className='text-[12px] text-muted-foreground flex items-center gap-1.5'>
                        <MapPin className='w-3.5 h-3.5' /> {branch.address || 'No address provided'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full h-10 w-10 text-destructive hover:bg-destructive/5'
                      onClick={async () => {
                        setRejectingId(branch._id);
                        try {
                          await rejectBranch({ id: branch._id });
                          toast.success('Branch rejected');
                        } catch (err) {
                          toast.error('Failed to reject branch');
                        } finally {
                          setRejectingId(null);
                        }
                      }}
                      disabled={rejectingId === branch._id}
                    >
                      {rejectingId === branch._id ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <XCircle className='w-5 h-5' />
                      )}
                    </Button>
                    <Button
                      size='sm'
                      className='rounded-xl h-10 px-5 gap-2'
                      onClick={async () => {
                        setApprovingId(branch._id);
                        try {
                          await approveBranch({ id: branch._id });
                          toast.success('Branch approved');
                        } catch (err) {
                          toast.error('Failed to approve branch');
                        } finally {
                          setApprovingId(null);
                        }
                      }}
                      disabled={approvingId === branch._id}
                    >
                      {approvingId === branch._id ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <CheckCircle className='w-4 h-4' />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PharmaciesSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedPharmacyId, setExpandedPharmacyId] = useState<string | null>(null);
  const navigate = useNavigate();

  const pharmacies = useQuery(api.admin.queries.getPharmacies);
  const branches = useQuery(api.admin.queries.getBranches);
  const managers = useQuery(api.admin.queries.getAllManagers);
  const deletePharmacy = useMutation(api.admin.mutations.deletePharmacy);

  const isLoading = pharmacies === undefined || branches === undefined || managers === undefined;

  const pharmacyData = useMemo(() => {
    const data: Record<
      string,
      {
        branches: Branch[];
        managers: Manager[];
        branchCount: number;
        managerCount: number;
      }
    > = {};
    if (branches && managers && pharmacies) {
      pharmacies.forEach((p: Pharmacy) => {
        const pharmacyBranches = branches.filter((b: Branch) => b.pharmacyId === p._id);
        const branchIds = pharmacyBranches.map((b: Branch) => b._id);
        const pharmacyManagers = managers.filter(
          (m: Manager) => m.branchId && branchIds.includes(m.branchId)
        );

        data[p._id] = {
          branches: pharmacyBranches,
          managers: pharmacyManagers,
          branchCount: pharmacyBranches.length,
          managerCount: pharmacyManagers.length,
        };
      });
    }
    return data;
  }, [pharmacies, branches, managers]);

  const filteredPharmacies = useMemo(() => {
    if (!pharmacies) return [];
    return pharmacies.filter((p: Pharmacy) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [pharmacies, searchQuery, filter]);

  const toggleExpand = (pharmacyId: string) => {
    setExpandedPharmacyId(expandedPharmacyId === pharmacyId ? null : pharmacyId);
  };

  if (isLoading)
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='w-8 h-8 animate-spin text-primary/40' />
      </div>
    );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60' />
          <Input
            placeholder='Search pharmacies by name or email...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 h-11 rounded-xl'
          />
        </div>
        <div className='flex items-center gap-2'>
          {(['all', 'active', 'pending'] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'secondary'}
              size='sm'
              onClick={() => setFilter(s)}
              className='capitalize rounded-lg h-9 text-[12px] font-semibold'
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className='space-y-4'>
        {filteredPharmacies.map((pharmacy: Pharmacy) => {
          const data = pharmacyData[pharmacy._id] || {
            branches: [],
            managers: [],
            branchCount: 0,
            managerCount: 0,
          };
          const isExpanded = expandedPharmacyId === pharmacy._id;

          return (
            <Card
              key={pharmacy._id}
              className={cn(
                'minimal-card overflow-hidden transition-all duration-300',
                isExpanded && 'border-primary/30'
              )}
            >
              {/* Header - Always visible */}
              <CardContent className='p-5'>
                <div
                  className='flex items-start gap-4 cursor-pointer'
                  onClick={() => toggleExpand(pharmacy._id)}
                >
                  <div className='w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0'>
                    <Building2 className='w-7 h-7' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <h3 className='font-bold text-base truncate'>{pharmacy.name}</h3>
                        <p className='text-[12px] text-muted-foreground mt-0.5'>{pharmacy.email}</p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <Badge
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                            pharmacy.status === 'active' || pharmacy.status === 'approved'
                              ? 'bg-primary/5 text-primary border-primary/20'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {pharmacy.status}
                        </Badge>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 shrink-0'
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(pharmacy._id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className='w-4 h-4 text-muted-foreground' />
                          ) : (
                            <ChevronDown className='w-4 h-4 text-muted-foreground' />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className='flex items-center gap-4 mt-3 text-[12px] text-muted-foreground'>
                      <div className='flex items-center gap-1.5'>
                        <Store className='w-3.5 h-3.5' />
                        <span>{data.branchCount} branches</span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <Users className='w-3.5 h-3.5' />
                        <span>{data.managerCount} managers</span>
                      </div>
                      {pharmacy.subscription_tier && (
                        <Badge variant='outline' className='text-[10px] font-medium'>
                          {pharmacy.subscription_tier}
                        </Badge>
                      )}
                    </div>

                    {pharmacy.address && (
                      <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2'>
                        <MapPin className='w-3 h-3' />
                        <span className='truncate max-w-[300px]'>{pharmacy.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/40'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 text-[11px] font-medium'
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/pharmacies/${pharmacy._id}`);
                    }}
                  >
                    <ExternalLink className='w-3 h-3 mr-1.5' />
                    Full Details
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 rounded-lg text-destructive'
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this pharmacy?')) deletePharmacy({ id: pharmacy._id });
                    }}
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                  </Button>
                </div>
              </CardContent>

              {/* Expanded Content */}
              {isExpanded && (
                <div className='px-5 pb-5 border-t border-border/40 bg-muted/20'>
                  <div className='pt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Branches List */}
                    <div>
                      <h4 className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2'>
                        <Store className='w-3.5 h-3.5' />
                        Branches ({data.branchCount})
                      </h4>
                      {data.branches.length > 0 ? (
                        <div className='space-y-2'>
                          {data.branches.slice(0, 3).map((branch: Branch) => (
                            <div
                              key={branch._id}
                              className='flex items-center gap-2 text-[12px] p-2 bg-background rounded-lg border border-border/40'
                            >
                              <div className='w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0'>
                                <Store className='w-3 h-3 text-primary' />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium truncate'>{branch.name}</p>
                                {branch.address && (
                                  <p className='text-[10px] text-muted-foreground truncate'>
                                    {branch.address}
                                  </p>
                                )}
                              </div>
                              <Badge variant='outline' className='text-[9px] shrink-0'>
                                {branch.status}
                              </Badge>
                            </div>
                          ))}
                          {data.branches.length > 3 && (
                            <p className='text-[10px] text-muted-foreground text-center'>
                              +{data.branches.length - 3} more branches
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className='text-[12px] text-muted-foreground italic'>No branches</p>
                      )}
                    </div>

                    {/* Managers List */}
                    <div>
                      <h4 className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2'>
                        <Users className='w-3.5 h-3.5' />
                        Managers ({data.managerCount})
                      </h4>
                      {data.managers.length > 0 ? (
                        <div className='space-y-2'>
                          {data.managers.slice(0, 3).map((manager: Manager) => (
                            <div
                              key={manager._id}
                              className='flex items-center gap-2 text-[12px] p-2 bg-background rounded-lg border border-border/40'
                            >
                              <div className='w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[10px] font-bold text-primary'>
                                {manager.full_name?.charAt(0)}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium truncate'>{manager.full_name}</p>
                                <p className='text-[10px] text-muted-foreground truncate'>
                                  {manager.email}
                                </p>
                              </div>
                              <Badge variant='outline' className='text-[9px] shrink-0'>
                                {manager.status}
                              </Badge>
                            </div>
                          ))}
                          {data.managers.length > 3 && (
                            <p className='text-[10px] text-muted-foreground text-center'>
                              +{data.managers.length - 3} more managers
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className='text-[12px] text-muted-foreground italic'>No managers</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function FeedbacksSection() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'trash'>('inbox');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const messages = useQuery(
    api.admin.feedbacks.getMessages,
    activeTab === 'inbox' ? { status: statusFilter, searchQuery } : 'skip'
  );
  const trashedMessages = useQuery(
    api.admin.feedbacks.getTrashedMessages,
    activeTab === 'trash' ? {} : 'skip'
  );
  const unreadCount = useQuery(api.admin.feedbacks.getUnreadCount);
  const markAsRead = useMutation(api.admin.feedbacks.markAsRead);
  const markAsUnread = useMutation(api.admin.feedbacks.markAsUnread);
  const replyToMessage = useMutation(api.admin.feedbacks.replyToMessage);
  const moveToTrash = useMutation(api.admin.feedbacks.moveToTrash);
  const restoreFromTrash = useMutation(api.admin.feedbacks.restoreFromTrash);
  const permanentDelete = useMutation(api.admin.feedbacks.permanentDelete);
  const emptyTrash = useMutation(api.admin.feedbacks.emptyTrash);

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsReplying(true);
    try {
      await replyToMessage({
        messageId: selectedMessage._id,
        reply: replyText,
      });
      toast.success('Reply sent successfully');
      setReplyText('');
      setSelectedMessage(null);
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Move this message to trash?')) return;
    try {
      await moveToTrash({ messageId });
      toast.success('Message moved to trash');
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleRestore = async (trashId: string) => {
    try {
      await restoreFromTrash({ trashId });
      toast.success('Message restored');
    } catch (error) {
      toast.error('Failed to restore message');
    }
  };

  const handlePermanentDelete = async (trashId: string) => {
    if (!confirm('Permanently delete this message? This cannot be undone.')) return;
    try {
      await permanentDelete({ trashId });
      toast.success('Message permanently deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Empty trash? All messages will be permanently deleted.')) return;
    try {
      const result = await emptyTrash();
      toast.success(`Trash emptied. ${result.deletedCount} messages deleted.`);
    } catch (error) {
      toast.error('Failed to empty trash');
    }
  };

  const displayMessages = activeTab === 'inbox' ? messages?.messages : trashedMessages?.messages;
  const isLoading = activeTab === 'inbox' ? messages === undefined : trashedMessages === undefined;

  if (isLoading) {
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='w-8 h-8 animate-spin text-primary/40' />
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Contact Messages</h2>
          <p className='text-muted-foreground text-sm mt-1'>
            Manage messages from the contact form
            {unreadCount ? (
              <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary'>
                {unreadCount} unread
              </span>
            ) : null}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={activeTab === 'inbox' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveTab('inbox')}
            className='rounded-lg'
          >
            Inbox
          </Button>
          <Button
            variant={activeTab === 'trash' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveTab('trash')}
            className='rounded-lg'
          >
            Trash
          </Button>
        </div>
      </div>

      {/* Filters */}
      {activeTab === 'inbox' && (
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60' />
            <Input
              placeholder='Search by name or email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 h-10 rounded-xl'
            />
          </div>
          <div className='flex items-center gap-2'>
            {(['all', 'unread', 'read', 'replied'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'secondary'}
                size='sm'
                onClick={() => setStatusFilter(status)}
                className='capitalize rounded-lg text-[12px] font-semibold'
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trash' && displayMessages && displayMessages.length > 0 && (
        <div className='flex justify-end'>
          <Button variant='destructive' size='sm' onClick={handleEmptyTrash} className='rounded-lg'>
            <Trash2 className='w-4 h-4 mr-2' />
            Empty Trash
          </Button>
        </div>
      )}

      {/* Messages List */}
      <div className='space-y-3'>
        {!displayMessages || displayMessages.length === 0 ? (
          <div className='text-center py-16 border border-dashed border-border rounded-2xl'>
            <Mail className='w-12 h-12 text-muted-foreground/30 mx-auto mb-4' />
            <p className='text-muted-foreground'>
              {activeTab === 'inbox' ? 'No messages' : 'Trash is empty'}
            </p>
          </div>
        ) : (
          displayMessages.map((message: any) => (
            <Card
              key={message._id}
              className={cn(
                'minimal-card cursor-pointer transition-all hover:border-primary/30',
                message.status === 'unread' && 'border-l-4 border-l-primary bg-primary/[0.02]'
              )}
              onClick={() => {
                setSelectedMessage(message);
                if (message.status === 'unread' && activeTab === 'inbox') {
                  markAsRead({ messageId: message._id });
                }
              }}
            >
              <CardContent className='p-4'>
                <div className='flex items-start gap-4'>
                  <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold text-primary'>
                    {message.firstName.charAt(0)}
                    {message.lastName.charAt(0)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <h4 className='font-semibold text-sm'>
                          {message.firstName} {message.lastName}
                        </h4>
                        <span className='text-xs text-muted-foreground'>{message.email}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-muted-foreground'>
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                        {activeTab === 'inbox' ? (
                          <>
                            <Badge
                              variant={message.status === 'replied' ? 'default' : 'secondary'}
                              className='text-[10px]'
                            >
                              {message.status}
                            </Badge>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-destructive'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(message._id);
                              }}
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(message._id);
                              }}
                            >
                              Restore
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-destructive'
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePermanentDelete(message._id);
                              }}
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                      {message.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'
          onClick={() => setSelectedMessage(null)}
        >
          <Card
            className='w-full max-w-2xl max-h-[80vh] overflow-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className='border-b border-border/40'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg'>
                    {selectedMessage.firstName} {selectedMessage.lastName}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>{selectedMessage.email}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => setSelectedMessage(null)}
                  >
                    <XCircle className='w-5 h-5' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-4'>
              <div className='bg-muted/30 p-4 rounded-xl'>
                <p className='text-sm whitespace-pre-wrap'>{selectedMessage.message}</p>
              </div>

              {selectedMessage.adminReply && (
                <div className='bg-primary/5 border border-primary/20 p-4 rounded-xl'>
                  <p className='text-xs font-semibold text-primary mb-2'>Your Reply:</p>
                  <p className='text-sm whitespace-pre-wrap'>{selectedMessage.adminReply}</p>
                  {selectedMessage.repliedAt && (
                    <p className='text-xs text-muted-foreground mt-2'>
                      Sent on {new Date(selectedMessage.repliedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'inbox' && !selectedMessage.adminReply && (
                <div className='space-y-3 pt-4 border-t border-border/40'>
                  <label className='text-sm font-medium'>Reply to Message</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder='Type your reply here...'
                    className='w-full min-h-[120px] p-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20'
                    maxLength={2000}
                  />
                  <div className='flex justify-end gap-2'>
                    <Button variant='outline' onClick={() => setSelectedMessage(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleReply} disabled={!replyText.trim() || isReplying}>
                      {isReplying ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          Sending...
                        </>
                      ) : (
                        'Send Reply'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function AuditLogsSection() {
  const logs = useQuery(api.admin.queries.getAuditLogs);
  if (!logs)
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='w-8 h-8 animate-spin text-primary/40' />
      </div>
    );

  return (
    <div className='max-w-3xl mx-auto space-y-4'>
      {logs.slice(0, 15).map((log: any, idx: number) => (
        <div
          key={log._id || idx}
          className='flex gap-4 p-4 rounded-2xl border border-border/40 bg-card hover:border-border transition-colors'
        >
          <div className='w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0'>
            <Activity className='w-4 h-4 text-primary' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <p className='font-semibold text-[14px]'>{log.action}</p>
              <span className='text-[11px] text-muted-foreground font-mono'>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className='text-[12px] text-muted-foreground line-clamp-2'>
              {log.details || 'System event recorded'}
            </p>
            <div className='mt-2 flex items-center gap-1.5'>
              <div className='w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary'>
                {log.user_name?.charAt(0)}
              </div>
              <span className='text-[11px] font-medium text-muted-foreground'>{log.user_name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsSection() {
  const settings = useQuery(api.admin.siteSettings.getSiteSettingsAdmin);
  const updateSettings = useMutation(api.admin.siteSettings.updateSiteSettings);
  const toggleTestMode = useMutation(api.admin.siteSettings.toggleTestMode);
  const sendTestEmail = useMutation(api.admin.siteSettings.sendTestEmail);

  const [formData, setFormData] = useState({
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    resendApiKey: '',
    testMode: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        contactEmail: settings.contactEmail || 'daggi.x02@gmail.com',
        contactPhone: settings.contactPhone || '',
        contactAddress: settings.contactAddress || '',
        resendApiKey: '', // Never show the actual API key
        testMode: settings.testMode ?? true,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!formData.contactEmail) {
      toast.error('Contact email is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateSettings({
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactAddress: formData.contactAddress,
        resendApiKey: formData.resendApiKey,
        testMode: formData.testMode,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTestMode = async () => {
    const newTestMode = !formData.testMode;
    try {
      await toggleTestMode({ testMode: newTestMode });
      setFormData({ ...formData, testMode: newTestMode });
      toast.success(newTestMode ? 'Test mode enabled' : 'Live mode enabled');
    } catch (error) {
      toast.error('Failed to toggle test mode');
    }
  };

  const handleSendTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      await sendTestEmail({ to: formData.contactEmail });
      toast.success('Test email sent! Check your console in test mode.');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setIsTestingEmail(false);
    }
  };

  if (!settings) {
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='w-8 h-8 animate-spin text-primary/40' />
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto grid gap-6'>
      {/* Test Mode Banner */}
      {formData.testMode && (
        <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0'>
            <span className='text-xl'>⚠️</span>
          </div>
          <div className='flex-1'>
            <p className='font-semibold text-amber-800'>Test Mode Active</p>
            <p className='text-sm text-amber-700'>
              Emails will be logged to console instead of being sent. Toggle below to enable live
              mode.
            </p>
          </div>
        </div>
      )}

      <Card className='minimal-card'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>Email Configuration</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-[13px] font-medium text-muted-foreground'>Contact Email *</label>
            <Input
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder='daggi.x02@gmail.com'
              className='rounded-xl h-11'
            />
            <p className='text-xs text-muted-foreground'>
              This email will receive contact form submissions
            </p>
          </div>

          <div className='space-y-2'>
            <label className='text-[13px] font-medium text-muted-foreground'>Resend API Key</label>
            <Input
              type='password'
              value={formData.resendApiKey}
              onChange={(e) => setFormData({ ...formData, resendApiKey: e.target.value })}
              placeholder='re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
              className='rounded-xl h-11'
            />
            <p className='text-xs text-muted-foreground'>
              Get your API key from resend.com. Leave empty to keep existing key.
            </p>
          </div>

          <div className='pt-2 border-t border-border/40'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <p className='font-medium text-sm'>Test Mode</p>
                <p className='text-xs text-muted-foreground'>
                  {formData.testMode
                    ? 'Emails logged to console only'
                    : 'Emails sent to real recipients'}
                </p>
              </div>
              <Button
                variant={formData.testMode ? 'secondary' : 'default'}
                size='sm'
                onClick={handleToggleTestMode}
                className={cn(
                  'rounded-full px-4',
                  !formData.testMode && 'bg-green-600 hover:bg-green-700'
                )}
              >
                {formData.testMode ? 'Enable Live Mode' : 'Enable Test Mode'}
              </Button>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={handleSendTestEmail}
              disabled={isTestingEmail}
              className='w-full rounded-xl'
            >
              {isTestingEmail ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Sending Test...
                </>
              ) : (
                'Send Test Email'
              )}
            </Button>
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className='w-full h-11 rounded-xl font-bold tracking-tight mt-4'
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className='minimal-card'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-[13px] font-medium text-muted-foreground'>Contact Phone</label>
            <Input
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder='+1 (555) PHARMA-CARE'
              className='rounded-xl h-11'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-[13px] font-medium text-muted-foreground'>Contact Address</label>
            <Input
              value={formData.contactAddress}
              onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
              placeholder='123 Healthcare Ave, Medical District, 10001'
              className='rounded-xl h-11'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change: _change,
  changeLabel,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: string | number;
  changeLabel: string;
  icon: any;
  color: string;
}) {
  return (
    <Card className='minimal-card p-6 flex flex-col justify-between'>
      <div className='flex items-center justify-between mb-8'>
        <div
          className={cn(
            'w-10 h-10 rounded-xl bg-secondary flex items-center justify-center',
            color
          )}
        >
          <Icon className='w-5 h-5' />
        </div>
        <span className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
          {changeLabel}
        </span>
      </div>
      <div>
        <h3 className='text-3xl font-display font-bold tracking-tighter mb-1'>{value}</h3>
        <p className='text-[12px] font-medium text-muted-foreground uppercase tracking-wider'>
          {title}
        </p>
      </div>
    </Card>
  );
}
