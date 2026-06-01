import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";
import { ChapaPaymentModal } from "@/components/shared/ChapaPaymentModal";
import { Search, Plus, Loader2 } from "lucide-react";
import {
  CartCard,
  CustomerInfoCard,
  PaymentCard,
  SummaryCard,
  CheckoutConfirmDialog,
  type CartItem,
  type Medicine,
} from "./POSOperationsParts";

export function POSOperations() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isChapaModalOpen, setIsChapaModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [confirmCheckoutOpen, setConfirmCheckoutOpen] = useState(false);

  const posCheckout = useMutation(api.cashier.mutations.posCheckout);

  const medicines = useQuery(
    api.cashier.queries.searchMedicines,
    searchQuery ? { query: searchQuery } : "skip",
  ) as Medicine[] | undefined;

  const updateQuantity = (medicineId: Id<"medicines">, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.medicineId === medicineId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const removeFromCart = (medicineId: Id<"medicines">) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(
      (item) => item.medicineId === medicine.medicine_id,
    );

    if (existingItem) {
      updateQuantity(medicine.medicine_id, existingItem.quantity + 1);
    } else {
      setCart([
        ...cart,
        {
          medicineId: medicine.medicine_id,
          medicineName: medicine.name,
          quantity: 1,
          unitPrice: medicine.price,
          stock: medicine.stock,
        },
      ]);
    }

    toast.success(`${medicine.name} added to cart`);
    setSearchQuery("");
  };

  const applyDiscount = () => {
    if (
      discountPercent < 0 ||
      discountPercent > 100 ||
      Number.isNaN(discountPercent)
    ) {
      toast.error("Discount must be between 0 and 100");
      return;
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    return { subtotal, discountAmount, total };
  };

  const { subtotal, discountAmount, total } = calculateTotals();

  const buildCheckoutPayload = (chapaResult?: any) => {
    return {
      items: cart.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      totalAmount: total,
      paymentMethod,
      customerName: customerName.trim() || undefined,
      chapaTransactionId: chapaResult?.transactionId,
      chapaPaymentMethod: chapaResult?.paymentMethod,
      chapaReference:
        chapaResult?.referenceNumber ||
        (paymentMethod !== "cash" && paymentMethod !== "chapa"
          ? referenceNumber.trim()
          : undefined),
    };
  };

  const completeCheckout = async (chapaResult?: any) => {
    setCheckoutLoading(true);
    try {
      await posCheckout(buildCheckoutPayload(chapaResult));
      toast.success("Checkout completed successfully!");
      setCart([]);
      setCustomerName("");
      setDiscountPercent(0);
      setPaymentMethod("cash");
      setReferenceNumber("");
      setIsChapaModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to complete checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (paymentMethod === "chapa") {
      setIsChapaModalOpen(true);
      return;
    }

    if (paymentMethod !== "cash" && !referenceNumber.trim()) {
      toast.error("Reference number is required for this payment method");
      return;
    }

    setConfirmCheckoutOpen(true);
  };

  const handleChapaPaymentSuccess = async (result: any) => {
    await completeCheckout(result);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">POS Operations</h2>
        <p className="text-muted-foreground">
          Process sales and manage point of sale operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Search className="h-5 w-5 mr-2" />
                Search Medicines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  placeholder="Search by name, barcode, or manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {medicines === undefined && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {medicines && medicines.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {medicines.map((medicine: Medicine) => (
                    <div
                      key={medicine.medicine_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => addToCart(medicine)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {medicine.stock} | Price: ETB{" "}
                          {medicine.price?.toFixed(2)}
                        </p>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <CartCard
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
          />
        </div>

        <div className="space-y-6">
          <CustomerInfoCard
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
          />

          <PaymentCard
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            referenceNumber={referenceNumber}
            onReferenceNumberChange={setReferenceNumber}
            discountPercent={discountPercent}
            onDiscountPercentChange={setDiscountPercent}
            onApplyDiscount={applyDiscount}
            subtotal={subtotal}
            discountAmount={discountAmount}
            total={total}
          />

          <SummaryCard
            subtotal={subtotal}
            discountAmount={discountAmount}
            total={total}
            cartLength={cart.length}
            checkoutLoading={checkoutLoading}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      <ChapaPaymentModal
        open={isChapaModalOpen}
        onClose={() => setIsChapaModalOpen(false)}
        amount={total}
        onSuccess={handleChapaPaymentSuccess}
      />

      <CheckoutConfirmDialog
        open={confirmCheckoutOpen}
        onOpenChange={setConfirmCheckoutOpen}
        total={total}
        paymentMethod={paymentMethod}
        checkoutLoading={checkoutLoading}
        onConfirm={() => completeCheckout()}
      />
    </div>
  );
}
