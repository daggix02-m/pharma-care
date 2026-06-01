import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppealsSectionProps {
  pendingActions: any;
}

export function AppealsSection({ pendingActions }: AppealsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions & Appeals</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingActions && pendingActions.totalCount > 0 ? (
          <div className="space-y-4">
            {pendingActions.adminActions.map((action: any) => (
              <div
                key={action._id}
                className="border border-border/40 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      {action.actionType.replace(/_/g, " ").toUpperCase()}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {action.reason}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(action.timestamp).toLocaleDateString()}
                      </span>
                      {!action.actionStatus?.includes("resolved") && (
                        <Badge variant="destructive">Action Required</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No pending admin actions</p>
            <p className="text-xs text-muted-foreground mt-1">
              You&apos;re all caught up!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
