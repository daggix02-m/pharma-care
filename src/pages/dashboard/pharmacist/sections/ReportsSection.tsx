import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export function ReportsSection() {
  const { sessionToken } = useAuth();
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  if (!medicines) return <Skeleton className="h-96 rounded-2xl" />;

  const stockValuation = medicines.reduce((sum: number, medicine: any) => {
    const price = typeof medicine.price === "number" ? medicine.price : 0;
    const stock = typeof medicine.stock === "number" ? medicine.stock : 0;
    return sum + price * stock;
  }, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="minimal-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Inventory Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            Analytics Visualization Placeholder
          </div>
        </CardContent>
      </Card>
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Stock Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center py-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Total Assets
            </p>
            <p className="text-4xl font-display font-bold">
              ETB {stockValuation.toLocaleString()}
            </p>
          </div>
          <div className="pt-6 border-t border-border/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Items Tracked
            </p>
            <p className="text-2xl font-bold">{medicines.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
