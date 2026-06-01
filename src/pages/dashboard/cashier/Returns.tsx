import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { SaleSearchList, ReturnForm } from "./ReturnParts";

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

export function Returns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { quantity: number }>
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

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Returns</h2>
        <p className="text-muted-foreground">
          Process product returns and issue refunds
        </p>
      </div>

      <SaleSearchList
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredSales={filteredSales}
        selectedSale={selectedSale}
        onSelect={handleSelectSale}
      />

      {selectedSale && (
        <ReturnForm
          selectedSale={selectedSale}
          returnableItems={returnableItems}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          onQuantityChange={handleQuantityChange}
          returnReason={returnReason}
          onReasonChange={setReturnReason}
          returnCondition={returnCondition}
          onConditionChange={setReturnCondition}
          processing={processing}
          onProcessReturn={handleProcessReturn}
          onCancel={() => {
            setSelectedSale(null);
            setSelectedItems({});
            setReturnReason("");
            setReturnCondition("good");
          }}
        />
      )}
    </div>
  );
}
