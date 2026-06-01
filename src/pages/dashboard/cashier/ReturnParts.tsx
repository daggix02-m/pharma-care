import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Search,
  Trash2,
  ShoppingCart,
  ArrowRightLeft,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";

interface Sale {
  _id: Id<"sales">;
  _creationTime: number;
  customerName?: string;
  totalAmount?: number;
  items?: Array<{
    medicineId: Id<"medicines">;
    quantity: number;
    price: number;
  }>;
}

interface ReturnableItem {
  medicineId: Id<"medicines">;
  medicineName: string;
  category: string;
  canReturn: boolean;
  quantity: number;
  price: number;
}

interface SelectedItem {
  quantity: number;
}

interface SaleSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filteredSales: Sale[];
  selectedSale: Sale | null;
  onSelect: (sale: Sale) => void;
}

export function SaleSearchList({
  searchQuery,
  onSearchChange,
  filteredSales,
  onSelect,
}: SaleSearchProps) {
  const navigate = useNavigate();

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sales by ID or customer name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/sales")}
            >
              Find Sale
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/receipts")}
            >
              Open Receipts
            </Button>
            <Button variant="outline" onClick={() => navigate("/cashier/pos")}>
              Back to POS
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Sales for Return
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredSales.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sales found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSales.map((sale) => (
                <div
                  key={sale._id}
                  className="rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium break-all">Sale #{sale._id}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.customerName || "Walk-in"} ·{" "}
                        {sale.items?.length || 0} items
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale._creationTime
                          ? new Date(sale._creationTime).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <p className="font-semibold shrink-0">
                      ETB {sale.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelect(sale)}
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" /> Process Return
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

interface ReturnFormProps {
  selectedSale: Sale;
  returnableItems: ReturnableItem[];
  selectedItems: Record<string, SelectedItem>;
  onItemSelect: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  returnReason: string;
  onReasonChange: (value: string) => void;
  returnCondition: string;
  onConditionChange: (value: string) => void;
  processing: boolean;
  onProcessReturn: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function ReturnForm({
  selectedSale,
  returnableItems,
  selectedItems,
  onItemSelect,
  onQuantityChange,
  returnReason,
  onReasonChange,
  returnCondition,
  onConditionChange,
  processing,
  onProcessReturn,
  onCancel,
}: ReturnFormProps) {
  const getConditionBadge = (condition: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      good: { label: "Good", color: "bg-green-100 text-green-800" },
      damaged: { label: "Damaged", color: "bg-red-100 text-red-800" },
      opened: { label: "Opened", color: "bg-yellow-100 text-yellow-800" },
      expired: { label: "Expired", color: "bg-orange-100 text-orange-800" },
    };
    const badge = badges[condition] || {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          <ArrowRightLeft className="h-5 w-5 mr-2" />
          Process Return - Sale #{selectedSale._id}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onProcessReturn}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Sale Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedSale.customerName || "Walk-in"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sale Date</p>
                  <p className="font-medium">
                    {selectedSale._creationTime
                      ? new Date(selectedSale._creationTime).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">
                    ETB {selectedSale.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Select Items to Return
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {returnableItems.length > 0 ? (
                  returnableItems.map((item) => (
                    <div
                      key={item.medicineId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.medicineName}</p>
                        <p className="text-sm text-muted-foreground">
                          Available: {item.quantity} | Price: ETB{" "}
                          {item.price?.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedItems[item.medicineId.toString()]}
                          onChange={() =>
                            onItemSelect(item.medicineId.toString())
                          }
                          className="h-4 w-4"
                        />
                        <input
                          type="number"
                          min="1"
                          max={item.quantity || 1}
                          value={
                            selectedItems[item.medicineId.toString()]
                              ?.quantity || 1
                          }
                          onChange={(e) =>
                            onQuantityChange(
                              item.medicineId.toString(),
                              parseInt(e.target.value),
                            )
                          }
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No items available
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Return Reason
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="wrong_product">Wrong product</option>
                  <option value="damaged">Damaged</option>
                  <option value="expired">Expired</option>
                  <option value="customer_request">Customer request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Condition
                </label>
                <div className="flex gap-4">
                  {["good", "damaged", "opened", "expired"].map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => onConditionChange(condition)}
                      className={`px-4 py-2 rounded-md border-2 transition-colors ${
                        returnCondition === condition
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-muted"
                      }`}
                    >
                      {getConditionBadge(condition)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing || Object.keys(selectedItems).length === 0}
              >
                {processing ? (
                  <Trash2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Process Return
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
