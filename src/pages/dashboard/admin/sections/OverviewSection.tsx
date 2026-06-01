import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Building2, Store, Users, DollarSign, Loader2 } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { OperationalAlertsCard } from "./OperationalAlertsCard";
import { AIEscalationsCard } from "./AIEscalationsCard";
import { SubscriptionHealthCard } from "./SubscriptionHealthCard";
import { SystemActivityCard } from "./SystemActivityCard";
import { useAuth } from "@/contexts/AuthContext";

export function OverviewSection() {
  const { sessionToken } = useAuth();
  const navigate = useNavigate();

  const overview = useQuery(
    api.admin.queries.getAdminOverview,
    sessionToken ? { sessionToken } : "skip",
  );

  const { stats, subscriptionPlans, flaggedAccounts, pendingAppeals } =
    overview || {};

  const aiEscalations = useQuery(
    api.ai.queries.getEscalationStats,
    sessionToken ? { sessionToken } : "skip",
  );

  const isLoading = overview === undefined || aiEscalations === undefined;

  const displayStats = useMemo(() => {
    if (isLoading) {
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
    }

    return {
      totalPharmacies: stats?.totalPharmacies || 0,
      activePharmacies: stats?.activePharmacies || 0,
      pendingPharmacies: stats?.pendingPharmacies || 0,
      totalBranches: stats?.totalBranches || 0,
      activeBranches: stats?.activeBranches || 0,
      totalManagers: stats?.totalManagers || 0,
      activeManagers: stats?.activeManagers || 0,
      totalPlans: stats?.totalPlans || 0,
      monthlyRevenue: stats?.monthlyRevenue || 0,
      activeSubscriptions: stats?.activeSubscriptions || 0,
      flaggedCount: stats?.flaggedCount || 0,
      pendingAppealsCount: stats?.appealsCount || 0,
      aiEscalationsToday: aiEscalations?.today || 0,
      aiEscalationsPending: aiEscalations?.pending || 0,
    };
  }, [stats, aiEscalations, isLoading]);

  const pendingAppealsPreview = useMemo(() => {
    const managerAppeals = (pendingAppeals?.managerFlagAppeals || []).map(
      (appeal: any) => ({
        id: `manager-${appeal.id || appeal._id || Math.random()}`,
        type: "Manager Flag Appeal",
        owner: appeal.ownerName || "Unknown",
      }),
    );
    const adminAppeals = (pendingAppeals?.adminActionAppeals || []).map(
      (appeal: any) => ({
        id: `admin-${appeal.id || appeal._id || Math.random()}`,
        type: "Admin Action Appeal",
        owner: appeal.ownerName || "Unknown",
      }),
    );
    return [...managerAppeals, ...adminAppeals].slice(0, 4);
  }, [pendingAppeals]);

  const activePlansCount = useMemo(
    () => (subscriptionPlans || []).filter((plan: any) => plan.isActive).length,
    [subscriptionPlans],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Synchronizing Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pharmacies"
          value={displayStats.totalPharmacies}
          change={displayStats.activePharmacies}
          changeLabel="Active"
          icon={Building2}
          tone="teal"
          onClick={() => navigate("/admin?tab=pharmacies")}
          actionLabel="Open Pharmacies"
        />
        <MetricCard
          title="Total Branches"
          value={displayStats.totalBranches}
          change={displayStats.activeBranches}
          changeLabel="Active"
          icon={Store}
          tone="blue"
          onClick={() => navigate("/admin?tab=pharmacies")}
          actionLabel="Inspect Network"
        />
        <MetricCard
          title="Managers"
          value={displayStats.totalManagers}
          change={displayStats.activeManagers}
          changeLabel="Active"
          icon={Users}
          tone="amber"
          onClick={() => navigate("/admin?tab=pharmacies")}
          actionLabel="View Managers"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`ETB ${displayStats.monthlyRevenue.toLocaleString()}`}
          change={displayStats.activeSubscriptions}
          changeLabel="Active Subscriptions"
          icon={DollarSign}
          tone="emerald"
          onClick={() => navigate("/admin?tab=subscriptions")}
          actionLabel="Manage Plans"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <OperationalAlertsCard
          flaggedAccounts={flaggedAccounts || []}
          pendingAppealsPreview={pendingAppealsPreview}
          flaggedCount={displayStats.flaggedCount}
          pendingAppealsCount={displayStats.pendingAppealsCount}
        />
        <AIEscalationsCard
          sessionToken={sessionToken}
          aiEscalationsToday={displayStats.aiEscalationsToday}
          aiEscalationsPending={displayStats.aiEscalationsPending}
        />
        <SubscriptionHealthCard
          subscriptionPlans={subscriptionPlans || []}
          activePlansCount={activePlansCount}
        />
        <SystemActivityCard sessionToken={sessionToken} />
      </div>
    </div>
  );
}
