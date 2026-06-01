import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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

interface RejectApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (reason: string) => Promise<void>;
}

export function RejectApplicationDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: RejectApplicationDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const rejectionReasonTrimmed = rejectionReason.trim();
  const isReasonValid = rejectionReasonTrimmed.length >= 10;

  const handleSubmit = async () => {
    if (!isReasonValid) {
      setReasonError("Rejection reason must be at least 10 characters.");
      return;
    }
    setReasonError("");
    await onSubmit(rejectionReasonTrimmed);
    setRejectionReason("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Application</AlertDialogTitle>
          <AlertDialogDescription>
            A rejection reason is required and will be recorded for future
            applications.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rejection reason *</label>
          <Textarea
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (reasonError) {
                setReasonError("");
              }
            }}
            placeholder="Describe what requirements were not met and what must be corrected"
            className="min-h-[120px]"
          />
          {reasonError && (
            <p className="text-xs font-medium text-destructive">
              {reasonError}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            disabled={isSubmitting || !isReasonValid}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Rejecting...
              </span>
            ) : (
              "Reject Application"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
