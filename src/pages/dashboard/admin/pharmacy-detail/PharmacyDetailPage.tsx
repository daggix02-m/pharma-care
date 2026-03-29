import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Shield,
  Activity,
  Mail,
  FileText,
  AlertCircle,
  X,
  ChevronDown,
  ChevronRight,
  User,
  MapPin,
  CreditCard,
  Clock,
  Users,
} from "lucide-react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { PharmacyOverviewSection } from "./sections/PharmacyOverviewSection";
import { OwnerDetailsSection } from "./sections/OwnerDetailsSection";
import { ManagersSection } from "./sections/ManagersSection";
import { StaffSection } from "./sections/StaffSection";
import { BranchesSection } from "./sections/BranchesSection";
import { SubscriptionBillingSection } from "./sections/SubscriptionBillingSection";
import { AuditLogSection } from "./sections/AuditLogSection";
import { HistoryPageSection } from "./sections/HistoryPageSection";
import { DiagnosticSessionsSection } from "./sections/DiagnosticSessionsSection";

export function PharmacyDetailPage() {
  const { pharmacyId } = useParams<{ pharmacyId: string }>();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview", "owner"]),
  );
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [messageData, setMessageData] = useState({ title: "", message: "" });

  const pharmacyData = useQuery(
    api.admin.queries.getPharmacyDetail,
    pharmacyId ? { pharmacyId: pharmacyId as Id<"pharmacies"> } : "skip",
  );

  const suspendPharmacy = useMutation(api.admin.mutations.suspendPharmacy);
  const sendBroadcast = useMutation(api.admin.mutations.sendAdminBroadcast);

  if (pharmacyData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[hsl(var(--medical-teal))]/20 rounded-full animate-spin" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[hsl(var(--medical-teal))] rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading pharmacy details...</p>
        </div>
      </div>
    );
  }

  if (pharmacyData === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Error Loading Pharmacy
            </h3>
            <p className="text-muted-foreground mb-4">Pharmacy not found</p>
            <Button
              onClick={() => navigate("/admin?tab=pharmacies")}
              variant="outline"
            >
              Back to Pharmacies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = pharmacyData;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    if (!pharmacyId) {
      toast.error("Pharmacy ID is required");
      return;
    }

    try {
      await suspendPharmacy({ pharmacyId, reason: suspendReason });
      toast.success("Pharmacy suspended successfully");
      setSuspendDialog(false);
      setSuspendReason("");
    } catch (error) {
      toast.error("Failed to suspend pharmacy");
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageData.title.trim() || !messageData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!pharmacyId) {
      toast.error("Pharmacy ID is required");
      return;
    }

    try {
      await sendBroadcast({
        targetType: "specific_pharmacy",
        targetIds: [pharmacyId],
        messageType: "announcement",
        title: messageData.title,
        message: messageData.message,
      });
      toast.success("Message sent successfully");
      setMessageDialog(false);
      setMessageData({ title: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(var(--medical-teal))]/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-[hsl(var(--medical-teal))]" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
                    {data.pharmacy.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {data.pharmacy.address?.city},{" "}
                    {data.pharmacy.address?.country}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                <Badge
                  variant={
                    data.pharmacy.status === "active"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs font-semibold px-3 py-1"
                >
                  {data.pharmacy.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {data.pharmacy.subscriptionTier}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {data.branches.length} branches
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  Last active:{" "}
                  {data.pharmacy._creationTime
                    ? new Date(data.pharmacy._creationTime).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setMessageDialog(true)}
                variant="outline"
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Message
              </Button>
              <Button
                onClick={() => setSuspendDialog(true)}
                variant="destructive"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Suspend
              </Button>
              <Button variant="ghost" className="gap-2">
                <FileText className="h-4 w-4" />
                Diagnostic View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-4 max-w-7xl">
          <CollapsibleSection
            id="overview"
            title="Pharmacy Overview"
            icon={Building2}
            expanded={expandedSections.has("overview")}
            onToggle={() => toggleSection("overview")}
          >
            <PharmacyOverviewSection
              pharmacy={data.pharmacy}
              branches={data.branches}
            />
          </CollapsibleSection>

          <CollapsibleSection
            id="owner"
            title="Owner Details"
            icon={Shield}
            expanded={expandedSections.has("owner")}
            onToggle={() => toggleSection("owner")}
          >
            <OwnerDetailsSection owner={data.owner!} pharmacy={data.pharmacy} />
          </CollapsibleSection>

          <CollapsibleSection
            id="managers"
            title="Managers"
            icon={Users}
            count={data.managers.length}
            expanded={expandedSections.has("managers")}
            onToggle={() => toggleSection("managers")}
          >
            <ManagersSection managers={data.managers} />
          </CollapsibleSection>

          <CollapsibleSection
            id="staff"
            title="Staff"
            icon={User}
            count={data.staff.length}
            expanded={expandedSections.has("staff")}
            onToggle={() => toggleSection("staff")}
          >
            <StaffSection staff={data.staff} />
          </CollapsibleSection>

          <CollapsibleSection
            id="branches"
            title="Branches"
            icon={Building2}
            count={data.branches.length}
            expanded={expandedSections.has("branches")}
            onToggle={() => toggleSection("branches")}
          >
            <BranchesSection branches={data.branches} />
          </CollapsibleSection>

          <CollapsibleSection
            id="subscription"
            title="Subscription & Billing"
            icon={CreditCard}
            expanded={expandedSections.has("subscription")}
            onToggle={() => toggleSection("subscription")}
          >
            <SubscriptionBillingSection
              pharmacy={data.pharmacy}
              subscriptionHistory={data.subscriptionHistory || []}
              subscriptionPlans={data.subscriptionPlans || []}
            />
          </CollapsibleSection>

          <CollapsibleSection
            id="audit"
            title="Audit Log"
            icon={FileText}
            expanded={expandedSections.has("audit")}
            onToggle={() => toggleSection("audit")}
          >
            <AuditLogSection logs={data.auditLogs} />
          </CollapsibleSection>

          <CollapsibleSection
            id="history"
            title="History Page"
            icon={Clock}
            expanded={expandedSections.has("history")}
            onToggle={() => toggleSection("history")}
          >
            <HistoryPageSection
              pharmacyId={pharmacyId ?? ""}
              auditLogs={data.auditLogs || []}
              subscriptionHistory={data.subscriptionHistory || []}
            />
          </CollapsibleSection>

          <CollapsibleSection
            id="diagnostic"
            title="Diagnostic Sessions"
            icon={Activity}
            expanded={expandedSections.has("diagnostic")}
            onToggle={() => toggleSection("diagnostic")}
          >
            <DiagnosticSessionsSection
              sessions={data.diagnosticSessions || []}
            />
          </CollapsibleSection>
        </div>
      </div>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Suspend Pharmacy
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend{" "}
              <strong>{data.pharmacy.name}</strong>? This action will:
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
                Reason for Suspension{" "}
                <span className="text-destructive">*</span>
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
            <Button variant="outline" onClick={() => setSuspendDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              <X className="h-4 w-4 mr-2" />
              Suspend Pharmacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
              Send Message to Pharmacy
            </DialogTitle>
            <DialogDescription>
              Send a message to <strong>{data.pharmacy.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="message-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="message-title"
                placeholder="Message title..."
                value={messageData.title}
                onChange={(e) =>
                  setMessageData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="message-content">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message-content"
                placeholder="Type your message here..."
                value={messageData.message}
                onChange={(e) =>
                  setMessageData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={6}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon: Icon,
  count,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <Card className="overflow-hidden border-2 border-border hover:border-[hsl(var(--medical-teal))]/30 transition-all duration-300">
      <CardHeader
        className={cn(
          "cursor-pointer hover:bg-muted/50 transition-colors duration-200",
          expanded && "border-b bg-muted/30",
        )}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg transition-all duration-300",
                expanded
                  ? "bg-[hsl(var(--medical-teal))] text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {count !== undefined && (
              <Badge variant="secondary" className="ml-2 font-semibold">
                {count}
              </Badge>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "transition-all duration-300",
              expanded
                ? "bg-[hsl(var(--medical-teal))] text-white border-[hsl(var(--medical-teal))]"
                : "text-muted-foreground",
            )}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Badge>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-6 animate-in slide-in-from-top-2 duration-300">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
