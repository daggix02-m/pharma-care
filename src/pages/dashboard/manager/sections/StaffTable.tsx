import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui";
import { cn } from "@/lib/utils";
import type { StaffMember } from "./types";

interface StaffTableProps {
  filteredStaff: StaffMember[];
  actionLoading: string | null;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  onToggleActive: (member: StaffMember) => void;
  onEdit: (member: StaffMember) => void;
  onRemove: (member: StaffMember) => void;
}

export function StaffTable({
  filteredStaff,
  actionLoading,
  searchQuery,
  onSearchQueryChange,
  roleFilter,
  onRoleFilterChange,
  onToggleActive,
  onEdit,
  onRemove,
}: StaffTableProps) {
  return (
    <Card className="minimal-card">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="pharmacist">Pharmacists</SelectItem>
              <SelectItem value="cashier">Cashiers</SelectItem>
              <SelectItem value="manager">Managers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead className="font-bold text-[11px] uppercase tracking-widest py-4">
                  Name
                </TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-widest py-4">
                  Email
                </TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-widest py-4">
                  Role
                </TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-widest py-4">
                  Status
                </TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-widest py-4 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member: StaffMember) => (
                <TableRow
                  key={member._id}
                  className="hover:bg-secondary/5 transition-colors"
                >
                  <TableCell className="font-semibold py-4">
                    {member.full_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize text-[11px] px-2"
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                      className="text-[11px] px-2"
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(member)}
                        className="h-8 w-8 rounded-lg"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleActive(member)}
                        disabled={actionLoading === member._id}
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          member.status === "active"
                            ? "text-amber-600"
                            : "text-emerald-600",
                        )}
                      >
                        {actionLoading === member._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : member.status === "active" ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(member)}
                        className="h-8 w-8 rounded-lg text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
