import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatPill } from "./helpers";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionsPlanNavigator } from "./SubscriptionsPlanNavigator";
import { SubscriptionsTemplateEditor } from "./SubscriptionsTemplateEditor";
import { SubscriptionsPlanEditor } from "./SubscriptionsPlanEditor";
import { SubscriptionsPlanPreview } from "./SubscriptionsPlanPreview";
import type { PlanRecord } from "./subscriptionTypes";
import { useSubscriptionEditor } from "./useSubscriptionEditor";

export function SubscriptionsSection() {
  const { sessionToken } = useAuth();
  const plans = useQuery(
    api.admin.queries.getAllSubscriptionPlans,
    sessionToken ? { sessionToken } : "skip",
  );
  const planUsage = useQuery(
    api.admin.queries.getPlanUsageCounts,
    sessionToken ? { sessionToken } : "skip",
  );
  const allPlans = (plans || []) as PlanRecord[];

  const editor = useSubscriptionEditor(sessionToken, allPlans, planUsage);

  if (!plans) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Subscription Plans
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control global plan pricing, limits, and availability from one
            workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void editor.syncFromSignup()}
            disabled={editor.syncingPlans}
          >
            {editor.syncingPlans ? "Syncing..." : "Sync Plans From Signup Form"}
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <StatPill label="Total plans" value={editor.stats.total} />
          <StatPill label="Active" value={editor.stats.active} />
          <StatPill label="Inactive" value={editor.stats.inactive} />
          <StatPill
            label="Avg monthly"
            value={`${editor.stats.averagePrice} ETB`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <SubscriptionsPlanNavigator
          filteredPlans={editor.filteredPlans}
          selectedPlanId={editor.selectedPlanId}
          mode={editor.mode}
          searchTerm={editor.searchTerm}
          statusFilter={editor.statusFilter}
          usageByCode={editor.usageByCode}
          onSearchTermChange={editor.setSearchTerm}
          onStatusFilterChange={editor.setStatusFilter}
          onSelectPlan={editor.selectPlan}
          onCreateNew={editor.openCreateDraft}
        >
          <SubscriptionsTemplateEditor
            sessionToken={sessionToken}
            currentPlanDraft={editor.draft}
            onApplyTemplate={editor.handleApplyTemplate}
          />
        </SubscriptionsPlanNavigator>
        <div className="space-y-4">
          <SubscriptionsPlanEditor
            draft={editor.draft}
            onDraftChange={editor.handleDraftChange}
            mode={editor.mode}
            isDirty={editor.isDirty}
            isDefaultCodeLocked={editor.isDefaultCodeLocked}
            saving={editor.saving}
            onSave={editor.savePlan}
            onDiscard={editor.discardChanges}
            onToggleStatus={editor.toggleStatus}
          />
          <SubscriptionsPlanPreview draft={editor.draft} />
        </div>
      </div>
    </div>
  );
}
