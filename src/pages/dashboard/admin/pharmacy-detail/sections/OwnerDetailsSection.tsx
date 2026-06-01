import {
  User,
  Shield,
  Building2,
  FileText,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/utils";
import type { Doc } from "@convex/_generated/dataModel";
import { DetailSection, SecurityCard, DocumentItem } from "./OwnerDetailsParts";

type UserType = Doc<"users">;
type Pharmacy = Doc<"pharmacies">;

interface OwnerDetailsSectionProps {
  owner: UserType;
  pharmacy: Pharmacy;
}

export function OwnerDetailsSection({
  owner,
  pharmacy,
}: OwnerDetailsSectionProps) {
  const primaryLocation =
    pharmacy.signupLocation || pharmacy.plannedBranchLocations?.[0] || "N/A";
  const plannedBreakdown = pharmacy.plannedStaffBreakdown
    ? `${pharmacy.plannedStaffBreakdown.pharmacists} pharmacists, ${pharmacy.plannedStaffBreakdown.managers} managers, ${pharmacy.plannedStaffBreakdown.cashiers} cashiers`
    : "N/A";

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/30 p-1 rounded-lg h-auto">
        <TabsTrigger
          value="personal"
          className="data-[state=active]:bg-[hsl(var(--medical-teal))] data-[state=active]:text-white"
        >
          <User className="h-4 w-4 mr-2" />
          Personal
        </TabsTrigger>
        <TabsTrigger
          value="security"
          className="data-[state=active]:bg-[hsl(var(--medical-teal))] data-[state=active]:text-white"
        >
          <Shield className="h-4 w-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger
          value="pharmacy"
          className="data-[state=active]:bg-[hsl(var(--medical-teal))] data-[state=active]:text-white"
        >
          <Building2 className="h-4 w-4 mr-2" />
          Pharmacy
        </TabsTrigger>
        <TabsTrigger
          value="billing"
          className="data-[state=active]:bg-[hsl(var(--medical-teal))] data-[state=active]:text-white"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Billing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DetailSection
            title="Personal Details"
            icon={User}
            data={[
              { label: "Full Name", value: owner.full_name },
              { label: "Email", value: owner.email },
              { label: "Phone", value: owner.phone || "N/A" },
              {
                label: "Date Created",
                value: formatDateTime(owner._creationTime),
              },
              {
                label: "Last Login",
                value: "N/A",
              },
            ]}
          />
          <DetailSection
            title="Contact & Location"
            icon={MapPin}
            data={[
              {
                label: "Primary Location",
                value: primaryLocation,
              },
              { label: "Street", value: pharmacy.address?.street || "N/A" },
              { label: "City", value: pharmacy.address?.city || "N/A" },
              { label: "State", value: pharmacy.address?.state || "N/A" },
              {
                label: "Postal Code",
                value: pharmacy.address?.postalCode || "N/A",
              },
              { label: "Country", value: pharmacy.address?.country || "N/A" },
            ]}
          />
        </div>
      </TabsContent>

      <TabsContent value="security" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SecurityCard
            title="MFA Status"
            icon={Shield}
            value={owner.mfaEnabled ? "Enabled" : "Disabled"}
            status={owner.mfaEnabled ? "active" : "warning"}
          />
          <SecurityCard
            title="Active Sessions"
            icon={User}
            value={`${owner.activeSessionsCount || 0} sessions`}
            status="neutral"
          />
          <SecurityCard
            title="Password Last Changed"
            icon={Calendar}
            value={
              owner.passwordLastChanged
                ? new Date(owner.passwordLastChanged).toLocaleDateString()
                : "Never"
            }
            status="neutral"
          />
        </div>

        <Card className="mt-6 border-2 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Admin Flagged</p>
                <p className="text-xs text-muted-foreground">
                  {owner.adminFlagged ? owner.adminFlagReason : "No flags"}
                </p>
              </div>
              <Badge variant={owner.adminFlagged ? "destructive" : "default"}>
                {owner.adminFlagged ? "Flagged" : "Clear"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Admin Locked</p>
                <p className="text-xs text-muted-foreground">
                  {owner.adminLocked ? owner.adminLockReason : "Not locked"}
                </p>
              </div>
              <Badge variant={owner.adminLocked ? "destructive" : "default"}>
                {owner.adminLocked ? "Locked" : "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pharmacy" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DetailSection
            title="Registration Snapshot"
            icon={Building2}
            data={[
              {
                label: "Legal Name",
                value: pharmacy.legalName || pharmacy.name,
              },
              { label: "Trading Name", value: pharmacy.tradingName || "N/A" },
              {
                label: "Selected Plan",
                value: pharmacy.subscriptionTier?.toUpperCase() || "BASIC",
              },
              {
                label: "Recommended Plan",
                value:
                  pharmacy.recommendedSubscriptionTier?.toUpperCase() || "N/A",
              },
              {
                label: "Submitted",
                value: formatDateTime(pharmacy._creationTime),
              },
              {
                label: "Primary Location",
                value: primaryLocation,
              },
              {
                label: "Planned Branches",
                value: pharmacy.plannedBranches?.toString() || "N/A",
              },
              {
                label: "Branch Locations",
                value: pharmacy.plannedBranchLocations?.length
                  ? pharmacy.plannedBranchLocations.join(", ")
                  : "N/A",
              },
              {
                label: "Planned Staff Total",
                value: pharmacy.plannedStaffTotal?.toString() || "N/A",
              },
              {
                label: "Planned Staff Breakdown",
                value: plannedBreakdown,
              },
            ]}
          />
          <DetailSection
            title="Regulatory Details"
            icon={FileText}
            data={[
              { label: "License Number", value: pharmacy.licenseCode || "N/A" },
              {
                label: "Issuing Authority",
                value: pharmacy.issuingAuthority || "N/A",
              },
              {
                label: "License Expiry",
                value: pharmacy.licenseExpiryDate
                  ? new Date(pharmacy.licenseExpiryDate).toLocaleDateString()
                  : "N/A",
              },
              {
                label: "Business Registration",
                value: pharmacy.businessRegistrationNumber || "N/A",
              },
              { label: "Tax ID", value: pharmacy.taxId || "N/A" },
            ]}
          />
        </div>

        <Card className="mt-6 border-2 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DocumentItem
              label="License Certificate"
              date={
                pharmacy.documentsUploadDate
                  ? new Date(pharmacy.documentsUploadDate).toLocaleDateString()
                  : "N/A"
              }
            />
            <DocumentItem
              label="Business Registration"
              date={
                pharmacy.documentsUploadDate
                  ? new Date(pharmacy.documentsUploadDate).toLocaleDateString()
                  : "N/A"
              }
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DetailSection
            title="Billing Contact"
            icon={Mail}
            data={[
              {
                label: "Billing Email",
                value:
                  pharmacy.billingContactEmail ||
                  pharmacy.pharmacyEmail ||
                  "N/A",
              },
              {
                label: "Contact Phone",
                value: pharmacy.primaryContactPhone || owner.phone || "N/A",
              },
            ]}
          />
          <DetailSection
            title="Billing Address"
            icon={MapPin}
            data={[
              {
                label: "Street",
                value:
                  pharmacy.billingAddress?.street ||
                  pharmacy.address?.street ||
                  "N/A",
              },
              {
                label: "City",
                value:
                  pharmacy.billingAddress?.city ||
                  pharmacy.address?.city ||
                  "N/A",
              },
              {
                label: "State",
                value:
                  pharmacy.billingAddress?.state ||
                  pharmacy.address?.state ||
                  "N/A",
              },
              {
                label: "Country",
                value:
                  pharmacy.billingAddress?.country ||
                  pharmacy.address?.country ||
                  "N/A",
              },
            ]}
          />
        </div>

        <Card className="mt-6 border-2 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              Billing Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Selected Plan</span>
              <Badge variant="outline">
                {pharmacy.subscriptionTier?.toUpperCase() || "BASIC"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Recommended Plan</span>
              <Badge variant="secondary">
                {pharmacy.recommendedSubscriptionTier?.toUpperCase() || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Monthly Cost</span>
              <span className="text-sm font-semibold">
                ETB {pharmacy.monthlyCost || 0}/month
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Next Billing</span>
              <span className="text-sm font-semibold">
                {pharmacy.nextBillingDate
                  ? new Date(pharmacy.nextBillingDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Payment Status</span>
              <Badge
                variant={
                  pharmacy.paymentStatus === "paid" ? "default" : "destructive"
                }
              >
                {pharmacy.paymentStatus?.toUpperCase() || "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
