import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import type { StaffForm } from "./types";

interface StaffSectionProps {
  pharmacy: any;
}

export function StaffSection({ pharmacy }: StaffSectionProps) {
  const auth = useAuth();
  const [createStaffOpen, setCreateStaffOpen] = React.useState(false);
  const [creatingStaff, setCreatingStaff] = React.useState(false);
  const [staffForm, setStaffForm] = React.useState<StaffForm>({
    full_name: "",
    email: "",
    role: "pharmacist",
    branchId: "",
  });

  const createStaff = useMutation(
    (api.owner as any).mutations.createStaffWithSetupLink,
  );

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !staffForm.full_name.trim() ||
      !staffForm.email.trim() ||
      !staffForm.branchId
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setCreatingStaff(true);
      await createStaff({
        full_name: staffForm.full_name.trim(),
        email: staffForm.email.trim(),
        role: staffForm.role,
        branchId: staffForm.branchId,
        sessionToken: auth.sessionToken || undefined,
      });
      toast.success(
        "Staff account created. Password setup link was sent by email.",
      );
      setCreateStaffOpen(false);
      setStaffForm({
        full_name: "",
        email: "",
        role: "pharmacist",
        branchId: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create staff account");
    } finally {
      setCreatingStaff(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Management</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setStaffForm((prev) => ({
                ...prev,
                branchId: pharmacy?.branches?.[0]?._id || "",
              }));
              setCreateStaffOpen(true);
            }}
          >
            Create Account
          </Button>
        </CardHeader>
        <CardContent>
          {pharmacy?.staff?.length ? (
            <div className="space-y-3">
              {pharmacy.staff
                .filter((member: any) =>
                  ["manager", "pharmacist", "cashier"].includes(member.role),
                )
                .map((member: any) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between border border-border/40 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {member.full_name || member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "secondary"
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No staff accounts yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createStaffOpen} onOpenChange={setCreateStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Staff Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input
                id="staff-name"
                value={staffForm.full_name}
                onChange={(e) =>
                  setStaffForm((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="staff-role">Role</Label>
              <select
                id="staff-role"
                value={staffForm.role}
                onChange={(e) =>
                  setStaffForm((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="manager">Manager</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="staff-branch">Branch</Label>
              <select
                id="staff-branch"
                value={staffForm.branchId}
                onChange={(e) =>
                  setStaffForm((prev) => ({
                    ...prev,
                    branchId: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select branch</option>
                {pharmacy?.branches?.map((branch: any) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateStaffOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingStaff}>
                {creatingStaff ? "Creating..." : "Create & Send Setup Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
