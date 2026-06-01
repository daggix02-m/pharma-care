import {
  Package,
  Users,
  Activity,
  TrendingUp,
  Megaphone,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { OwnerStatCard } from "./OwnerStatCard";
import type { OwnerTab } from "./types";

interface OverviewSectionProps {
  pharmacy: any;
  pendingActions: any;
  messagesCount: number;
  onNavigateTab: (tab: OwnerTab) => void;
  onSendMessage: () => void;
}

export function OverviewSection({
  pharmacy,
  pendingActions,
  messagesCount,
  onNavigateTab,
  onSendMessage,
}: OverviewSectionProps) {
  const signupProfile = pharmacy?.signupProfile;
  const plannedBreakdown = signupProfile?.plannedStaffBreakdown
    ? `${signupProfile.plannedStaffBreakdown.pharmacists} pharmacists, ${signupProfile.plannedStaffBreakdown.managers} managers, ${signupProfile.plannedStaffBreakdown.cashiers} cashiers`
    : "N/A";

  const pharmacyIdentityRows = [
    { label: "Pharmacy Name", value: signupProfile?.name || "N/A" },
    { label: "Pharmacy Email", value: signupProfile?.pharmacyEmail || "N/A" },
    { label: "License Number", value: signupProfile?.licenseCode || "N/A" },
    {
      label: "Primary Location",
      value: signupProfile?.signupLocation || "N/A",
    },
  ];

  const operationsRows = [
    {
      label: "Planned Branches",
      value:
        typeof signupProfile?.plannedBranches === "number"
          ? signupProfile.plannedBranches.toString()
          : "N/A",
    },
    {
      label: "Branch Locations",
      value:
        signupProfile?.plannedBranchLocations?.length > 0
          ? signupProfile.plannedBranchLocations.join(", ")
          : "N/A",
    },
    {
      label: "Planned Staff",
      value:
        typeof signupProfile?.plannedStaffTotal === "number"
          ? signupProfile.plannedStaffTotal.toString()
          : "N/A",
    },
    { label: "Staff Breakdown", value: plannedBreakdown },
  ];

  const billingRows = [
    {
      label: "Selected Tier",
      value: signupProfile?.selectedTier
        ? signupProfile.selectedTier.toUpperCase()
        : "N/A",
    },
    {
      label: "Recommended Tier",
      value: signupProfile?.recommendedTier
        ? signupProfile.recommendedTier.toUpperCase()
        : "N/A",
    },
    {
      label: "Payment Status",
      value: signupProfile?.paymentStatus
        ? signupProfile.paymentStatus.toUpperCase()
        : "N/A",
    },
    {
      label: "Submitted",
      value: signupProfile?.submittedAt
        ? formatDateTime(signupProfile.submittedAt)
        : "N/A",
    },
  ];

  const sectionCards = [
    {
      title: "Owner Account",
      rows: [
        { label: "Owner Name", value: signupProfile?.ownerName || "N/A" },
        { label: "Owner Email", value: signupProfile?.ownerEmail || "N/A" },
        { label: "Owner Phone", value: signupProfile?.ownerPhone || "N/A" },
      ],
    },
    { title: "Pharmacy Identity", rows: pharmacyIdentityRows },
    { title: "Operations Snapshot", rows: operationsRows },
    { title: "Subscription & Billing", rows: billingRows },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OwnerStatCard
          icon={Package}
          label="Total Branches"
          value={pharmacy?.branches?.length || 0}
          color="text-blue-600"
          onClick={() => onNavigateTab("branches")}
          actionLabel="Open"
        />
        <OwnerStatCard
          icon={Users}
          label="Total Staff"
          value={pharmacy?.staff?.length || 0}
          color="text-emerald-600"
          onClick={() => onNavigateTab("staff")}
          actionLabel="Manage"
        />
        <OwnerStatCard
          icon={Activity}
          label="Pending Actions"
          value={pendingActions?.totalCount || 0}
          color="text-orange-600"
          onClick={() => onNavigateTab("appeals")}
          actionLabel="Review"
        />
        <OwnerStatCard
          icon={TrendingUp}
          label="Messages Sent"
          value={messagesCount}
          color="text-purple-600"
          onClick={() => onNavigateTab("messaging")}
          actionLabel="Inspect"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200"
              onClick={onSendMessage}
            >
              <Megaphone className="h-8 w-8 text-emerald-600" />
              <span className="font-medium">Send Internal Message</span>
              <span className="text-xs text-muted-foreground">
                Communicate with staff
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
              onClick={() => onNavigateTab("appeals")}
            >
              <ShieldAlert className="h-8 w-8 text-orange-600" />
              <span className="font-medium">Review Actions</span>
              <span className="text-xs text-muted-foreground">
                Manage admin requests
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => onNavigateTab("branches")}
            >
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="font-medium">Manage Branches</span>
              <span className="text-xs text-muted-foreground">
                View and edit branches
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Signup Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            {sectionCards.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-border/50 bg-gradient-to-br from-secondary/15 to-secondary/5 px-4 py-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80 mb-2">
                  {section.title}
                </p>
                <div className="space-y-2.5">
                  {section.rows.map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium break-words">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
