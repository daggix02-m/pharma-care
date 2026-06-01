import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  tone,
  onClick,
  actionLabel,
}: {
  title: string;
  value: string | number;
  change?: string | number;
  changeLabel: string;
  icon: any;
  tone: "teal" | "blue" | "amber" | "emerald";
  onClick?: () => void;
  actionLabel?: string;
}) {
  const toneClass = {
    teal: "text-primary bg-primary/10",
    blue: "text-blue-700 bg-blue-100",
    amber: "text-amber-700 bg-amber-100",
    emerald: "text-emerald-700 bg-emerald-100",
  };

  return (
    <Card
      className={cn(
        "minimal-card p-6 flex flex-col justify-between transition-all",
        onClick
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-primary/30"
          : "",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            toneClass[tone],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined ? (
          <span className="text-[11px] font-semibold text-muted-foreground">
            {changeLabel}: <span className="text-foreground">{change}</span>
          </span>
        ) : null}
      </div>
      <div>
        <h3 className="text-3xl font-display font-bold tracking-tighter mb-1">
          {value}
        </h3>
        <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        {actionLabel ? (
          <p className="text-[11px] text-primary mt-2 inline-flex items-center gap-1">
            {actionLabel}
            <ExternalLink className="w-3.5 h-3.5" />
          </p>
        ) : null}
      </div>
    </Card>
  );
}
