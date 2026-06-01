import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChapaPaymentModal } from "@/components/shared/ChapaPaymentModal";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";

export function FinishPaymentPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [openModal, setOpenModal] = useState(false);
  const [completed, setCompleted] = useState(false);

  const paymentDetails = useQuery(
    (api.subscription as any).queries.getPaymentLinkDetails,
    token ? { token } : "skip",
  );

  const completePayment = useMutation(
    (api.subscription as any).mutations.completePaymentFromLink,
  );

  const state = useMemo(() => {
    if (!token) return "missing_token";
    if (paymentDetails === undefined) return "loading";
    if (!paymentDetails.valid) return paymentDetails.reason || "invalid";
    return "ready";
  }, [paymentDetails, token]);

  const handleSuccess = async (result: any) => {
    if (!token) return;
    try {
      await completePayment({
        token,
        chapaTransactionId: result.transactionId,
        chapaReference: result.referenceNumber,
        chapaPaymentMethod: result.paymentMethod,
      });
      setOpenModal(false);
      setCompleted(true);
      toast.success("Payment completed successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete payment.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Finish Subscription Payment
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your approved pharmacy subscription payment securely via
            Chapa.
          </p>
        </div>

        {state === "loading" && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Loading payment details...
            </CardContent>
          </Card>
        )}

        {state === "missing_token" && (
          <Card className="border-destructive/30">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Missing payment token
                </p>
                <p className="text-sm text-muted-foreground">
                  Please open the finish-payment link from your email.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {state !== "loading" &&
          state !== "ready" &&
          state !== "missing_token" && (
            <Card className="border-destructive/30">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    Payment link is not valid
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This link may be expired or already used. Contact support
                    for a new link.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        {state === "ready" && paymentDetails?.paymentLink && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Pharmacy:</span>{" "}
                  {paymentDetails.pharmacy?.name || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Plan:</span>{" "}
                  <Badge variant="secondary" className="uppercase ml-1">
                    {paymentDetails.paymentLink.planCode}
                  </Badge>
                </p>
                <p>
                  <span className="font-semibold">Amount:</span>{" "}
                  {paymentDetails.paymentLink.currency}{" "}
                  {paymentDetails.paymentLink.amount}
                </p>
                <p>
                  <span className="font-semibold">Expires:</span>{" "}
                  {new Date(
                    paymentDetails.paymentLink.expiresAt,
                  ).toLocaleString()}
                </p>
              </div>

              {!completed ? (
                <Button className="w-full" onClick={() => setOpenModal(true)}>
                  Pay with Chapa
                </Button>
              ) : (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Payment complete
                    </p>
                    <p className="text-xs text-emerald-700/80">
                      Your subscription is now active. You can sign in and
                      continue.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>

      {state === "ready" && paymentDetails?.paymentLink && (
        <ChapaPaymentModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          amount={paymentDetails.paymentLink.amount}
          onSuccess={handleSuccess}
        />
      )}
    </AuthLayout>
  );
}
