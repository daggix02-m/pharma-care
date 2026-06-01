"use client";

import {
  Building2,
  Users,
  User,
  MapPin,
  Phone,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui";
import type { Pharmacy } from "./types";
import { StaffCard } from "./StaffCard";

interface PharmacyListItemProps {
  pharmacy: Pharmacy;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (pharmacy: Pharmacy) => void;
  onDelete: (pharmacy: Pharmacy) => void;
}

export function PharmacyListItem({
  pharmacy,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: PharmacyListItemProps) {
  const managers = pharmacy.staff?.filter((s) => s.role === "Manager") || [];
  const employees = pharmacy.staff?.filter((s) => s.role === "Employee") || [];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className={cn(
              "transition-transform duration-200",
              isExpanded ? "rotate-90" : "rotate-0",
            )}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold">{pharmacy.name}</h4>
            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {pharmacy.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {pharmacy.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {pharmacy.staff?.length || 0} Staff
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pharmacy);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pharmacy);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="p-6 space-y-6">
            {managers.length > 0 && (
              <div>
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Managers
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {managers.map((staff, index) => (
                    <StaffCard
                      key={staff.id || `manager-${index}`}
                      staff={staff}
                    />
                  ))}
                </div>
              </div>
            )}

            {employees.length > 0 && (
              <div>
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employees
                </h5>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((staff, index) => (
                        <TableRow key={staff.id || `employee-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={staff.avatarUrl}
                                  alt={staff.name}
                                />
                                <AvatarFallback>
                                  {staff.name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{staff.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{staff.email}</TableCell>
                          <TableCell>{staff.phone}</TableCell>
                          <TableCell>{staff.joinDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {managers.length === 0 && employees.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Staff Assigned
                </h3>
                <p className="text-muted-foreground max-w-md">
                  This pharmacy has no staff members assigned yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
