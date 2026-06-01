import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./InfoRow";
import type { PharmacySummary } from "./types";

interface OperationsTabContentProps {
  summary: PharmacySummary;
}

export function OperationsTabContent({ summary }: OperationsTabContentProps) {
  return (
    <Card className="border-2 border-border/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
          Planned Operations (Signup)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <InfoRow
          label="Planned Branches"
          value={String(summary.plannedBranches)}
        />
        <InfoRow
          label="Planned Total Staff"
          value={String(summary.plannedStaffTotal)}
        />
        <InfoRow
          label="Planned Pharmacists"
          value={String(summary.staffBreakdown.pharmacists)}
        />
        <InfoRow
          label="Planned Managers"
          value={String(summary.staffBreakdown.managers)}
        />
        <InfoRow
          label="Planned Cashiers"
          value={String(summary.staffBreakdown.cashiers)}
        />
        <InfoRow
          label="Branch Locations"
          value={
            summary.branchLocations.length
              ? summary.branchLocations.join(", ")
              : summary.plannedBranches > 0
                ? summary.primaryLocation
                : "Not provided"
          }
        />
      </CardContent>
    </Card>
  );
}
