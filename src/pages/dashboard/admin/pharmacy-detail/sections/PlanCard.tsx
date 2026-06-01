import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PlanDetails = {
  name: string;
  price: number;
  branches: string | number;
  users: string | number;
  features: string[];
};

interface PlanCardProps {
  plan: PlanDetails;
  isCurrent: boolean;
}

export function PlanCard({ plan, isCurrent }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "border-2",
        isCurrent
          ? "border-[hsl(var(--medical-teal))] shadow-lg"
          : "border-border",
      )}
    >
      <CardHeader
        className={cn(
          "pb-4",
          isCurrent &&
            "bg-gradient-to-r from-[hsl(var(--medical-teal))] to-[hsl(var(--medical-teal))]/80",
        )}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn("text-lg font-semibold", isCurrent && "text-white")}
          >
            {plan.name} Plan
          </CardTitle>
          {isCurrent && (
            <Badge className="bg-white text-[hsl(var(--medical-teal))]">
              Current
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <span className={cn("text-3xl font-bold", isCurrent && "text-white")}>
            ETB {plan.price}
          </span>
          <span
            className={cn(
              "text-sm text-muted-foreground ml-1",
              isCurrent && "text-white/80",
            )}
          >
            /month
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Branches" value={plan.branches} />
          <StatItem label="Users" value={plan.users} />
        </div>
        <div className="space-y-2 pt-3 border-t border-border/50">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Includes:
          </p>
          {plan.features.slice(0, 3).map((feature: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
