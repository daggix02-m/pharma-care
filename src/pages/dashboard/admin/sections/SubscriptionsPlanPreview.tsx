import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { PlanDraft } from "./subscriptionTypes";

interface PlanPreviewProps {
  draft: PlanDraft;
}

export function SubscriptionsPlanPreview({ draft }: PlanPreviewProps) {
  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Live Plan Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-bold tracking-tight">
              {draft.name.trim() || "Untitled Plan"}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {draft.code.trim() || "plan-code"}
            </p>
          </div>
          <Badge variant={draft.isActive ? "default" : "secondary"}>
            {draft.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight">
              {Number(draft.price || 0)}
            </p>
            <p className="text-xs text-muted-foreground">ETB / month</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{Number(draft.maxBranches || 0)} branches</p>
            <p>{Number(draft.maxUsers || 0)} users</p>
          </div>
        </div>

        {draft.description && (
          <p className="text-sm text-muted-foreground">{draft.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {draft.features.slice(0, 8).map((feature, index) => (
            <div
              key={`${feature}-${index}`}
              className="text-sm rounded-lg border border-border/50 bg-background/70 px-3 py-2"
            >
              {feature}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
