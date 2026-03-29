import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import {
  RotateCcw,
  Search,
  Trash2,
  ShoppingCart,
  ArrowRightLeft,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

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

export function Returns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedItems, setSelectedItems] = useState<
    Record<string, SelectedItem>
  >({});
  const [returnReason, setReturnReason] = useState("");
  const [returnCondition, setReturnCondition] = useState("good");
  const [processing, setProcessing] = useState(false);
  const { sessionToken } = useAuth();

  const sales = useQuery(
    api.cashier.queries.getReturnableSales,
    sessionToken ? { sessionToken } : "skip",
  ) as Sale[] | undefined;
  const salesList = sales || [];

  const returnableItemsQuery = useQuery(
    api.cashier.queries.getReturnableItems,
    sessionToken && selectedSale
      ? { sessionToken, saleId: selectedSale._id }
      : "skip",
  );
  const returnableItems = (returnableItemsQuery || []) as ReturnableItem[];

  const processReturn = useMutation(api.cashier.mutations.processReturn);

  const filteredSales = salesList.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s._id?.toString().toLowerCase().includes(query) ||
      s.customerName?.toLowerCase().includes(query)
    );
  });

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setSelectedItems({});
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems((prev) => {
      const newItems = { ...prev };
      if (newItems[itemId]) {
        delete newItems[itemId];
      } else {
        newItems[itemId] = { quantity: 1 };
      }
      return newItems;
    });
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { quantity: Math.max(1, newQuantity) },
    }));
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSale) {
      toast.error("Please select a sale first");
      return;
    }

    const selectedItemsList = returnableItems
      .filter((item) => selectedItems[item.medicineId.toString()])
      .map((item) => ({
        medicineId: item.medicineId,
        quantity: selectedItems[item.medicineId.toString()]?.quantity || 1,
      }));

    if (selectedItemsList.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    if (!returnReason.trim()) {
      toast.error("Please provide a return reason");
      return;
    }

    try {
      setProcessing(true);

      await processReturn({
        saleId: selectedSale._id,
        items: selectedItemsList,
        reason: returnReason,
      });

      toast.success("Return processed successfully!");
      setSelectedSale(null);
      setSelectedItems({});
      setReturnReason("");
      setReturnCondition("good");
    } catch (error) {
      console.error("Error processing return:", error);
      toast.error("Failed to process return");
    } finally {
      setProcessing(false);
    }
  };

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
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Returns</h2>
        <p className="text-muted-foreground">
          Process product returns and issue refunds
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sales by ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
                      onClick={() => handleSelectSale(sale)}
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

      {selectedSale && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              Process Return - Sale #{selectedSale._id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProcessReturn}>
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
                          ? new Date(
                              selectedSale._creationTime,
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
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
                              checked={
                                !!selectedItems[item.medicineId.toString()]
                              }
                              onChange={() =>
                                handleItemSelect(item.medicineId.toString())
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
                                handleQuantityChange(
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
                      onChange={(e) => setReturnReason(e.target.value)}
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
                      {["good", "damaged", "opened", "expired"].map(
                        (condition) => (
                          <button
                            key={condition}
                            type="button"
                            onClick={() => setReturnCondition(condition)}
                            className={`px-4 py-2 rounded-md border-2 transition-colors ${
                              returnCondition === condition
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background hover:bg-muted"
                            }`}
                          >
                            {getConditionBadge(condition)}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedSale(null);
                      setSelectedItems({});
                      setReturnReason("");
                      setReturnCondition("good");
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      processing || Object.keys(selectedItems).length === 0
                    }
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
      )}
    </div>
  );
}
