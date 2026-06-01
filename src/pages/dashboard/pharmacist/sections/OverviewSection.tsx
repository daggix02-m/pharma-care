import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "./StatCard";
import type { Medicine } from "./types";

export function OverviewSection({
  onNavigateTab,
}: {
  onNavigateTab: (tab: string) => void;
}) {
  const { sessionToken } = useAuth();
  const stats = useQuery(
    api.pharmacist.queries.getDashboardStats,
    sessionToken ? { sessionToken } : "skip",
  );
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const expiringMedicines = useQuery(
    api.pharmacist.queries.getExpiringMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const lowStockMedicines = useQuery(
    api.pharmacist.queries.getLowStockMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading =
    stats === undefined ||
    medicines === undefined ||
    expiringMedicines === undefined ||
    lowStockMedicines === undefined;

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
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={Pill}
          color="text-primary"
          onClick={() => onNavigateTab("medicines")}
          actionLabel="Manage"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="text-destructive"
          onClick={() => onNavigateTab("stock")}
          actionLabel="Request"
        />
        <StatCard
          title="Near Expiry"
          value={expiringMedicines.length}
          icon={Clock}
          color="text-amber-600"
          onClick={() => onNavigateTab("expiry")}
          actionLabel="Review"
        />
        <StatCard
          title="Today's Sales"
          value={`ETB ${stats.todaySales.toLocaleString()}`}
          icon={DollarSign}
          color="text-primary"
          onClick={() => onNavigateTab("reports")}
          actionLabel="Analyze"
        />
      </div>

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Quick Actions
          </CardTitle>
          <CardDescription>
            Fast access to critical inventory workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button variant="outline" onClick={() => onNavigateTab("medicines")}>
            Inventory
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab("expiry")}>
            Expiry Alerts
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab("stock")}>
            Stock Requests
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {lowStockMedicines.length > 0 && (
          <Card className="minimal-card border-destructive/10">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockMedicines.slice(0, 4).map((medicine: Medicine) => (
                  <div
                    key={medicine._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10"
                  >
                    <span className="font-semibold text-[13px]">
                      {medicine.name}
                    </span>
                    <Badge variant="destructive" className="text-[10px]">
                      {medicine.stock} units left
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="minimal-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringMedicines.slice(0, 4).map((medicine: Medicine) => {
                const days = Math.ceil(
                  (medicine.expiryDate! - Date.now()) / (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={medicine._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/40"
                  >
                    <span className="font-semibold text-[13px]">
                      {medicine.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {days} days
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
