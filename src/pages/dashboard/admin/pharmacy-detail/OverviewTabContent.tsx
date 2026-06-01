import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./InfoRow";
import type { PharmacySummary } from "./types";

interface OverviewTabContentProps {
  summary: PharmacySummary;
}

export function OverviewTabContent({ summary }: OverviewTabContentProps) {
  return (
    <Card
      className="border-2 border-border/70"
      id="pharmacy-registration-details"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
          Pharmacy Registration Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <InfoRow label="Pharmacy Name" value={summary.pharmacyName} />
        <InfoRow
          label="Pharmacy Email"
          value={summary.pharmacyEmail || "Not provided"}
        />
        <InfoRow
          label="License Code"
          value={summary.licenseCode || "Not provided"}
        />
        <InfoRow label="Primary Location" value={summary.primaryLocation} />
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
        <InfoRow
          label="Submitted At"
          value={
            summary.submittedAt
              ? new Date(summary.submittedAt).toLocaleString()
              : "Not provided"
          }
        />
        <InfoRow label="Application Status" value={summary.status} />
      </CardContent>
    </Card>
  );
}
