import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Shield,
  Mail,
  AlertCircle,
  X,
  MapPin,
  CreditCard,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function PharmacyDetailPage() {
  const { pharmacyId } = useParams<{ pharmacyId: string }>();
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [messageData, setMessageData] = useState({ title: "", message: "" });

  const pharmacyData = useQuery(
    api.admin.queries.getPharmacyDetail,
    pharmacyId && sessionToken
      ? { pharmacyId: pharmacyId as Id<"pharmacies">, sessionToken }
      : "skip",
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
  const signupSubmission = data.signupSubmission;

  const fallbackLocation =
    data.pharmacy.signupLocation ||
    data.pharmacy.plannedBranchLocations?.[0] ||
    (data.pharmacy.address?.city && data.pharmacy.address?.country
      ? `${data.pharmacy.address.city}, ${data.pharmacy.address.country}`
      : data.pharmacy.address?.city || "Not provided");

  const primaryLocation =
    signupSubmission?.primaryLocation || fallbackLocation || "Not provided";
  const branchLocations = Array.isArray(signupSubmission?.branchLocations)
    ? signupSubmission.branchLocations
    : Array.isArray(data.pharmacy.plannedBranchLocations)
      ? data.pharmacy.plannedBranchLocations
      : [];

  const summary = {
    primaryLocation,
    branchLocations,
    plannedBranches:
      signupSubmission?.plannedBranches ?? data.pharmacy.plannedBranches ?? 0,
    submittedAt:
      signupSubmission?.submittedAt ?? data.pharmacy._creationTime ?? null,
    status: signupSubmission?.status || data.pharmacy.status || "unknown",
    selectedTier:
      signupSubmission?.selectedTier || data.pharmacy.subscriptionTier || "",
    recommendedTier:
      signupSubmission?.recommendedTier ||
      data.pharmacy.recommendedSubscriptionTier ||
      "",
    pharmacyName: signupSubmission?.pharmacyName || data.pharmacy.name,
    pharmacyEmail:
      signupSubmission?.pharmacyEmail ||
      data.pharmacy.pharmacyEmail ||
      "Not provided",
    licenseCode: signupSubmission?.licenseCode || data.pharmacy.licenseCode,
    ownerName:
      signupSubmission?.ownerName || data.owner?.full_name || "Not provided",
    ownerEmail:
      signupSubmission?.ownerEmail || data.owner?.email || "Not provided",
    ownerPhone:
      signupSubmission?.ownerPhone || data.owner?.phone || "Not provided",
    plannedStaffTotal:
      signupSubmission?.plannedStaffTotal ??
      data.pharmacy.plannedStaffTotal ??
      0,
    staffBreakdown: signupSubmission?.staffBreakdown || {
      pharmacists: data.pharmacy.plannedStaffBreakdown?.pharmacists ?? 0,
      managers: data.pharmacy.plannedStaffBreakdown?.managers ?? 0,
      cashiers: data.pharmacy.plannedStaffBreakdown?.cashiers ?? 0,
    },
    termsAccepted: signupSubmission?.termsAccepted,
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
        priority: "medium",
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
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-[hsl(var(--medical-teal))]" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
                    {summary.pharmacyName}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {summary.primaryLocation}
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
                  {summary.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {(summary.selectedTier || "not set").toLowerCase()}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Planned branches: {summary.plannedBranches}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Submitted:{" "}
                  {summary.submittedAt
                    ? new Date(summary.submittedAt).toLocaleDateString()
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
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => {
                  setActiveTab("overview");
                  setTimeout(() => {
                    document
                      .getElementById("pharmacy-registration-details")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 0);
                }}
              >
                View Submission
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto bg-muted/40 p-1.5 rounded-xl">
              <TabsTrigger value="overview" className="text-xs">
                Pharmacy
              </TabsTrigger>
              <TabsTrigger value="owner" className="text-xs">
                Owner
              </TabsTrigger>
              <TabsTrigger value="operations" className="text-xs">
                Operations
              </TabsTrigger>
              <TabsTrigger value="subscription" className="text-xs">
                Plan & Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card
                className="border-2 border-border/70"
                id="pharmacy-registration-details"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
                    Pharmacy Registration Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <InfoRow label="Pharmacy Name" value={summary.pharmacyName} />
                  <InfoRow
                    label="Pharmacy Email"
                    value={summary.pharmacyEmail || "Not provided"}
                  />
                  <InfoRow
                    label="License Code"
                    value={summary.licenseCode || "Not provided"}
                  />
                  <InfoRow
                    label="Primary Location"
                    value={summary.primaryLocation}
                  />
                  <InfoRow
                    label="Branch Locations"
                    value={
                      summary.branchLocations.length
                        ? summary.branchLocations.join(", ")
                        : summary.plannedBranches > 0
                          ? summary.primaryLocation
                          : "Not provided"
                    }
                  />
                  <InfoRow
                    label="Submitted At"
                    value={
                      summary.submittedAt
                        ? new Date(summary.submittedAt).toLocaleString()
                        : "Not provided"
                    }
                  />
                  <InfoRow label="Application Status" value={summary.status} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="owner" className="mt-4">
              <Card className="border-2 border-border/70">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
                    Owner Submission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <InfoRow label="Owner Name" value={summary.ownerName} />
                  <InfoRow label="Owner Email" value={summary.ownerEmail} />
                  <InfoRow label="Owner Phone" value={summary.ownerPhone} />
                  <InfoRow
                    label="Owner Status"
                    value={data.owner?.status || "N/A"}
                  />
                  <InfoRow
                    label="Email Verified"
                    value={data.owner?.emailVerified ? "Yes" : "No"}
                  />
                  <InfoRow
                    label="Owner Role"
                    value={data.owner?.role || "N/A"}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operations" className="mt-4">
              <Card className="border-2 border-border/70">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
                    Planned Operations (Signup)
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <InfoRow
                    label="Planned Branches"
                    value={String(summary.plannedBranches)}
                  />
                  <InfoRow
                    label="Planned Total Staff"
                    value={String(summary.plannedStaffTotal)}
                  />
                  <InfoRow
                    label="Planned Pharmacists"
                    value={String(summary.staffBreakdown.pharmacists)}
                  />
                  <InfoRow
                    label="Planned Managers"
                    value={String(summary.staffBreakdown.managers)}
                  />
                  <InfoRow
                    label="Planned Cashiers"
                    value={String(summary.staffBreakdown.cashiers)}
                  />
                  <InfoRow
                    label="Branch Locations"
                    value={
                      summary.branchLocations.length
                        ? summary.branchLocations.join(", ")
                        : summary.plannedBranches > 0
                          ? summary.primaryLocation
                          : "Not provided"
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="mt-4">
              <Card className="border-2 border-border/70">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
                    Subscription Selection (Signup)
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <InfoRow
                    label="Selected Plan"
                    value={summary.selectedTier.toUpperCase() || "NOT SET"}
                  />
                  <InfoRow
                    label="Recommended Plan"
                    value={summary.recommendedTier.toUpperCase() || "NOT SET"}
                  />
                  <InfoRow
                    label="Payment Status"
                    value={data.pharmacy.paymentStatus || "Not provided"}
                  />
                  <InfoRow
                    label="Monthly Cost"
                    value={`ETB ${data.pharmacy.monthlyCost ?? 0}`}
                  />
                  <InfoRow
                    label="Terms Accepted"
                    value={
                      summary.termsAccepted === undefined
                        ? "Not captured (legacy)"
                        : summary.termsAccepted
                          ? "Yes"
                          : "No"
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold mt-1">{value}</p>
    </div>
  );
}
