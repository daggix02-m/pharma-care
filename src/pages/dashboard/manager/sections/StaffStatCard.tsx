import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function StaffStatCard({
  title,
  value,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Card className="minimal-card p-6">
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
    </Card>
  );
}
