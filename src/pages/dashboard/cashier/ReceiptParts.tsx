import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ReceiptItem {
  medicineId: string;
  quantity: number;
  price: number;
  medicineName?: string;
}

export interface ReceiptData {
  _id: string;
  _creationTime: number;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  paymentMethod: string;
  cashierName?: string;
  referenceNumber?: string;
  items: ReceiptItem[];
}

export function getPaymentMethodBadge(paymentMethod: string) {
  const methods: Record<
    string,
    { label: string; icon: typeof DollarSign; color: string }
  > = {
    cash: {
      label: "Cash",
      icon: DollarSign,
      color: "bg-green-100 text-green-800",
    },
    card: {
      label: "Card",
      icon: CreditCard,
      color: "bg-blue-100 text-blue-800",
    },
    mobile: {
      label: "Mobile",
      icon: CreditCard,
      color: "bg-purple-100 text-purple-800",
    },
    bank_transfer: {
      label: "Bank Transfer",
      icon: CreditCard,
      color: "bg-orange-100 text-orange-800",
    },
  };
  const method = methods[paymentMethod] || {
    label: "Unknown",
    icon: CreditCard,
    color: "bg-gray-100 text-gray-800",
  };
  const Icon = method.icon;

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${method.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {method.label}
    </span>
  );
}

interface ReceiptDetailProps {
  receipt: ReceiptData;
  onClose: () => void;
  onPrint: (receipt: ReceiptData) => void;
}

export function ReceiptDetail({
  receipt,
  onClose,
  onPrint,
}: ReceiptDetailProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Receipt Details - {`REC-${receipt._id}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-4 border-b">
            <h3 className="text-xl font-bold">PharmaCare</h3>
            <p className="text-sm text-muted-foreground">Receipt</p>
            <p className="text-sm">{`REC-${receipt._id}`}</p>
            <p className="text-sm text-muted-foreground">
              {receipt._creationTime
                ? new Date(receipt._creationTime).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Sale ID</p>
              <p className="font-medium">#{receipt._id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cashier</p>
              <p className="font-medium">{receipt.cashierName || "N/A"}</p>
            </div>
          </div>

          <div className="py-4 border-t">
            <h4 className="font-semibold mb-3">Items</h4>
            <div className="space-y-2">
              {receipt.items && receipt.items.length > 0 ? (
                receipt.items.map((item: ReceiptItem, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b last:border-0"
                  >
                    <span className="flex-1">
                      {item.medicineName || "Unknown"} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ETB {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No items available</p>
              )}
            </div>
          </div>

          <div className="py-4 border-t space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                ETB {(receipt.subtotal || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium">
                ETB {(receipt.discount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">
                ETB {(receipt.totalAmount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Payment Method</span>
              <span>{getPaymentMethodBadge(receipt.paymentMethod)}</span>
            </div>
            {receipt.referenceNumber && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Reference</span>
                <span>{receipt.referenceNumber}</span>
              </div>
            )}
          </div>

          <div className="text-center py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Thank you for your purchase!
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onPrint(receipt)}>
              <span className="h-4 w-4 mr-2 inline-flex items-center justify-center">
                🖨
              </span>
              Print Receipt
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
