import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Receipt, Search, Printer, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getPaymentMethodBadge,
  ReceiptDetail,
  type ReceiptData,
  type ReceiptItem,
} from "./ReceiptParts";
import { Id } from "@convex/_generated/dataModel";

type ReceiptItemConvex = ReceiptItem & { medicineId: Id<"medicines"> };

interface ReceiptDataConvex extends Omit<ReceiptData, "_id" | "items"> {
  _id: Id<"sales">;
  items: ReceiptItemConvex[];
}

export function Receipts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] =
    useState<ReceiptDataConvex | null>(null);
  const { sessionToken } = useAuth();

  const receiptsQuery = useQuery(
    api.cashier.queries.getTransactions,
    sessionToken ? { sessionToken } : "skip",
  );
  const receipts = (receiptsQuery || []) as ReceiptDataConvex[];

  const filteredReceipts = receipts.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r._id?.toString().toLowerCase().includes(query) ||
      r.customerName?.toLowerCase().includes(query)
    );
  });

  const handlePrint = (receipt: ReceiptDataConvex) => {
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
                      onClick={() => setSelectedReceipt(receipt)}
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
        <ReceiptDetail
          receipt={selectedReceipt as unknown as ReceiptData}
          onClose={() => setSelectedReceipt(null)}
          onPrint={(r) => handlePrint(r as unknown as ReceiptDataConvex)}
        />
      )}
    </div>
  );
}
