import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./InfoRow";
import type { PharmacySummary } from "./types";

interface SubscriptionTabContentProps {
  summary: PharmacySummary;
  paymentStatus: string | undefined;
  monthlyCost: number | undefined;
}

export function SubscriptionTabContent({
  summary,
  paymentStatus,
  monthlyCost,
}: SubscriptionTabContentProps) {
  return (
    <Card className="border-2 border-border/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
          Subscription Selection (Signup)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <InfoRow
          label="Selected Plan"
          value={summary.selectedTier.toUpperCase() || "NOT SET"}
        />
        <InfoRow
          label="Recommended Plan"
          value={summary.recommendedTier.toUpperCase() || "NOT SET"}
        />
        <InfoRow
          label="Payment Status"
          value={paymentStatus || "Not provided"}
        />
        <InfoRow label="Monthly Cost" value={`ETB ${monthlyCost ?? 0}`} />
        <InfoRow
          label="Terms Accepted"
          value={
            summary.termsAccepted === undefined
              ? "Not captured (legacy)"
              : summary.termsAccepted
                ? "Yes"
                : "No"
          }
        />
      </CardContent>
    </Card>
  );
}
