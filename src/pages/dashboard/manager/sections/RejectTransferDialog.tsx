import { useState } from "react";
import { toast } from "sonner";
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

interface RejectTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  sessionToken: string | null;
  rejectTransfer: (args: any) => Promise<any>;
}

export function RejectTransferDialog({
  open,
  onOpenChange,
  request,
  sessionToken,
  rejectTransfer,
}: RejectTransferDialogProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState(
    "Insufficient justification",
  );

  const handleSubmitRejection = async () => {
    if (!request) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      setRejectingId(request._id);
      await rejectTransfer({
        requestId: request._id,
        rejectionReason: rejectionReason.trim(),
        sessionToken: sessionToken || undefined,
      });
      toast.success("Transfer request rejected");
      onOpenChange(false);
      setRejectionReason("Insufficient justification");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject transfer");
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Transfer Request</AlertDialogTitle>
          <AlertDialogDescription>
            Add a reason to document why this request was rejected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="min-h-[110px]"
          placeholder="Provide rejection reason"
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={Boolean(rejectingId)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleSubmitRejection();
            }}
            disabled={Boolean(rejectingId)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {rejectingId ? "Rejecting..." : "Reject Request"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
