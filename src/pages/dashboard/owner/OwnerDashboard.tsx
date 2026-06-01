import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  ShieldAlert,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OwnerInternalMessageDialog } from "@/components/shared/messaging/OwnerInternalMessageDialog";
import { cn } from "@/lib/utils";
import type { OwnerTab } from "./sections/types";
import { OverviewSection } from "./sections/OverviewSection";
import { MessagingSection } from "./sections/MessagingSection";
import { AppealsSection } from "./sections/AppealsSection";
import { StaffSection } from "./sections/StaffSection";
import { BranchesSection } from "./sections/BranchesSection";
import { TransfersSection } from "./sections/TransfersSection";

const TABS: { id: OwnerTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "appeals", label: "Appeals & Actions", icon: ShieldAlert },
  { id: "staff", label: "Staff", icon: Users },
  { id: "branches", label: "Branches", icon: Building2 },
  { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
];

export function OwnerDashboard() {
  const auth = useAuth();
  const [messageDialogOpen, setMessageDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<OwnerTab>("overview");

  const pharmacy = useQuery(
    (api.owner as any).queries.getMyPharmacyDetail,
    auth.sessionToken ? { sessionToken: auth.sessionToken } : "skip",
  );

  const pendingActions = useQuery(
    (api.owner as any).queries.getPendingActions,
    auth.sessionToken ? { sessionToken: auth.sessionToken } : "skip",
  );

  const messages = useQuery(
    (api.owner as any).queries.getMyMessages,
    auth.sessionToken ? { sessionToken: auth.sessionToken } : "skip",
  );

  if (pharmacy?.missingPharmacy) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-900">
              Your account is linked to a pharmacy that cannot be found right
              now. Please contact an administrator to restore or relink your
              pharmacy profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            onClick={() => setMessageDialogOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

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

      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.id === "messaging" && messages !== undefined && (
              <Badge
                variant={messages.length > 0 ? "default" : "secondary"}
                className="ml-1"
              >
                {messages.length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewSection
          pharmacy={pharmacy}
          pendingActions={pendingActions}
          messagesCount={messages?.length || 0}
          onNavigateTab={setActiveTab}
          onSendMessage={() => setMessageDialogOpen(true)}
        />
      )}
      {activeTab === "messaging" && (
        <MessagingSection
          messages={messages}
          onSendMessage={() => setMessageDialogOpen(true)}
        />
      )}
      {activeTab === "appeals" && (
        <AppealsSection pendingActions={pendingActions} />
      )}
      {activeTab === "staff" && <StaffSection pharmacy={pharmacy} />}
      {activeTab === "branches" && <BranchesSection pharmacy={pharmacy} />}
      {activeTab === "transfers" && <TransfersSection />}

      <OwnerInternalMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </div>
  );
}
