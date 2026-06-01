import {
  UserX,
  UserCheck,
  Building2,
  Calendar,
  FileText,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import { AppealReviewForm } from "./AppealReviewForm";
import type { AdminActionAppeal } from "./types";

interface AdminActionAppealCardProps {
  appeal: AdminActionAppeal;
  isExpanded: boolean;
  isReviewing: boolean;
  reviewReason: string;
  isSubmitting: boolean;
  onToggle: () => void;
  onStartReview: () => void;
  onReviewReasonChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onCancelReview: () => void;
}

function StatusBadge() {
  return (
    <Badge
      variant="outline"
      className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400"
    >
      Action Active
    </Badge>
  );
}

export function AdminActionAppealCard({
  appeal,
  isExpanded,
  isReviewing,
  reviewReason,
  isSubmitting,
  onToggle,
  onStartReview,
  onReviewReasonChange,
  onApprove,
  onReject,
  onCancelReview,
}: AdminActionAppealCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded && "ring-2 ring-emerald-500/20",
      )}
    >
      <CardHeader
        className={cn(
          "cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20",
          "transition-colors",
        )}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <UserX className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Admin Action Appeal</CardTitle>
              <StatusBadge />
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                {appeal.targetUserName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {appeal.pharmacyName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDateTime(appeal.timestamp)}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Action Details
              </h4>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <UserX className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Action Type:</p>
                    <p className="text-muted-foreground">
                      {appeal.actionType === "flag_for_review"
                        ? "Flag for Review"
                        : "Temporary Lock"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <UserCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Performed By:</p>
                    <p className="text-muted-foreground">
                      {appeal.performedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Reason:</p>
                    <p className="text-muted-foreground">{appeal.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Notification Status
              </h4>
              <div className="rounded-lg border bg-emerald-50/30 dark:bg-emerald-950/20 p-3 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <UserCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Owner:</p>
                    <p className="text-muted-foreground">{appeal.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Notified: {formatDateTime(appeal.ownerNotifiedAt)}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Status:{" "}
                    <span className="font-medium">{appeal.actionStatus}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isReviewing ? (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onStartReview}
                className="flex-1 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Lift Action
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onStartReview}
                className="flex-1 border-red-500/50 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Maintain Action
              </Button>
            </div>
          ) : (
            <AppealReviewForm
              reviewReason={reviewReason}
              onReviewReasonChange={onReviewReasonChange}
              isSubmitting={isSubmitting}
              onApprove={onApprove}
              onReject={onReject}
              onCancel={onCancelReview}
              approveLabel="Lift Action"
              rejectLabel="Maintain Action"
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
