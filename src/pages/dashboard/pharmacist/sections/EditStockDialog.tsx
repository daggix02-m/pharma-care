import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Medicine } from "./types";

interface EditStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
}

export function EditStockDialog({
  open,
  onOpenChange,
  medicine,
}: EditStockDialogProps) {
  const [saving, setSaving] = useState(false);
  const [stockValue, setStockValue] = useState("");
  const updateStock = useMutation(api.pharmacist.mutations.updateMedicineStock);

  useEffect(() => {
    if (medicine) setStockValue(String(medicine.stock));
  }, [medicine]);

  const handleUpdate = async () => {
    if (!medicine) return;
    const stock = Number(stockValue);
    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Enter a valid stock value");
      return;
    }

    try {
      setSaving(true);
      await updateStock({ id: medicine._id, stock });
      toast.success("Stock updated");
      onOpenChange(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to update stock";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Stock</DialogTitle>
          <DialogDescription>
            Update stock for {medicine?.name || "selected medicine"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-stock">Stock</Label>
            <Input
              id="edit-stock"
              type="number"
              min={0}
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdate} disabled={saving}>
              {saving ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
