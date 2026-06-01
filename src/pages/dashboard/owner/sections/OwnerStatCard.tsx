import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function OwnerStatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
  onClick,
  actionLabel,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  color?: string;
  onClick?: () => void;
  actionLabel?: string;
}) {
  return (
    <Card
      className={cn(
        "group transition-all duration-300 border-2 hover:border-primary/20",
        onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : "",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon
          className={cn(
            "h-5 w-5 transition-colors",
            color || "text-muted-foreground",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs mt-1",
              change.startsWith("+") ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {change} from last month
          </p>
        )}
        {actionLabel ? (
          <p className="text-[11px] font-semibold text-primary mt-2 uppercase tracking-wide">
            {actionLabel}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
