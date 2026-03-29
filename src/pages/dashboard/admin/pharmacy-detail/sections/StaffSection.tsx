import {
  User,
  MapPin,
  Calendar,
  Activity,
  Briefcase,
  Filter,
  Search,
  Shield,
  Lock,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Doc } from "@convex/_generated/dataModel";

type UserType = Doc<"users">;

interface StaffSectionProps {
  staff: UserType[];
}

export function StaffSection({ staff }: StaffSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const uniqueRoles = Array.from(new Set(staff.map((s) => s.role)));

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (staff.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardContent className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Staff Found</h3>
          <p className="text-sm text-muted-foreground">
            This pharmacy has no staff members assigned yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-2 border-[hsl(var(--medical-teal))]/20 bg-gradient-to-br from-background to-[hsl(var(--medical-teal))]/5">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-border bg-background text-sm focus:outline-none focus:border-[hsl(var(--medical-teal))] transition-colors"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-border bg-background text-sm focus:outline-none focus:border-[hsl(var(--medical-teal))] transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="deactivated">Deactivated</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="space-y-3">
        {filteredStaff.map((member) => (
          <StaffCard key={member._id} staffMember={member} />
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StaffCardProps {
  staffMember: UserType;
}

function StaffCard({ staffMember }: StaffCardProps) {
  const roleConfig: Record<string, { icon: typeof Briefcase; color: string }> =
    {
      pharmacist: { icon: Briefcase, color: "text-blue-600" },
      cashier: { icon: MapPin, color: "text-green-600" },
      manager: { icon: Shield, color: "text-purple-600" },
      inventory_clerk: { icon: Activity, color: "text-orange-600" },
      delivery_staff: { icon: MapPin, color: "text-teal-600" },
    };

  const config = roleConfig[staffMember.role] || {
    icon: User,
    color: "text-muted-foreground",
  };

  return (
    <Card className="border-2 border-border hover:border-[hsl(var(--medical-teal))]/40 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[hsl(var(--medical-teal))]/10 flex items-center justify-center">
                <config.icon className={cn("h-5 w-5", config.color)} />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold">
                  {staffMember.full_name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {staffMember.email}
                </p>
              </div>
              <Badge
                variant="outline"
                className="capitalize text-xs font-medium"
              >
                {staffMember.role.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <InfoItem
                icon={MapPin}
                label="Branch"
                value={staffMember.assignedBranches?.[0] || "Not assigned"}
              />
              <InfoItem
                icon={Calendar}
                label="Created"
                value={new Date(staffMember._creationTime).toLocaleDateString()}
              />
              <InfoItem icon={Activity} label="Last Login" value="N/A" />
              <InfoItem
                icon={Shield}
                label="MFA"
                value={staffMember.mfaEnabled ? "Enabled" : "Disabled"}
              />
            </div>

            <div className="flex items-center gap-2">
              {staffMember.adminFlagged && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1 text-xs"
                >
                  <Shield className="h-3 w-3" />
                  Flagged
                </Badge>
              )}
              {staffMember.adminLocked && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1 text-xs"
                >
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
              <Badge
                variant={
                  staffMember.status === "active" ? "default" : "secondary"
                }
                className="capitalize text-xs"
              >
                {staffMember.status}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>View Activity Log</DropdownMenuItem>
              <DropdownMenuItem>Send Message</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Deactivate Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
