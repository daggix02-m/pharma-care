import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Calendar,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface ManagerFlagAppeal {
  id: string;
  type: "manager_flag";
  managerId: string;
  managerName: string;
  managerEmail: string;
  pharmacyId: string;
  pharmacyName: string;
  ownerId: string;
  ownerName: string;
  flaggedBy: string;
  flaggedAt: number;
  flagReason: string;
  ownerResponse: string;
  ownerRespondedAt: number | undefined;
  status: string;
}

interface AdminActionAppeal {
  id: string;
  type: "admin_action";
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  pharmacyId: string;
  pharmacyName: string;
  ownerId: string;
  ownerName: string;
  performedBy: string;
  actionType: string;
  reason: string;
  timestamp: number;
  ownerNotifiedAt: number;
  actionStatus: string;
}

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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (appeal: ManagerFlagAppeal | AdminActionAppeal) => {
    if (appeal.type === "manager_flag") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400"
        >
          Flagged
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400"
        >
          Action Active
        </Badge>
      );
    }
  };

  const renderManagerFlagCard = (appeal: ManagerFlagAppeal) => {
    const isExpanded = expandedCards.has(appeal.id);
    const isReviewing = reviewingCard === appeal.id;

    return (
      <Card
        key={appeal.id}
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
          onClick={() => toggleCard(appeal.id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">Manager Flag Appeal</CardTitle>
                {getStatusBadge(appeal)}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  {appeal.managerName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {appeal.pharmacyName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(appeal.flaggedAt)}
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
                  Flag Details
                </h4>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Flagged By:</p>
                      <p className="text-muted-foreground">
                        {appeal.flaggedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Flag Reason:</p>
                      <p className="text-muted-foreground">
                        {appeal.flagReason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Owner Response
                </h4>
                <div className="rounded-lg border bg-emerald-50/30 dark:bg-emerald-950/20 p-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Owner:</p>
                      <p className="text-muted-foreground">
                        {appeal.ownerName}
                      </p>
                    </div>
                  </div>
                  {appeal.ownerRespondedAt && (
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Responded: {formatDate(appeal.ownerRespondedAt)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      {appeal.ownerResponse}
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
                  onClick={() => setReviewingCard(appeal.id)}
                  className="flex-1 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Dismiss Flag
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewingCard(appeal.id)}
                  className="flex-1 border-red-500/50 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Keep Flag
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Review Reason (Required)
                  </label>
                  <Textarea
                    placeholder="Provide a reason for your decision..."
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReview(appeal, "approve")}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Dismiss Flag
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReview(appeal, "reject")}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Keep Flag
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReviewingCard(null);
                      setReviewReason("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderAdminActionCard = (appeal: AdminActionAppeal) => {
    const isExpanded = expandedCards.has(appeal.id);
    const isReviewing = reviewingCard === appeal.id;

    return (
      <Card
        key={appeal.id}
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
          onClick={() => toggleCard(appeal.id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <UserX className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg">Admin Action Appeal</CardTitle>
                {getStatusBadge(appeal)}
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
                  {formatDate(appeal.timestamp)}
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
                      <p className="text-muted-foreground">
                        {appeal.ownerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Notified: {formatDate(appeal.ownerNotifiedAt)}
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
                  onClick={() => setReviewingCard(appeal.id)}
                  className="flex-1 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Lift Action
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewingCard(appeal.id)}
                  className="flex-1 border-red-500/50 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Maintain Action
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Review Reason (Required)
                  </label>
                  <Textarea
                    placeholder="Provide a reason for your decision..."
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReview(appeal, "lift")}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Lift Action
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReview(appeal, "maintain")}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Maintain Action
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReviewingCard(null);
                      setReviewReason("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
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

      <Card className="border border-border/60">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <Badge variant="outline" className="justify-center py-2">
              Total Pending: {pendingAppeals.totalPending}
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Manager: {pendingAppeals.managerFlagAppeals.length}
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Admin Action: {pendingAppeals.adminActionAppeals.length}
            </Badge>
            <Badge variant="secondary" className="justify-center py-2">
              Visible: {totalVisible}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by manager, owner, pharmacy, or reason..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "manager", label: "Manager" },
                  { value: "admin", label: "Admin Action" },
                ] as const
              ).map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={
                    appealTypeFilter === option.value ? "default" : "outline"
                  }
                  onClick={() => setAppealTypeFilter(option.value)}
                  className="h-9 text-[12px]"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
                {managerAppeals.map((appeal: ManagerFlagAppeal) =>
                  renderManagerFlagCard(appeal as ManagerFlagAppeal),
                )}
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
                {adminAppeals.map((appeal: AdminActionAppeal) =>
                  renderAdminActionCard(appeal as AdminActionAppeal),
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
