import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { Clock, Check, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface PendingPayment {
  _id: Id<"sales">;
  _creationTime: number;
  totalAmount: number;
  pharmacistName?: string;
  items: Array<{
    medicineId: Id<"medicines">;
    quantity: number;
    price: number;
  }>;
  status: string;
}

export function PendingPayments() {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<Id<"sales"> | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");

  const { sessionToken } = useAuth();
  const paymentsQuery = useQuery(
    api.cashier.queries.getPendingPayments,
    sessionToken ? { sessionToken } : "skip",
  );
  const payments: PendingPayment[] =
    (paymentsQuery as PendingPayment[] | undefined) || [];

  const processPayment = useMutation(api.cashier.mutations.processPayment);

  const handleProcessPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPayment) return;

    try {
      setActionLoading(selectedPayment._id);

      await processPayment({
        saleId: selectedPayment._id,
        amount: selectedPayment.totalAmount,
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber || undefined,
      });

      toast.success("Payment processed successfully!");
      setPaymentMethod("cash");
      setReferenceNumber("");
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setActionLoading(null);
    }
  };

  const openProcessModal = (payment: PendingPayment) => {
    setSelectedPayment(payment);
  };

  const getStatusBadge = (status: string) => {
    return status === "pending_payment" ? (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        Pending Payment
      </Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        <Check className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pending Payments</h2>
        <p className="text-muted-foreground">
          Process pending payments from sales created by pharmacists
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending Payments
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({payments.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2 md:grid-cols-3">
            <Button variant="outline" onClick={() => navigate("/cashier/pos")}>
              Open POS
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/sales")}
            >
              Transactions
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/receipts")}
            >
              Receipts
            </Button>
          </div>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending payments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium break-all">
                        Sale #{payment._id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.pharmacistName || "Unknown"} ·{" "}
                        {payment.items?.length || 0} items
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment._creationTime
                          ? new Date(payment._creationTime).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">
                        ETB {payment.totalAmount?.toFixed(2)}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openProcessModal(payment)}
                      disabled={actionLoading === payment._id}
                      className="w-full sm:w-auto"
                    >
                      {actionLoading === payment._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      <span className="ml-2">Process</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPayment && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Process Payment - Sale #{selectedPayment._id}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProcessPayment}>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-3">Sale Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        ETB {selectedPayment.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="text-lg font-medium">
                        {selectedPayment.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="mobile">Mobile Payment</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter reference number"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedPayment(null);
                      setPaymentMethod("cash");
                      setReferenceNumber("");
                    }}
                    disabled={actionLoading !== null}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading !== null}>
                    {actionLoading === selectedPayment._id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Process Payment
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
