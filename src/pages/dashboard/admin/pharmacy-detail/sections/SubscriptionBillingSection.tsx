import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Copy,
  DollarSign,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { PlanCard } from "./PlanCard";
import { BillingItem } from "./BillingItem";
import { PaymentRow, InvoiceRow } from "./SubscriptionHistoryRows";

type Pharmacy = Doc<"pharmacies">;

const planDetails = {
  basic: {
    name: "Basic",
    price: 0,
    branches: 1,
    users: 10,
    features: ["Basic reporting", "Email support", "3-month audit retention"],
  },
  premium: {
    name: "Premium",
    price: 299,
    branches: 5,
    users: 50,
    features: [
      "Advanced reporting",
      "Priority support",
      "12-month audit retention",
      "API access",
      "Inventory management",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 999,
    branches: "Unlimited" as const,
    users: "Unlimited" as const,
    features: [
      "Full reporting suite",
      "Dedicated support",
      "60-month audit retention",
      "Full API access",
      "Advanced inventory",
      "Multi-tenant support",
    ],
  },
};

type SubscriptionHistoryItem = Doc<"subscription_history">;
type SubscriptionPlan = Doc<"subscription_plans">;

interface SubscriptionBillingSectionProps {
  pharmacy: Pharmacy;
  subscriptionHistory: SubscriptionHistoryItem[];
  subscriptionPlans: SubscriptionPlan[];
}

export function SubscriptionBillingSection({
  pharmacy,
  subscriptionHistory,
  subscriptionPlans,
}: SubscriptionBillingSectionProps) {
  const [selectedTier, setSelectedTier] = useState(pharmacy.subscriptionTier);
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResendingPaymentLink, setIsResendingPaymentLink] = useState(false);
  const updatePharmacySubscription = useMutation(
    api.admin.mutations.updatePharmacySubscription,
  );
  const resendSubscriptionPaymentLink = useMutation(
    api.admin.mutations.resendSubscriptionPaymentLink,
  );

  const activePlans = useMemo(
    () => subscriptionPlans.filter((plan) => plan.isActive),
    [subscriptionPlans],
  );

  useEffect(() => {
    setSelectedTier(pharmacy.subscriptionTier);
  }, [pharmacy.subscriptionTier]);

  const currentPlanData = subscriptionPlans.find(
    (plan) => plan.code === pharmacy.subscriptionTier,
  );
  const currentPlan = currentPlanData
    ? {
        name: currentPlanData.name,
        price: currentPlanData.price,
        branches: currentPlanData.maxBranches,
        users: currentPlanData.maxUsers,
        features: currentPlanData.features,
      }
    : planDetails[pharmacy.subscriptionTier as keyof typeof planDetails] ||
      planDetails.basic;

  const paymentHistory = subscriptionHistory.map((record, idx) => ({
    id: String(record._id),
    date: new Date(record.createdAt).toISOString(),
    amount: record.price,
    status: "paid",
    method: "Subscription charge",
    invoice: `INV-${new Date(record.createdAt).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
  }));

  const hasSubscriptionChanged = selectedTier !== pharmacy.subscriptionTier;
  const hasPendingLink = Boolean(pharmacy.pendingPaymentLinkToken);
  const isPendingLinkExpired = Boolean(
    pharmacy.pendingPaymentLinkExpiresAt &&
    pharmacy.pendingPaymentLinkExpiresAt <= Date.now(),
  );
  const pendingPaymentLink = hasPendingLink
    ? `${window.location.origin}/subscription/finish-payment?token=${encodeURIComponent(
        pharmacy.pendingPaymentLinkToken!,
      )}`
    : null;

  const handleUpdateSubscription = async () => {
    if (!selectedTier) {
      toast.error("Please select a subscription tier");
      return;
    }

    if (!hasSubscriptionChanged) {
      toast.error("No changes detected in subscription tier");
      return;
    }

    try {
      setIsUpdating(true);
      const trimmedReason = reason.trim();
      await updatePharmacySubscription({
        pharmacyId: pharmacy._id,
        newTier: selectedTier,
        reason: trimmedReason ? trimmedReason : undefined,
      });

      toast.success("Subscription updated. Owner has been notified.");
      setReason("");
    } catch (error) {
      console.error("Failed to update subscription:", error);
      toast.error("Failed to update subscription");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendPaymentLink = async () => {
    try {
      setIsResendingPaymentLink(true);
      const result = await resendSubscriptionPaymentLink({
        pharmacyId: pharmacy._id,
      });
      toast.success(
        `Payment link sent to ${result.ownerEmail}. Expires ${new Date(
          result.paymentLinkExpiresAt,
        ).toLocaleString()}`,
      );
    } catch (error: any) {
      console.error("Failed to resend payment link:", error);
      toast.error(error?.message || "Failed to resend payment link");
    } finally {
      setIsResendingPaymentLink(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!pendingPaymentLink) {
      toast.error("No payment link is currently available");
      return;
    }

    try {
      await navigator.clipboard.writeText(pendingPaymentLink);
      toast.success("Payment link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy payment link:", error);
      toast.error("Failed to copy payment link");
    }
  };

  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-muted/30 p-1 rounded-lg h-auto">
        <TabsTrigger
          value="current"
          className="data-[state=active]:bg-[hsl(var(--medical-teal))] data-[state=active]:text-white"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Current Plan
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="data-[state=active]:bg-[hsl(var(--medical-teal))] data-[state=active]:text-white"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Payment History
        </TabsTrigger>
        <TabsTrigger
          value="invoices"
          className="data-[state=active]:bg-[hsl(var(--medical-teal))] data-[state=active]:text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Invoices
        </TabsTrigger>
      </TabsList>

      <TabsContent value="current" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlanCard plan={currentPlan} isCurrent={true} />

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
                Billing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <BillingItem label="Current Plan" value={currentPlan.name} />
                <BillingItem
                  label="Recommended Plan"
                  value={
                    pharmacy.recommendedSubscriptionTier?.toUpperCase() || "N/A"
                  }
                />
                <BillingItem
                  label="Monthly Cost"
                  value={`ETB ${pharmacy.monthlyCost || 0}`}
                />
                <BillingItem label="Billing Cycle" value="Monthly" />
                <BillingItem
                  label="Planned Branches"
                  value={pharmacy.plannedBranches?.toString() || "N/A"}
                />
                <BillingItem
                  label="Planned Staff"
                  value={pharmacy.plannedStaffTotal?.toString() || "N/A"}
                />
                <BillingItem
                  label="Next Billing Date"
                  value={
                    pharmacy.nextBillingDate
                      ? new Date(pharmacy.nextBillingDate).toLocaleDateString()
                      : "N/A"
                  }
                />
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Status
                    </p>
                    <Badge
                      variant={
                        pharmacy.paymentStatus === "paid"
                          ? "default"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      {pharmacy.paymentStatus?.toUpperCase() || "N/A"}
                    </Badge>

                    {pharmacy.paymentStatus !== "paid" &&
                      pharmacy.pendingPaymentLinkSentAt &&
                      pharmacy.pendingPaymentLinkExpiresAt && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] text-muted-foreground">
                              Link status:
                            </p>
                            <Badge
                              variant={
                                isPendingLinkExpired
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-[10px] uppercase"
                            >
                              {isPendingLinkExpired ? "Expired" : "Active"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Last payment link sent:{" "}
                            {new Date(
                              pharmacy.pendingPaymentLinkSentAt,
                            ).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Link expires:{" "}
                            {new Date(
                              pharmacy.pendingPaymentLinkExpiresAt,
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                  </div>
                  {pharmacy.paymentStatus !== "paid" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyPaymentLink}
                        disabled={!pendingPaymentLink}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy Payment Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResendPaymentLink}
                        disabled={isResendingPaymentLink}
                      >
                        {isResendingPaymentLink ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Resend Payment Link
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-2 border-[hsl(var(--medical-teal))]/20 bg-gradient-to-br from-background to-[hsl(var(--medical-teal))]/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              Plan Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentPlan.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                >
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-2 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Update Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subscription-tier">Select Plan</Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger id="subscription-tier" className="w-full">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {activePlans.map((plan) => (
                    <SelectItem key={plan._id} value={plan.code}>
                      {plan.name} - ETB {plan.price}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription-reason">Reason (Optional)</Label>
              <Textarea
                id="subscription-reason"
                rows={3}
                placeholder="Provide context for this subscription change"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 text-sm">
              <span className="text-muted-foreground">Current tier:</span>
              <Badge variant="outline" className="font-medium">
                {pharmacy.subscriptionTier}
              </Badge>
            </div>

            <Button
              onClick={handleUpdateSubscription}
              disabled={isUpdating || !hasSubscriptionChanged}
              className="w-full"
            >
              {isUpdating ? "Updating subscription..." : "Update Subscription"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invoices" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <InvoiceRow key={payment.id} payment={payment} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
