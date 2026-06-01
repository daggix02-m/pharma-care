import type { ReactNode } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanRecord } from "./subscriptionTypes";

interface PlanNavigatorProps {
  filteredPlans: PlanRecord[];
  selectedPlanId: Id<"subscription_plans"> | null;
  mode: "create" | "edit";
  searchTerm: string;
  statusFilter: "all" | "active" | "inactive";
  usageByCode: Map<string, number>;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  onSelectPlan: (planId: Id<"subscription_plans">) => void;
  onCreateNew: () => void;
  children?: ReactNode;
}

export function SubscriptionsPlanNavigator({
  filteredPlans,
  selectedPlanId,
  mode,
  searchTerm,
  statusFilter,
  usageByCode,
  onSearchTermChange,
  onStatusFilterChange,
  onSelectPlan,
  onCreateNew,
  children,
}: PlanNavigatorProps) {
  return (
    <Card className="border border-border/60 bg-gradient-to-b from-card to-muted/10">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Plan Navigator</CardTitle>
          <Button onClick={onCreateNew} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search by name or code"
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={statusFilter === item ? "default" : "outline"}
              className="h-8 text-xs capitalize"
              onClick={() => onStatusFilterChange(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[760px] overflow-y-auto">
        <div className="space-y-2">
          {filteredPlans.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed text-sm text-muted-foreground">
              No plans match your filter.
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const selected = mode === "edit" && selectedPlanId === plan._id;
              return (
                <button
                  key={plan._id}
                  type="button"
                  onClick={() => onSelectPlan(plan._id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{plan.name}</p>
                      <p className="text-[11px] uppercase text-muted-foreground tracking-wide">
                        {plan.code}
                      </p>
                    </div>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>ETB {plan.price}/mo</span>
                    <span>
                      {plan.maxBranches} branches • {plan.maxUsers} users
                    </span>
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      Used by {usageByCode.get(plan.code) || 0} pharmacies
                    </Badge>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {children}
      </CardContent>
    </Card>
  );
}
