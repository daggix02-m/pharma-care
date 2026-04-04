import {
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  Store,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import type { Doc } from "@convex/_generated/dataModel";

type Pharmacy = Doc<"pharmacies">;
type Branch = Doc<"branches">;

interface PharmacyOverviewSectionProps {
  pharmacy: Pharmacy;
  branches: Branch[];
}

export function PharmacyOverviewSection({
  pharmacy,
  branches,
}: PharmacyOverviewSectionProps) {
  const statusConfig = {
    active: { icon: CheckCircle, label: "Active", variant: "default" as const },
    pending: {
      icon: Activity,
      label: "Pending",
      variant: "secondary" as const,
    },
    deactivated: {
      icon: AlertTriangle,
      label: "Deactivated",
      variant: "destructive" as const,
    },
    suspended: {
      icon: AlertTriangle,
      label: "Suspended",
      variant: "destructive" as const,
    },
  };

  const currentStatus =
    statusConfig[pharmacy.status as keyof typeof statusConfig] ||
    statusConfig.active;

  const plannedBranches = pharmacy.plannedBranches || 0;
  const plannedStaffTotal = pharmacy.plannedStaffTotal || 0;
  const primaryLocation =
    pharmacy.signupLocation || pharmacy.plannedBranchLocations?.[0] || "N/A";

  const stats: Array<{
    icon: React.ElementType;
    label: string;
    value: string;
    variant?: "default" | "secondary" | "destructive";
  }> = [
    {
      icon: currentStatus.icon,
      label: "Status",
      value: pharmacy.status,
      variant: "default",
    },
    {
      icon: Calendar,
      label: "Submitted",
      value: formatDateTime(pharmacy._creationTime),
    },
    {
      icon: TrendingUp,
      label: "Selected Plan",
      value: pharmacy.subscriptionTier?.toUpperCase() || "BASIC",
    },
    {
      icon: Activity,
      label: "Recommended Plan",
      value: pharmacy.recommendedSubscriptionTier?.toUpperCase() || "N/A",
    },
    {
      icon: DollarSign,
      label: "Monthly Cost",
      value: `ETB ${pharmacy.monthlyCost || 0}/month`,
    },
    {
      icon: Building2,
      label: "Total Branches",
      value: branches.length.toString(),
    },
    {
      icon: Store,
      label: "Planned Branches",
      value: plannedBranches.toString(),
    },
    {
      icon: Users,
      label: "Planned Staff",
      value: plannedStaffTotal.toString(),
    },
  ];

  const quickActions = [
    { icon: Store, label: "View Branches", action: () => {} },
    { icon: Users, label: "View Staff", action: () => {} },
    { icon: Calendar, label: "View Audit Log", action: () => {} },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-[hsl(var(--medical-teal))]/20 bg-gradient-to-br from-background to-[hsl(var(--medical-teal))]/5">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-[hsl(var(--medical-teal))] hover:bg-[hsl(var(--medical-teal))]/10 transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-muted group-hover:bg-[hsl(var(--medical-teal))] group-hover:text-white transition-all duration-200">
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          title="Subscription Status"
          icon={TrendingUp}
          items={[
            {
              label: "Selected Plan",
              value: pharmacy.subscriptionTier?.toUpperCase() || "BASIC",
            },
            {
              label: "Recommended Plan",
              value:
                pharmacy.recommendedSubscriptionTier?.toUpperCase() || "N/A",
            },
            {
              label: "Payment Status",
              value: pharmacy.paymentStatus || "N/A",
            },
            { label: "Billing Cycle", value: "Monthly" },
            {
              label: "Next Payment",
              value: pharmacy.nextBillingDate
                ? new Date(pharmacy.nextBillingDate).toLocaleDateString()
                : "N/A",
            },
          ]}
        />
        <InfoCard
          title="Registration Snapshot"
          icon={Building2}
          items={[
            { label: "License", value: pharmacy.licenseCode || "N/A" },
            {
              label: "Primary Location",
              value: primaryLocation,
            },
            {
              label: "Planned Branches",
              value: plannedBranches.toString(),
            },
            {
              label: "Branch Locations",
              value: pharmacy.plannedBranchLocations?.length
                ? pharmacy.plannedBranchLocations.join(", ")
                : "N/A",
            },
            {
              label: "Staff Breakdown",
              value: pharmacy.plannedStaffBreakdown
                ? `${pharmacy.plannedStaffBreakdown.pharmacists || 0} pharmacists, ${pharmacy.plannedStaffBreakdown.managers || 0} managers, ${pharmacy.plannedStaffBreakdown.cashiers || 0} cashiers`
                : "N/A",
            },
          ]}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: "default" | "secondary" | "destructive";
}

function StatCard({
  icon: Icon,
  label,
  value,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className="border-2 hover:border-[hsl(var(--medical-teal))]/40 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              variant === "destructive"
                ? "bg-destructive/10 text-destructive"
                : variant === "secondary"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-[hsl(var(--medical-teal))]/10 text-[hsl(var(--medical-teal))]",
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoCardProps {
  title: string;
  icon: React.ElementType;
  items: Array<{ label: string; value: string }>;
}

function InfoCard({ title, icon: Icon, items }: InfoCardProps) {
  return (
    <Card className="border-2 border-border">
      <CardContent className="p-5">
        <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
          {title}
        </h4>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
              <span className="text-sm font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
