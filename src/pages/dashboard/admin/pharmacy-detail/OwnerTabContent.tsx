import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./InfoRow";
import type { PharmacySummary, OwnerInfo } from "./types";

interface OwnerTabContentProps {
  summary: PharmacySummary;
  owner: OwnerInfo | null | undefined;
}

export function OwnerTabContent({ summary, owner }: OwnerTabContentProps) {
  return (
    <Card className="border-2 border-border/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
          Owner Submission Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <InfoRow label="Owner Name" value={summary.ownerName} />
        <InfoRow label="Owner Email" value={summary.ownerEmail} />
        <InfoRow label="Owner Phone" value={summary.ownerPhone} />
        <InfoRow label="Owner Status" value={owner?.status || "N/A"} />
        <InfoRow
          label="Email Verified"
          value={owner?.emailVerified ? "Yes" : "No"}
        />
        <InfoRow label="Owner Role" value={owner?.role || "N/A"} />
      </CardContent>
    </Card>
  );
}
