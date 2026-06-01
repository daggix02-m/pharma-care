import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AppealReviewFormProps {
  reviewReason: string;
  onReviewReasonChange: (value: string) => void;
  isSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  approveLabel: string;
  rejectLabel: string;
}

export function AppealReviewForm({
  reviewReason,
  onReviewReasonChange,
  isSubmitting,
  onApprove,
  onReject,
  onCancel,
  approveLabel,
  rejectLabel,
}: AppealReviewFormProps) {
  return (
    <div className="space-y-3 pt-2 border-t">
      <div className="space-y-2">
        <label className="text-sm font-medium">Review Reason (Required)</label>
        <Textarea
          placeholder="Provide a reason for your decision..."
          value={reviewReason}
          onChange={(e) => onReviewReasonChange(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onApprove}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          {approveLabel}
        </Button>
        <Button
          size="sm"
          onClick={onReject}
          disabled={isSubmitting}
          variant="destructive"
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          {rejectLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
