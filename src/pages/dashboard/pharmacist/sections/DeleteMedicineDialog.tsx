import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Medicine } from "./types";

interface DeleteMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
}

export function DeleteMedicineDialog({
  open,
  onOpenChange,
  medicine,
}: DeleteMedicineDialogProps) {
  const [saving, setSaving] = useState(false);
  const removeMedicine = useMutation(api.pharmacist.mutations.removeMedicine);

  const handleDelete = async () => {
    if (!medicine) return;
    try {
      setSaving(true);
      await removeMedicine({ id: medicine._id });
      toast.success("Medicine removed");
      onOpenChange(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to remove medicine";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete medicine?</AlertDialogTitle>
          <AlertDialogDescription>
            {medicine?.name} will be removed from inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            disabled={saving}
          >
            {saving ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
