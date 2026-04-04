import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  ShieldAlert,
  Activity,
  Package,
  TrendingUp,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OwnerInternalMessageDialog } from "@/components/shared/messaging/OwnerInternalMessageDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export function OwnerDashboard() {
  const auth = useAuth();
  const [messageDialogOpen, setMessageDialogOpen] = React.useState(false);
  const [createStaffOpen, setCreateStaffOpen] = React.useState(false);
  const [creatingStaff, setCreatingStaff] = React.useState(false);
  const [staffForm, setStaffForm] = React.useState({
    full_name: "",
    email: "",
    role: "pharmacist",
    branchId: "",
  });
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "messaging" | "appeals" | "staff" | "branches" | "transfers"
  >("overview");
  const [delegationHoursByManager, setDelegationHoursByManager] =
    React.useState<Record<string, string>>({});
  const [delegatingManagerId, setDelegatingManagerId] = React.useState<
    string | null
  >(null);
  const [decisionLoadingId, setDecisionLoadingId] = React.useState<
    string | null
  >(null);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [selectedTransferRequest, setSelectedTransferRequest] =
    React.useState<any>(null);
  const [transferRejectReason, setTransferRejectReason] = React.useState(
    "Insufficient stock justification",
  );
  const [transferStatusFilter, setTransferStatusFilter] = React.useState("all");

  const pharmacy = useQuery(
    (api.owner as any).queries.getMyPharmacyDetail,
    auth.sessionToken ? { sessionToken: auth.sessionToken } : "skip",
  );

  const createStaff = useMutation(
    (api.owner as any).mutations.createStaffWithSetupLink,
  );

  const pendingActions = useQuery(
    (api.owner as any).queries.getPendingActions,
    activeTab === "overview" && auth.sessionToken
      ? { sessionToken: auth.sessionToken }
      : "skip",
  );

  const messages = useQuery(
    (api.owner as any).queries.getMyMessages,
    activeTab === "messaging" && auth.sessionToken
      ? { sessionToken: auth.sessionToken }
      : "skip",
  );

  const transferRequests = useQuery(
    (api as any).stockTransfers.getTransferRequestsForPharmacy,
    (activeTab === "transfers" || activeTab === "overview") && auth.sessionToken
      ? {
          sessionToken: auth.sessionToken,
          status:
            transferStatusFilter === "all" ? undefined : transferStatusFilter,
        }
      : "skip",
  );

  const delegationManagers = useQuery(
    (api as any).stockTransfers.getDelegationManagers,
    activeTab === "transfers" && auth.sessionToken
      ? { sessionToken: auth.sessionToken }
      : "skip",
  );

  const setDelegation = useMutation(
    (api as any).stockTransfers.setManagerStockApprovalDelegation,
  );
  const approveTransfer = useMutation(
    (api as any).stockTransfers.approveStockTransferRequest,
  );
  const rejectTransfer = useMutation(
    (api as any).stockTransfers.rejectStockTransferRequest,
  );

  const handleSendMessage = () => {
    setMessageDialogOpen(true);
  };

  const signupProfile = pharmacy?.signupProfile;
  const plannedBreakdown = signupProfile?.plannedStaffBreakdown
    ? `${signupProfile.plannedStaffBreakdown.pharmacists} pharmacists, ${signupProfile.plannedStaffBreakdown.managers} managers, ${signupProfile.plannedStaffBreakdown.cashiers} cashiers`
    : "N/A";

  const pharmacyIdentityRows = [
    { label: "Pharmacy Name", value: signupProfile?.name || "N/A" },
    {
      label: "Pharmacy Email",
      value: signupProfile?.pharmacyEmail || "N/A",
    },
    { label: "License Number", value: signupProfile?.licenseCode || "N/A" },
    {
      label: "Primary Location",
      value: signupProfile?.signupLocation || "N/A",
    },
  ];

  const operationsRows = [
    {
      label: "Planned Branches",
      value:
        typeof signupProfile?.plannedBranches === "number"
          ? signupProfile.plannedBranches.toString()
          : "N/A",
    },
    {
      label: "Branch Locations",
      value:
        signupProfile?.plannedBranchLocations?.length > 0
          ? signupProfile.plannedBranchLocations.join(", ")
          : "N/A",
    },
    {
      label: "Planned Staff",
      value:
        typeof signupProfile?.plannedStaffTotal === "number"
          ? signupProfile.plannedStaffTotal.toString()
          : "N/A",
    },
    {
      label: "Staff Breakdown",
      value: plannedBreakdown,
    },
  ];

  const billingRows = [
    {
      label: "Selected Tier",
      value: signupProfile?.selectedTier
        ? signupProfile.selectedTier.toUpperCase()
        : "N/A",
    },
    {
      label: "Recommended Tier",
      value: signupProfile?.recommendedTier
        ? signupProfile.recommendedTier.toUpperCase()
        : "N/A",
    },
    {
      label: "Payment Status",
      value: signupProfile?.paymentStatus
        ? signupProfile.paymentStatus.toUpperCase()
        : "N/A",
    },
    {
      label: "Submitted",
      value: signupProfile?.submittedAt
        ? formatDateTime(signupProfile.submittedAt)
        : "N/A",
    },
  ];

  const sectionCards = [
    {
      title: "Owner Account",
      rows: [
        {
          label: "Owner Name",
          value: signupProfile?.ownerName || auth.user?.full_name || "N/A",
        },
        {
          label: "Owner Email",
          value: signupProfile?.ownerEmail || auth.user?.email || "N/A",
        },
        {
          label: "Owner Phone",
          value: signupProfile?.ownerPhone || "N/A",
        },
      ],
    },
    {
      title: "Pharmacy Identity",
      rows: pharmacyIdentityRows,
    },
    {
      title: "Operations Snapshot",
      rows: operationsRows,
    },
    {
      title: "Subscription & Billing",
      rows: billingRows,
    },
  ];

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !staffForm.full_name.trim() ||
      !staffForm.email.trim() ||
      !staffForm.branchId
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setCreatingStaff(true);
      await createStaff({
        full_name: staffForm.full_name.trim(),
        email: staffForm.email.trim(),
        role: staffForm.role,
        branchId: staffForm.branchId,
        sessionToken: auth.sessionToken || undefined,
      });
      toast.success(
        "Staff account created. Password setup link was sent by email.",
      );
      setCreateStaffOpen(false);
      setStaffForm({
        full_name: "",
        email: "",
        role: "pharmacist",
        branchId: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create staff account");
    } finally {
      setCreatingStaff(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    color,
    onClick,
    actionLabel,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    change?: string;
    color?: string;
    onClick?: () => void;
    actionLabel?: string;
  }) => (
    <Card
      className={cn(
        "group transition-all duration-300 border-2 hover:border-primary/20",
        onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : "",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon
          className={cn(
            "h-5 w-5 transition-colors",
            color || "text-muted-foreground",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs mt-1",
              change.startsWith("+") ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {change} from last month
          </p>
        )}
        {actionLabel ? (
          <p className="text-[11px] font-semibold text-primary mt-2 uppercase tracking-wide">
            {actionLabel}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  const submitTransferRejection = async () => {
    if (!selectedTransferRequest) return;
    if (!transferRejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setDecisionLoadingId(selectedTransferRequest._id);
      await rejectTransfer({
        requestId: selectedTransferRequest._id,
        rejectionReason: transferRejectReason.trim(),
        sessionToken: auth.sessionToken || undefined,
      });
      toast.success("Transfer request rejected");
      setRejectDialogOpen(false);
      setSelectedTransferRequest(null);
      setTransferRejectReason("Insufficient stock justification");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject transfer");
    } finally {
      setDecisionLoadingId(null);
    }
  };

  if (pharmacy?.missingPharmacy) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle>Pharmacy record is unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-orange-900">
            <p>
              Your account is linked to a pharmacy that cannot be found right
              now.
            </p>
            <p>
              Please contact an administrator to restore or relink your pharmacy
              profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight">
            Welcome, {auth.user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            {pharmacy?.pharmacy?.name || "Your Pharmacy"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {pendingActions && pendingActions.totalCount > 0 && (
        <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <ShieldAlert className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900">
                  {pendingActions.totalCount} Action
                  {pendingActions.totalCount !== 1 ? "s" : ""} Required
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  {pendingActions.adminActions.length} admin action
                  {pendingActions.adminActions.length !== 1 ? "s" : ""},{" "}
                  {pendingActions.flaggedUsers.length} flagged user
                  {pendingActions.flaggedUsers.length !== 1 ? "s" : ""},{" "}
                  {pendingActions.lockedUsers.length} locked user
                  {pendingActions.lockedUsers.length !== 1 ? "s" : ""} need your
                  attention.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("appeals")}
                className="flex-shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          {
            id: "messaging",
            label: "Messaging",
            icon: MessageSquare,
            badge: messages?.length,
          },
          { id: "appeals", label: "Appeals & Actions", icon: ShieldAlert },
          { id: "staff", label: "Staff", icon: Users },
          { id: "branches", label: "Branches", icon: Building2 },
          { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.badge !== undefined && (
              <Badge
                variant={tab.badge > 0 ? "default" : "secondary"}
                className="ml-1"
              >
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Package}
              label="Total Branches"
              value={pharmacy?.branches?.length || 0}
              color="text-blue-600"
              onClick={() => setActiveTab("branches")}
              actionLabel="Open"
            />
            <StatCard
              icon={Users}
              label="Total Staff"
              value={pharmacy?.staff?.length || 0}
              color="text-emerald-600"
              onClick={() => setActiveTab("staff")}
              actionLabel="Manage"
            />
            <StatCard
              icon={Activity}
              label="Pending Actions"
              value={pendingActions?.totalCount || 0}
              color="text-orange-600"
              onClick={() => setActiveTab("appeals")}
              actionLabel="Review"
            />
            <StatCard
              icon={TrendingUp}
              label="Messages Sent"
              value={messages?.length || 0}
              color="text-purple-600"
              onClick={() => setActiveTab("messaging")}
              actionLabel="Inspect"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200"
                  onClick={handleSendMessage}
                >
                  <Megaphone className="h-8 w-8 text-emerald-600" />
                  <span className="font-medium">Send Internal Message</span>
                  <span className="text-xs text-muted-foreground">
                    Communicate with staff
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
                  onClick={() => setActiveTab("appeals")}
                >
                  <ShieldAlert className="h-8 w-8 text-orange-600" />
                  <span className="font-medium">Review Actions</span>
                  <span className="text-xs text-muted-foreground">
                    Manage admin requests
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
                  onClick={() => setActiveTab("branches")}
                >
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <span className="font-medium">Manage Branches</span>
                  <span className="text-xs text-muted-foreground">
                    View and edit branches
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submitted Signup Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-3">
                {sectionCards.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-xl border border-border/50 bg-gradient-to-br from-secondary/15 to-secondary/5 px-4 py-3"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80 mb-2">
                      {section.title}
                    </p>
                    <div className="space-y-2.5">
                      {section.rows.map((item) => (
                        <div key={item.label} className="space-y-0.5">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                            {item.label}
                          </p>
                          <p className="text-sm font-medium break-words">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "messaging" && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message: any) => (
                  <div
                    key={message._id}
                    className="border border-border/40 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">
                        {message.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {message.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">
                        To: {message.targetType || "All Managers"}
                      </Badge>
                      {message.isUrgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      <Badge variant="secondary">
                        Delivered:{" "}
                        {message.deliveryStatus?.filter((s: any) => s.delivered)
                          .length || 0}
                        /{message.deliveryStatus?.length || 0}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No messages sent yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleSendMessage}
                >
                  Send Your First Message
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "appeals" && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions & Appeals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingActions && pendingActions.totalCount > 0 ? (
              <div className="space-y-4">
                {pendingActions.adminActions.map((action: any) => (
                  <div
                    key={action._id}
                    className="border border-border/40 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {action.actionType.replace(/_/g, " ").toUpperCase()}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {action.reason}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {new Date(action.timestamp).toLocaleDateString()}
                          </span>
                          {!action.actionStatus?.includes("resolved") && (
                            <Badge variant="destructive">Action Required</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  No pending admin actions
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "staff" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Staff Management</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setStaffForm((prev) => ({
                  ...prev,
                  branchId: pharmacy?.branches?.[0]?._id || "",
                }));
                setCreateStaffOpen(true);
              }}
            >
              Create Account
            </Button>
          </CardHeader>
          <CardContent>
            {pharmacy?.staff?.length ? (
              <div className="space-y-3">
                {pharmacy.staff
                  .filter((member: any) =>
                    ["manager", "pharmacist", "cashier"].includes(member.role),
                  )
                  .map((member: any) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between border border-border/40 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {member.full_name || member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                        <Badge
                          variant={
                            member.status === "active" ? "default" : "secondary"
                          }
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No staff accounts yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "branches" && (
        <Card>
          <CardHeader>
            <CardTitle>Branch Management</CardTitle>
          </CardHeader>
          <CardContent>
            {pharmacy?.branches?.length ? (
              <div className="space-y-3">
                {pharmacy.branches.map((branch: any) => (
                  <div
                    key={branch._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-border/40 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {branch.address || "Address not provided"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        branch.status === "active" ? "default" : "secondary"
                      }
                    >
                      {branch.status || "unknown"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No branches found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "transfers" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manager Approval Delegation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {delegationManagers?.length ? (
                delegationManagers.map((manager: any) => {
                  const expiry = manager.stockApprovalDelegationExpiresAt;
                  const isActive =
                    manager.canApproveStockTransfers &&
                    expiry &&
                    expiry > Date.now();
                  return (
                    <div
                      key={manager._id}
                      className="rounded-lg border border-border/40 p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium">{manager.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {manager.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isActive && expiry
                            ? `Delegation expires ${formatDateTime(expiry)}`
                            : "No active delegation"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={168}
                          value={delegationHoursByManager[manager._id] || "24"}
                          onChange={(e) =>
                            setDelegationHoursByManager((prev) => ({
                              ...prev,
                              [manager._id]: e.target.value,
                            }))
                          }
                          className="h-9 w-24"
                        />
                        <Button
                          size="sm"
                          disabled={delegatingManagerId === manager._id}
                          onClick={async () => {
                            try {
                              setDelegatingManagerId(manager._id);
                              await setDelegation({
                                managerId: manager._id,
                                enabled: true,
                                durationHours: Number(
                                  delegationHoursByManager[manager._id] || "24",
                                ),
                                sessionToken: auth.sessionToken || undefined,
                              });
                              toast.success("Delegation enabled");
                            } catch (error: any) {
                              toast.error(
                                error?.message || "Failed to enable delegation",
                              );
                            } finally {
                              setDelegatingManagerId(null);
                            }
                          }}
                        >
                          Delegate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={delegatingManagerId === manager._id}
                          onClick={async () => {
                            try {
                              setDelegatingManagerId(manager._id);
                              await setDelegation({
                                managerId: manager._id,
                                enabled: false,
                                sessionToken: auth.sessionToken || undefined,
                              });
                              toast.success("Delegation revoked");
                            } catch (error: any) {
                              toast.error(
                                error?.message || "Failed to revoke delegation",
                              );
                            } finally {
                              setDelegatingManagerId(null);
                            }
                          }}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No managers found
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Transfer Approval Queue</CardTitle>
                <select
                  value={transferStatusFilter}
                  onChange={(e) => setTransferStatusFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-52"
                >
                  <option value="all">All statuses</option>
                  <option value="pending_owner">Pending Approval</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(transferRequests || []).map((request: any) => (
                <div
                  key={request._id}
                  className="rounded-lg border border-border/40 p-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {request.medicineSnapshot?.name} · {request.quantity}{" "}
                        units
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.fromBranchName} to {request.toBranchName} · by{" "}
                        {request.requesterName}
                      </p>
                    </div>
                    <Badge className="capitalize">
                      {request.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {request.status === "pending_owner" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        disabled={decisionLoadingId === request._id}
                        onClick={async () => {
                          try {
                            setDecisionLoadingId(request._id);
                            await approveTransfer({
                              requestId: request._id,
                              sessionToken: auth.sessionToken || undefined,
                            });
                            toast.success("Transfer approved and fulfilled");
                          } catch (error: any) {
                            toast.error(
                              error?.message || "Failed to approve transfer",
                            );
                          } finally {
                            setDecisionLoadingId(null);
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={decisionLoadingId === request._id}
                        onClick={() => {
                          setSelectedTransferRequest(request);
                          setTransferRejectReason(
                            "Insufficient stock justification",
                          );
                          setRejectDialogOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {!transferRequests?.length && (
                <p className="text-sm text-muted-foreground">
                  No transfer requests found.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Message Dialog */}
      <OwnerInternalMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />

      <Dialog open={createStaffOpen} onOpenChange={setCreateStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Staff Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input
                id="staff-name"
                value={staffForm.full_name}
                onChange={(e) =>
                  setStaffForm((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="staff-role">Role</Label>
              <select
                id="staff-role"
                value={staffForm.role}
                onChange={(e) =>
                  setStaffForm((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="manager">Manager</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="staff-branch">Branch</Label>
              <select
                id="staff-branch"
                value={staffForm.branchId}
                onChange={(e) =>
                  setStaffForm((prev) => ({
                    ...prev,
                    branchId: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select branch</option>
                {pharmacy?.branches?.map((branch: any) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateStaffOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingStaff}>
                {creatingStaff ? "Creating..." : "Create & Send Setup Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="owner-transfer-reason">Rejection reason</Label>
            <Textarea
              id="owner-transfer-reason"
              value={transferRejectReason}
              onChange={(e) => setTransferRejectReason(e.target.value)}
              className="min-h-[120px]"
              placeholder="Explain why this request is rejected"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void submitTransferRejection()}
              disabled={Boolean(decisionLoadingId)}
            >
              {decisionLoadingId ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
