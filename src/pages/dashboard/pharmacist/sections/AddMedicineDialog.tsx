import { useState } from "react";
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

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  name: "",
  category: "",
  stock: "",
  price: "",
  manufacturer: "",
  barcode: "",
};

export function AddMedicineDialog({
  open,
  onOpenChange,
}: AddMedicineDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const addMedicine = useMutation(api.pharmacist.mutations.addMedicine);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.stock.trim() ||
      !form.price.trim()
    ) {
      toast.error("Please fill all required medicine fields");
      return;
    }

    try {
      setSaving(true);
      await addMedicine({
        name: form.name.trim(),
        category: form.category.trim(),
        stock: Number(form.stock),
        price: Number(form.price),
        manufacturer: form.manufacturer.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
      });
      toast.success("Medicine added");
      onOpenChange(false);
      setForm(emptyForm);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to add medicine";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medicine</DialogTitle>
          <DialogDescription>
            Create a new inventory medicine record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="medicine-name">Name</Label>
            <Input
              id="medicine-name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="medicine-category">Category</Label>
            <Input
              id="medicine-category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="medicine-stock">Stock</Label>
              <Input
                id="medicine-stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="medicine-price">Price</Label>
              <Input
                id="medicine-price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="medicine-manufacturer">Manufacturer</Label>
              <Input
                id="medicine-manufacturer"
                value={form.manufacturer}
                onChange={(e) => updateField("manufacturer", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="medicine-barcode">Barcode</Label>
              <Input
                id="medicine-barcode"
                value={form.barcode}
                onChange={(e) => updateField("barcode", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
