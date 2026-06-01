import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ShieldAlert,
  UserX,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ManagerFlagAppealCard } from "./ManagerFlagAppealCard";
import { AdminActionAppealCard } from "./AdminActionAppealCard";
import { AppealFilters } from "./AppealFilters";
import type { ManagerFlagAppeal, AdminActionAppeal } from "./types";

export function AdminAppealReview() {
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [reviewingCard, setReviewingCard] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appealTypeFilter, setAppealTypeFilter] = useState<
    "all" | "manager" | "admin"
  >("all");
  const { sessionToken } = useAuth();

  const pendingAppeals = useQuery(
    api.admin.queries.getPendingAppeals,
    sessionToken ? { sessionToken } : "skip",
  );
  const reviewManagerFlag = useMutation(
    api.admin.mutations.reviewManagerFlagAppeal,
  );
  const reviewAdminAction = useMutation(
    api.admin.mutations.reviewAdminActionAppeal,
  );

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReview = async (
    appeal: ManagerFlagAppeal | AdminActionAppeal,
    decision: string,
  ) => {
    if (!reviewReason.trim()) {
      toast.error("Please provide a reason for your decision");
      return;
    }

    setIsSubmitting(true);

    try {
      if (appeal.type === "manager_flag") {
        await reviewManagerFlag({
          flagId: appeal.id as any,
          decision,
          reason: reviewReason,
        });
      } else {
        await reviewAdminAction({
          actionId: appeal.id as any,
          decision,
          reason: reviewReason,
        });
      }

      toast.success(
        decision === "approve" || decision === "lift"
          ? "Appeal approved successfully"
          : "Appeal rejected",
      );
      setReviewReason("");
      setReviewingCard(null);
      setExpandedCards((prev) => {
        const next = new Set(prev);
        next.delete(appeal.id);
        return next;
      });
    } catch (error) {
      toast.error("Failed to process appeal: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelReview = () => {
    setReviewingCard(null);
    setReviewReason("");
  };

  if (pendingAppeals === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const managerAppeals = (pendingAppeals.managerFlagAppeals || []).filter(
    (appeal: ManagerFlagAppeal) => {
      if (appealTypeFilter === "admin") return false;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return [
        appeal.managerName,
        appeal.managerEmail,
        appeal.pharmacyName,
        appeal.ownerName,
        appeal.flagReason,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    },
  );

  const adminAppeals = (pendingAppeals.adminActionAppeals || []).filter(
    (appeal: AdminActionAppeal) => {
      if (appealTypeFilter === "manager") return false;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return [
        appeal.targetUserName,
        appeal.targetUserEmail,
        appeal.pharmacyName,
        appeal.ownerName,
        appeal.reason,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    },
  );

  const totalVisible = managerAppeals.length + adminAppeals.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Appeal Review
        </h2>
        <p className="text-muted-foreground">
          Review and respond to appeals from pharmacy owners
        </p>
      </div>

      <AppealFilters
        totalPending={pendingAppeals.totalPending}
        managerCount={pendingAppeals.managerFlagAppeals.length}
        adminCount={pendingAppeals.adminActionAppeals.length}
        visibleCount={totalVisible}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        appealTypeFilter={appealTypeFilter}
        onAppealTypeFilterChange={setAppealTypeFilter}
      />

      {totalVisible === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldCheck className="h-16 w-16 text-emerald-600/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appeals Matched</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Adjust your filters or search query to find the appeal you need.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {managerAppeals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold">
                    Manager Flag Appeals ({managerAppeals.length})
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/admin?tab=pharmacies")}
                >
                  Open Pharmacies
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {managerAppeals.map((appeal: ManagerFlagAppeal) => (
                  <ManagerFlagAppealCard
                    key={appeal.id}
                    appeal={appeal}
                    isExpanded={expandedCards.has(appeal.id)}
                    isReviewing={reviewingCard === appeal.id}
                    reviewReason={reviewReason}
                    isSubmitting={isSubmitting}
                    onToggle={() => toggleCard(appeal.id)}
                    onStartReview={() => setReviewingCard(appeal.id)}
                    onReviewReasonChange={setReviewReason}
                    onApprove={() => handleReview(appeal, "approve")}
                    onReject={() => handleReview(appeal, "reject")}
                    onCancelReview={cancelReview}
                  />
                ))}
              </div>
            </div>
          )}

          {adminAppeals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">
                    Admin Action Appeals ({adminAppeals.length})
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/admin?tab=audit-logs")}
                >
                  View Audit Trail
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {adminAppeals.map((appeal: AdminActionAppeal) => (
                  <AdminActionAppealCard
                    key={appeal.id}
                    appeal={appeal}
                    isExpanded={expandedCards.has(appeal.id)}
                    isReviewing={reviewingCard === appeal.id}
                    reviewReason={reviewReason}
                    isSubmitting={isSubmitting}
                    onToggle={() => toggleCard(appeal.id)}
                    onStartReview={() => setReviewingCard(appeal.id)}
                    onReviewReasonChange={setReviewReason}
                    onApprove={() => handleReview(appeal, "lift")}
                    onReject={() => handleReview(appeal, "maintain")}
                    onCancelReview={cancelReview}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
