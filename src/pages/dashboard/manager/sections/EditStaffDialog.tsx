import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: { full_name: string };
  onEditFormChange: (form: { full_name: string }) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export function EditStaffDialog({
  open,
  onOpenChange,
  editForm,
  onEditFormChange,
  onSubmit,
  loading,
}: EditStaffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>Update staff details</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-staff-name">Full Name</Label>
              <Input
                id="edit-staff-name"
                value={editForm.full_name}
                onChange={(e) =>
                  onEditFormChange({ full_name: e.target.value })
                }
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-11 px-8"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update Staff
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
