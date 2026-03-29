import {
  Building2,
  MapPin,
  Phone,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Doc } from "@convex/_generated/dataModel";

type Branch = Doc<"branches">;

interface BranchesSectionProps {
  branches: Branch[];
}

export function BranchesSection({ branches }: BranchesSectionProps) {
  if (branches.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardContent className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Branches Found</h3>
          <p className="text-sm text-muted-foreground">
            This pharmacy has no branches configured yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {branches.map((branch) => (
        <BranchCard key={branch._id} branch={branch} />
      ))}
    </div>
  );
}

interface BranchCardProps {
  branch: Branch;
}

function BranchCard({ branch }: BranchCardProps) {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      label: "Active",
      variant: "default" as const,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      variant: "secondary" as const,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
    },
    rejected: {
      icon: AlertTriangle,
      label: "Rejected",
      variant: "destructive" as const,
      color: "text-red-600",
      bg: "bg-red-500/10",
    },
    deactivated: {
      icon: Clock,
      label: "Deactivated",
      variant: "secondary" as const,
      color: "text-gray-600",
      bg: "bg-gray-500/10",
    },
  };

  const config =
    statusConfig[branch.status as keyof typeof statusConfig] ||
    statusConfig.active;
  const Icon = config.icon;

  return (
    <Card className="border-2 border-border hover:border-[hsl(var(--medical-teal))]/40 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${config.bg}`}>
              <Building2 className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {branch.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Code: {branch.code || "N/A"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>View Staff</DropdownMenuItem>
              <DropdownMenuItem>View Inventory</DropdownMenuItem>
              <DropdownMenuItem>View Analytics</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <Icon className={cn("h-4 w-4", config.color)} />
          <span className="text-sm font-medium">{config.label}</span>
        </div>

        {/* Address */}
        {branch.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{branch.address}</p>
          </div>
        )}

        {/* Contact Info */}
        {branch.contactPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{branch.contactPhone}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">{branch.staffCount || 0} Staff</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Type: {branch.type || "Retail"}
            </Badge>
          </div>
        </div>

        {/* License Details */}
        {branch.licenseDetails && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">License No.</span>
              <span className="text-xs font-medium">
                {branch.licenseDetails.licenseNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Issuing Authority
              </span>
              <span className="text-xs font-medium">
                {branch.licenseDetails.issuingAuthority}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Expires</span>
              <span
                className={cn(
                  "text-xs font-medium",
                  new Date(branch.licenseDetails.expiryDate) < new Date()
                    ? "text-red-600"
                    : "text-muted-foreground",
                )}
              >
                {new Date(
                  branch.licenseDetails.expiryDate,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {branch.operatingHours && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Operating Hours
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
              {Object.entries(
                branch.operatingHours as Record<string, string>,
              ).map(([day, hours]) => (
                <div key={day} className="text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    {day.slice(0, 3)}
                  </p>
                  <p className="text-xs font-medium">{hours || "Closed"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
