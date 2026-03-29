import {
  CreditCard,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Doc } from "@convex/_generated/dataModel";

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

type PlanDetails = typeof planDetails;
type PlanKey = keyof PlanDetails;
type Plan = PlanDetails[PlanKey];

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
          {/* Current Plan Card */}
          <PlanCard plan={currentPlan} isCurrent={true} />

          {/* Billing Details */}
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
                  label="Monthly Cost"
                  value={`$${pharmacy.monthlyCost || 0}`}
                />
                <BillingItem label="Billing Cycle" value="Monthly" />
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
                <div className="flex items-center justify-between">
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
                  </div>
                  {pharmacy.paymentStatus !== "paid" && (
                    <Button size="sm">Pay Now</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
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

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
}

function PlanCard({ plan, isCurrent }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "border-2",
        isCurrent
          ? "border-[hsl(var(--medical-teal))] shadow-lg"
          : "border-border",
      )}
    >
      <CardHeader
        className={cn(
          "pb-4",
          isCurrent &&
            "bg-gradient-to-r from-[hsl(var(--medical-teal))] to-[hsl(var(--medical-teal))]/80",
        )}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn("text-lg font-semibold", isCurrent && "text-white")}
          >
            {plan.name} Plan
          </CardTitle>
          {isCurrent && (
            <Badge className="bg-white text-[hsl(var(--medical-teal))]">
              Current
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <span className={cn("text-3xl font-bold", isCurrent && "text-white")}>
            ${plan.price}
          </span>
          <span
            className={cn(
              "text-sm text-muted-foreground ml-1",
              isCurrent && "text-white/80",
            )}
          >
            /month
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Branches" value={plan.branches} />
          <StatItem label="Users" value={plan.users} />
        </div>
        <div className="space-y-2 pt-3 border-t border-border/50">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Includes:
          </p>
          {plan.features.slice(0, 3).map((feature: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BillingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

interface PaymentRowProps {
  payment: {
    id: string;
    date: string;
    amount: number;
    status: string;
    method: string;
    invoice: string;
  };
}

function PaymentRow({ payment }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-medium">{payment.invoice}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(payment.date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold">${payment.amount}</p>
          <p className="text-xs text-muted-foreground">{payment.method}</p>
        </div>
        <Badge
          variant={payment.status === "paid" ? "default" : "destructive"}
          className="text-xs"
        >
          {payment.status}
        </Badge>
      </div>
    </div>
  );
}

function InvoiceRow({ payment }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
          <p className="text-sm font-medium">{payment.invoice}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(payment.date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant={payment.status === "paid" ? "default" : "destructive"}
          className="text-xs"
        >
          {payment.status}
        </Badge>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          PDF
        </Button>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
