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
import type { Doc } from "@convex/_generated/dataModel";

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
              { label: "Phone", value: "N/A" },
              {
                label: "Date Created",
                value: new Date(owner._creationTime).toLocaleDateString(),
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
            title="Pharmacy Profile"
            icon={Building2}
            data={[
              { label: "Legal Name", value: pharmacy.name },
              { label: "Trading Name", value: pharmacy.tradingName || "N/A" },
              { label: "Type", value: pharmacy.pharmacyType || "Retail" },
              {
                label: "Year Established",
                value: pharmacy.yearEstablished?.toString() || "N/A",
              },
              {
                label: "Estimated Monthly Prescriptions",
                value:
                  pharmacy.estimatedMonthlyPrescriptions?.toString() || "N/A",
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
                value: pharmacy.billingContactEmail || "N/A",
              },
              {
                label: "Contact Phone",
                value: pharmacy.primaryContactPhone || "N/A",
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
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Plan</span>
              <Badge variant="outline">
                {pharmacy.subscriptionTier?.toUpperCase() || "BASIC"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Monthly Cost</span>
              <span className="text-sm font-semibold">
                ${pharmacy.monthlyCost || 0}/month
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

interface DetailSectionProps {
  title: string;
  icon: React.ElementType;
  data: Array<{ label: string; value: string }>;
}

function DetailSection({ title, icon: Icon, data }: DetailSectionProps) {
  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start py-2 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
              <span className="text-sm font-medium text-right ml-4">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SecurityCardProps {
  title: string;
  icon: React.ElementType;
  value: string;
  status: "active" | "warning" | "neutral";
}

function SecurityCard({ title, icon: Icon, value, status }: SecurityCardProps) {
  const statusConfig = {
    active: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      border: "border-green-500/30",
    },
    warning: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      border: "border-yellow-500/30",
    },
    neutral: {
      bg: "bg-muted/30",
      text: "text-muted-foreground",
      border: "border-border",
    },
  };

  const config = statusConfig[status];

  return (
    <Card
      className={`border-2 ${config.border} hover:border-[hsl(var(--medical-teal))]/30 transition-all duration-300`}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Icon className={`h-5 w-5 ${config.text}`} />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className={`text-lg font-semibold ${config.text}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function DocumentItem({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Uploaded</p>
        <p className="text-sm font-medium">{date}</p>
      </div>
    </div>
  );
}
