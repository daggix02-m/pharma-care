import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SubscriptionHealthCard({
  subscriptionPlans,
  activePlansCount,
}: {
  subscriptionPlans: any[];
  activePlansCount: number;
}) {
  return (
    <Card className="minimal-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Subscription Health
          <Badge variant="outline" className="ml-2 text-[10px]">
            {activePlansCount} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {subscriptionPlans.slice(0, 4).map((plan: any) => (
            <div
              key={plan._id}
              className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-border transition-colors"
            >
              <div>
                <p className="font-semibold text-[14px]">{plan.name}</p>
                <p className="text-[12px] text-muted-foreground">
                  ETB {plan.price} / month
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2",
                  plan.isActive
                    ? "bg-primary/5 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {plan.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
