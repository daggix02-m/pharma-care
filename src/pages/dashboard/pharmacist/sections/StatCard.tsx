import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { StatCardProps } from "./types";

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  actionLabel,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "minimal-card p-6 transition-all",
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : "",
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <div
          className={cn(
            "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center",
            color,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
      {actionLabel ? (
        <p className="text-[11px] font-semibold text-primary mt-2 uppercase tracking-wide">
          {actionLabel}
        </p>
      ) : null}
    </Card>
  );
}
