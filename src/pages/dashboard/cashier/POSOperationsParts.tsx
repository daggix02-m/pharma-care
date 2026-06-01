import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Id } from "@convex/_generated/dataModel";
import {
  Trash2,
  ShoppingCart,
  Loader2,
  DollarSign,
  Percent,
  CheckCircle,
  User,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface CartItem {
  medicineId: Id<"medicines">;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  stock: number;
}

interface Medicine {
  medicine_id: Id<"medicines">;
  medicine_name: string;
  unit_price: number;
  stock: number;
  category?: string;
  manufacturer?: string;
  dosage?: string;
  _id: Id<"medicines">;
  _creationTime: number;
  name: string;
  price: number;
}

interface CartCardProps {
  cart: CartItem[];
  onUpdateQuantity: (medicineId: Id<"medicines">, newQuantity: number) => void;
  onRemoveFromCart: (medicineId: Id<"medicines">) => void;
}

export function CartCard({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
}: CartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({cart.length} items)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.medicineId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.medicineName}</p>
                  <p className="text-sm text-muted-foreground">
                    ETB {item.unitPrice?.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onUpdateQuantity(item.medicineId, item.quantity - 1)
                    }
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onUpdateQuantity(item.medicineId, item.quantity + 1)
                    }
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveFromCart(item.medicineId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CustomerInfoCardProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
}

export function CustomerInfoCard({
  customerName,
  onCustomerNameChange,
}: CustomerInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Customer Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentCardProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  referenceNumber: string;
  onReferenceNumberChange: (value: string) => void;
  discountPercent: number;
  onDiscountPercentChange: (value: number) => void;
  onApplyDiscount: () => void;
  subtotal: number;
  discountAmount: number;
  total: number;
}

export function PaymentCard({
  paymentMethod,
  onPaymentMethodChange,
  referenceNumber,
  onReferenceNumberChange,
  discountPercent,
  onDiscountPercentChange,
  onApplyDiscount,
}: PaymentCardProps) {
  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, React.ElementType> = {
      cash: DollarSign,
      card: CreditCard,
      mobile: CreditCard,
      bank_transfer: CreditCard,
    };
    return icons[method] || DollarSign;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["cash", "card", "mobile", "bank_transfer", "chapa"].map(
              (method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => onPaymentMethodChange(method)}
                  className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === method
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {React.createElement(getPaymentMethodIcon(method), {
                      className: "h-4 w-4",
                    })}
                    <span className="capitalize">
                      {method.replace("_", " ")}
                    </span>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {paymentMethod !== "cash" && paymentMethod !== "chapa" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Reference Number
            </label>
            <Input
              placeholder="Enter reference number"
              value={referenceNumber}
              onChange={(e) => onReferenceNumberChange(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Discount (%)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) =>
                  onDiscountPercentChange(parseFloat(e.target.value) || 0)
                }
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={onApplyDiscount}>
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryCardProps {
  subtotal: number;
  discountAmount: number;
  total: number;
  cartLength: number;
  checkoutLoading: boolean;
  onCheckout: () => void;
}

export function SummaryCard({
  subtotal,
  discountAmount,
  total,
  cartLength,
  checkoutLoading,
  onCheckout,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">ETB {subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">
              -ETB {discountAmount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-3 border-t">
          <span>Total</span>
          <span className="text-primary">ETB {total.toFixed(2)}</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={cartLength === 0 || checkoutLoading}
        >
          {checkoutLoading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5 mr-2" />
          )}
          {checkoutLoading ? "Processing..." : "Complete Checkout"}
        </Button>
      </CardContent>
    </Card>
  );
}

interface CheckoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  paymentMethod: string;
  checkoutLoading: boolean;
  onConfirm: () => void;
}

export function CheckoutConfirmDialog({
  open,
  onOpenChange,
  total,
  paymentMethod,
  checkoutLoading,
  onConfirm,
}: CheckoutConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Confirm Checkout
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirm checkout for ETB {total.toFixed(2)} using{" "}
            {paymentMethod.replace("_", " ")}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={checkoutLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? "Processing..." : "Confirm and Charge"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type { CartItem, Medicine };
