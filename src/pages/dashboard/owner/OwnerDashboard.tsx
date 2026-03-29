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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwnerInternalMessageDialog } from "@/components/shared/messaging/OwnerInternalMessageDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
    "overview" | "messaging" | "appeals" | "staff" | "branches"
  >("overview");

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

  const handleSendMessage = () => {
    setMessageDialogOpen(true);
  };

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
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    change?: string;
    color?: string;
  }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
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
      </CardContent>
    </Card>
  );

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
            />
            <StatCard
              icon={Users}
              label="Total Staff"
              value={pharmacy?.staff?.length || 0}
              color="text-emerald-600"
            />
            <StatCard
              icon={Activity}
              label="Pending Actions"
              value={pendingActions?.totalCount || 0}
              color="text-orange-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Messages Sent"
              value={messages?.length || 0}
              color="text-purple-600"
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
    </div>
  );
}
