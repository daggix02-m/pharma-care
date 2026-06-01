import React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Users,
  Package,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick?: () => void;
  actionLabel?: string;
}

function StatCard({
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
        <p className="text-[11px] text-primary mt-2 uppercase tracking-wide font-semibold">
          {actionLabel}
        </p>
      ) : null}
    </Card>
  );
}

export function OverviewSection({
  onNavigateTab,
}: {
  onNavigateTab: (tab: string) => void;
}) {
  const { sessionToken } = useAuth();
  const stats = useQuery(
    api.manager.queries.getDashboardStats,
    sessionToken ? { sessionToken } : "skip",
  );
  const salesByPeriod = useQuery(
    api.manager.queries.getSalesByPeriod,
    sessionToken ? { sessionToken, period: "7days" } : "skip",
  );
  const loading = stats === undefined || salesByPeriod === undefined;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Staff"
          value={stats.totalStaff}
          icon={Users}
          color="text-primary"
          onClick={() => onNavigateTab("staff")}
          actionLabel="Manage"
        />
        <StatCard
          title="Branches"
          value={stats.totalBranches}
          icon={Building2}
          color="text-primary"
          onClick={() => onNavigateTab("branches")}
          actionLabel="Review"
        />
        <StatCard
          title="Total Revenue"
          value={`ETB ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-primary"
          onClick={() => onNavigateTab("audit")}
          actionLabel="Audit"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={Package}
          color="text-destructive"
          onClick={() => onNavigateTab("transfers")}
          actionLabel="Transfer"
        />
      </div>

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump directly to your most-used workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button variant="outline" onClick={() => onNavigateTab("branches")}>
            Open Branches
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab("staff")}>
            Open Staff
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab("transfers")}>
            Open Transfers
          </Button>
        </CardContent>
      </Card>

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Performance Overview
          </CardTitle>
          <CardDescription>Activity and growth indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/10 border border-border/40">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                    Revenue Trend
                  </p>
                  <p className="font-semibold text-emerald-600">
                    {stats.revenueChange}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/10 border border-border/40">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                    Stock Movement
                  </p>
                  <p className="font-semibold text-amber-600">
                    {stats.stockChange}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
