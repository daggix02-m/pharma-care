import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import {
  Receipt,
  Search,
  Printer,
  Eye,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ReceiptItem {
  medicineId: Id<"medicines">;
  quantity: number;
  price: number;
  medicineName?: string;
}

interface ReceiptData {
  _id: Id<"sales">;
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

export function Receipts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(
    null,
  );
  const { sessionToken } = useAuth();

  const receiptsQuery = useQuery(
    api.cashier.queries.getTransactions,
    sessionToken ? { sessionToken } : "skip",
  );
  const receipts = (receiptsQuery || []) as ReceiptData[];

  const filteredReceipts = receipts.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r._id?.toString().toLowerCase().includes(query) ||
      r.customerName?.toLowerCase().includes(query)
    );
  });

  const handleViewDetails = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
  };

  const handlePrint = (receipt: ReceiptData) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Unable to open print window");
      return;
    }

    const itemsHtml = (receipt.items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding: 6px 0;">${item.medicineName || "Medicine"}</td>
            <td style="padding: 6px 0; text-align: center;">${item.quantity}</td>
            <td style="padding: 6px 0; text-align: right;">ETB ${item.price.toFixed(2)}</td>
            <td style="padding: 6px 0; text-align: right;">ETB ${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt REC-${receipt._id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            .header { text-align: center; margin-bottom: 18px; }
            .muted { color: #555; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            thead th { border-bottom: 1px solid #ddd; text-align: left; padding: 8px 0; }
            .summary { margin-top: 16px; }
            .summary-row { display: flex; justify-content: space-between; padding: 2px 0; }
            .total { font-weight: 700; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PharmaCare</h2>
            <p class="muted">Receipt REC-${receipt._id}</p>
            <p class="muted">${receipt._creationTime ? new Date(receipt._creationTime).toLocaleString() : "N/A"}</p>
          </div>
          <div>
            <p><strong>Customer:</strong> ${receipt.customerName || "Walk-in"}</p>
            <p><strong>Cashier:</strong> ${receipt.cashierName || "N/A"}</p>
            <p><strong>Payment Method:</strong> ${receipt.paymentMethod || "N/A"}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="summary">
            <div class="summary-row"><span>Subtotal</span><span>ETB ${(receipt.subtotal || 0).toFixed(2)}</span></div>
            <div class="summary-row"><span>Discount</span><span>ETB ${(receipt.discount || 0).toFixed(2)}</span></div>
            <div class="summary-row total"><span>Total</span><span>ETB ${(receipt.totalAmount || 0).toFixed(2)}</span></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success(`Receipt REC-${receipt._id} sent to printer`);
  };

  const getPaymentMethodBadge = (paymentMethod: string) => {
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
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
        <p className="text-muted-foreground">
          View and print receipts for completed sales
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by sale ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/sales")}
            >
              Transactions
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/returns")}
            >
              Returns
            </Button>
            <Button variant="outline" onClick={() => navigate("/cashier/pos")}>
              Open POS
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            All Receipts
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredReceipts.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No receipts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReceipts.map((receipt) => (
                <div
                  key={receipt._id}
                  className="rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium break-all">{`REC-${receipt._id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {receipt._creationTime
                          ? new Date(receipt._creationTime).toLocaleString()
                          : "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {receipt.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">
                        ETB {receipt.totalAmount?.toFixed(2)}
                      </p>
                      <div className="mt-1">
                        {getPaymentMethodBadge(receipt.paymentMethod)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(receipt)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(receipt)}
                    >
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReceipt && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              Receipt Details - {`REC-${selectedReceipt._id}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4 border-b">
                <h3 className="text-xl font-bold">PharmaCare</h3>
                <p className="text-sm text-muted-foreground">Receipt</p>
                <p className="text-sm">{`REC-${selectedReceipt._id}`}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReceipt._creationTime
                    ? new Date(selectedReceipt._creationTime).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sale ID</p>
                  <p className="font-medium">#{selectedReceipt._id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cashier</p>
                  <p className="font-medium">
                    {selectedReceipt.cashierName || "N/A"}
                  </p>
                </div>
              </div>

              <div className="py-4 border-t">
                <h4 className="font-semibold mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                    selectedReceipt.items.map(
                      (item: ReceiptItem, index: number) => (
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
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground">No items available</p>
                  )}
                </div>
              </div>

              <div className="py-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ETB {(selectedReceipt.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium">
                    ETB {(selectedReceipt.discount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">
                    ETB {(selectedReceipt.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payment Method</span>
                  <span>
                    {getPaymentMethodBadge(selectedReceipt.paymentMethod)}
                  </span>
                </div>
                {selectedReceipt.referenceNumber && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Reference</span>
                    <span>{selectedReceipt.referenceNumber}</span>
                  </div>
                )}
              </div>

              <div className="text-center py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Thank you for your purchase!
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReceipt(null);
                  }}
                >
                  Close
                </Button>
                <Button onClick={() => handlePrint(selectedReceipt)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
