import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";
import { DailySalesView, SalesSummaryView } from "./FinancialViews";

export function FinancialOperations() {
  const [view, setView] = useState("daily");
  const { sessionToken } = useAuth();

  const dailySales = useQuery(
    api.cashier.queries.getSalesSummary,
    sessionToken ? { sessionToken } : "skip",
  );
  const salesSummary = useQuery(
    api.cashier.queries.getSalesSummary,
    sessionToken ? { sessionToken } : "skip",
  );

  if (dailySales === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Financial Operations
        </h2>
        <p className="text-muted-foreground">
          View sales reports and financial summaries
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={view === "daily" ? "default" : "outline"}
          onClick={() => setView("daily")}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Daily Sales
        </Button>
        <Button
          variant={view === "summary" ? "default" : "outline"}
          onClick={() => setView("summary")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Sales Summary
        </Button>
      </div>

      {view === "daily" && dailySales && (
        <DailySalesView dailySales={dailySales} />
      )}

      {view === "summary" && salesSummary && (
        <SalesSummaryView salesSummary={salesSummary} />
      )}
    </div>
  );
}
