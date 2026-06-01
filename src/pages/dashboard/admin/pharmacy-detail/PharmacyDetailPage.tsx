import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, Mail, X, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { PharmacySummary, OwnerInfo, PharmacyDetailData } from "./types";
import { OverviewTabContent } from "./OverviewTabContent";
import { OwnerTabContent } from "./OwnerTabContent";
import { OperationsTabContent } from "./OperationsTabContent";
import { SubscriptionTabContent } from "./SubscriptionTabContent";
import { SuspendPharmacyDialog } from "./SuspendPharmacyDialog";
import { SendMessageDialog } from "./SendMessageDialog";

function buildSummary(data: PharmacyDetailData): PharmacySummary {
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

  return {
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
}

function extractOwnerInfo(
  data: PharmacyDetailData,
): OwnerInfo | null | undefined {
  if (!data.owner) return data.owner;
  return {
    status: data.owner.status,
    emailVerified: data.owner.emailVerified,
    role: data.owner.role,
  };
}

export function PharmacyDetailPage() {
  const { pharmacyId } = useParams<{ pharmacyId: string }>();
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);

  const pharmacyData = useQuery(
    api.admin.queries.getPharmacyDetail,
    pharmacyId && sessionToken
      ? { pharmacyId: pharmacyId as Id<"pharmacies">, sessionToken }
      : "skip",
  );

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
  const summary = buildSummary(data);
  const ownerInfo = extractOwnerInfo(data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(var(--medical-teal))]/5">
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
              <OverviewTabContent summary={summary} />
            </TabsContent>

            <TabsContent value="owner" className="mt-4">
              <OwnerTabContent summary={summary} owner={ownerInfo} />
            </TabsContent>

            <TabsContent value="operations" className="mt-4">
              <OperationsTabContent summary={summary} />
            </TabsContent>

            <TabsContent value="subscription" className="mt-4">
              <SubscriptionTabContent
                summary={summary}
                paymentStatus={data.pharmacy.paymentStatus}
                monthlyCost={data.pharmacy.monthlyCost}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <SuspendPharmacyDialog
        open={suspendDialog}
        onOpenChange={setSuspendDialog}
        pharmacyId={pharmacyId!}
        pharmacyName={data.pharmacy.name}
      />

      <SendMessageDialog
        open={messageDialog}
        onOpenChange={setMessageDialog}
        pharmacyId={pharmacyId!}
        pharmacyName={data.pharmacy.name}
      />
    </div>
  );
}
