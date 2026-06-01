import {
  User,
  Shield,
  MapPin,
  Clock,
  Flag,
  Lock,
  MoreVertical,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Doc } from "@convex/_generated/dataModel";

type UserType = Doc<"users">;

interface ManagersSectionProps {
  managers: UserType[];
}

export function ManagersSection({ managers }: ManagersSectionProps) {
  if (managers.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardContent className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Managers Found</h3>
          <p className="text-sm text-muted-foreground">
            This pharmacy has no managers assigned yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {managers.map((manager) => (
        <ManagerCard key={manager._id} manager={manager} />
      ))}
    </div>
  );
}

interface ManagerCardProps {
  manager: UserType;
}

function ManagerCard({ manager }: ManagerCardProps) {
  return (
    <Card className="border-2 border-border hover:border-[hsl(var(--medical-teal))]/40 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--medical-teal))]/10 flex items-center justify-center">
                <User className="h-6 w-6 text-[hsl(var(--medical-teal))]" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">{manager.full_name}</h4>
                <p className="text-sm text-muted-foreground">{manager.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <InfoItem
                icon={MapPin}
                label="Scope"
                value={manager.accessScope || "Full Pharmacy"}
              />
              <InfoItem icon={Clock} label="Last Login" value={"N/A"} />
              <InfoItem
                icon={Activity}
                label="Actions (30d)"
                value={manager.totalActionsLast30Days?.toString() || "0"}
              />
              <InfoItem
                icon={Shield}
                label="MFA"
                value={manager.mfaEnabled ? "Enabled" : "Disabled"}
              />
            </div>

            <div className="flex items-center gap-2">
              {manager.adminFlagged && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Flag className="h-3 w-3" />
                  Flagged
                </Badge>
              )}
              {manager.adminLocked && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
              <Badge
                variant={manager.status === "active" ? "default" : "secondary"}
              >
                {manager.status}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
