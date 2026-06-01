"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Pharmacy } from "./types";

interface DeletePharmacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacy: Pharmacy | null;
  onConfirm: (id: string) => void;
}

export function DeletePharmacyDialog({
  open,
  onOpenChange,
  pharmacy,
  onConfirm,
}: DeletePharmacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Pharmacy</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{pharmacy?.name}&quot;? This
            action cannot be undone. This action is not available for admin
            role.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 py-4 bg-destructive/10 rounded-lg p-4">
          <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Warning</p>
            <p className="text-muted-foreground">
              This will permanently delete the pharmacy and all its staff data.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => pharmacy && onConfirm(pharmacy.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
