import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Users, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { StaffStatCard } from "./StaffStatCard";
import { StaffTable } from "./StaffTable";
import { EditStaffDialog } from "./EditStaffDialog";
import { RemoveStaffDialog } from "./RemoveStaffDialog";
import type { StaffMember } from "./types";

export function StaffSection() {
  const { sessionToken } = useAuth();
  const allStaff = useQuery(
    api.manager.queries.getStaffMembers,
    sessionToken ? { sessionToken } : "skip",
  );
  const branches = useQuery(
    api.manager.queries.getBranches,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading = allStaff === undefined || branches === undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "" });

  const updateStaffMutation = useMutation(api.manager.mutations.updateStaff);
  const removeStaffMutation = useMutation(api.manager.mutations.removeStaff);

  const filteredStaff = useMemo(() => {
    if (!allStaff) return [];
    let list = allStaff;
    if (roleFilter !== "all") {
      list = list.filter(
        (s: { role?: string }) => s.role?.toLowerCase() === roleFilter,
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s: { full_name?: string; email?: string }) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allStaff, roleFilter, searchQuery]);

  const metrics = useMemo(() => {
    if (!allStaff) return { total: 0, active: 0, pending: 0 };
    return {
      total: allStaff.length,
      active: allStaff.filter((s: { status: string }) => s.status === "active")
        .length,
      pending: allStaff.filter(
        (s: { status: string }) => s.status === "pending",
      ).length,
    };
  }, [allStaff]);

  const handleEditStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setActionLoading("edit");
      await updateStaffMutation({
        id: editTarget._id,
        data: { full_name: editForm.full_name.trim() },
      });
      toast.success("Staff details updated");
      setShowEditDialog(false);
      setEditTarget(null);
    } catch (err) {
      toast.error((err as Error).message || "Failed to update staff");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    const id = member._id;
    const isCurrentlyActive = member.status === "active";
    try {
      setActionLoading(id);
      await updateStaffMutation({
        id,
        data: { status: isCurrentlyActive ? "inactive" : "active" },
      });
      toast.success(
        `${member.full_name} has been ${isCurrentlyActive ? "deactivated" : "activated"}`,
      );
    } catch (err) {
      toast.error((err as Error).message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveStaff = async () => {
    if (!removeTarget) return;
    try {
      setActionLoading(removeTarget._id);
      await removeStaffMutation({ id: removeTarget._id });
      toast.success(`${removeTarget.full_name} removed`);
      setShowRemoveDialog(false);
      setRemoveTarget(null);
    } catch (err) {
      toast.error((err as Error).message || "Failed to remove staff");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display">Staff Management</h2>
          <p className="text-muted-foreground text-sm">
            Manage team and permissions
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Staff account creation is owner-only
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StaffStatCard
          title="Total Staff"
          value={metrics.total}
          icon={Users}
          color="text-primary"
        />
        <StaffStatCard
          title="Active Staff"
          value={metrics.active}
          icon={CheckCircle}
          color="text-emerald-600"
        />
        <StaffStatCard
          title="Pending"
          value={metrics.pending}
          icon={Clock}
          color="text-amber-600"
        />
      </div>

      <StaffTable
        filteredStaff={filteredStaff}
        actionLoading={actionLoading}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onToggleActive={handleToggleActive}
        onEdit={(member) => {
          setEditTarget(member);
          setEditForm({ full_name: member.full_name });
          setShowEditDialog(true);
        }}
        onRemove={(member) => {
          setRemoveTarget(member);
          setShowRemoveDialog(true);
        }}
      />

      <EditStaffDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onSubmit={handleEditStaff}
        loading={actionLoading === "edit"}
      />

      <RemoveStaffDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        targetName={removeTarget?.full_name}
        loading={Boolean(removeTarget && actionLoading === removeTarget._id)}
        onConfirm={handleRemoveStaff}
      />
    </div>
  );
}
