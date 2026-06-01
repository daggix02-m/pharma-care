import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SuspendPharmacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacyId: string;
  pharmacyName: string;
}

export function SuspendPharmacyDialog({
  open,
  onOpenChange,
  pharmacyId,
  pharmacyName,
}: SuspendPharmacyDialogProps) {
  const [suspendReason, setSuspendReason] = useState("");

  const suspendPharmacy = useMutation(api.admin.mutations.suspendPharmacy);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    try {
      await suspendPharmacy({ pharmacyId, reason: suspendReason });
      toast.success("Pharmacy suspended successfully");
      onOpenChange(false);
      setSuspendReason("");
    } catch (error) {
      toast.error("Failed to suspend pharmacy");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Suspend Pharmacy
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to suspend <strong>{pharmacyName}</strong>?
            This action will:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>Immediately revoke all user access</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>Disable all pharmacy operations</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>Notify the pharmacy owner</span>
            </li>
          </ul>
          <div>
            <Label htmlFor="suspend-reason">
              Reason for Suspension <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="suspend-reason"
              placeholder="Provide detailed reason for this suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSuspend}>
            <X className="h-4 w-4 mr-2" />
            Suspend Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
