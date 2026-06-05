import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Loader2, ArrowRightLeft, Package } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  dosage?: string;
  stock_quantity?: number;
  quantity?: number;
}

interface Branch {
  id?: string;
  branch_id?: string;
  branch_name?: string;
  name?: string;
}

interface StockTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicines?: Medicine[];
  branches?: Branch[];
}

export function StockTransferModal({
  open,
  onOpenChange,
  medicines = [],
  branches = [],
}: StockTransferModalProps) {
  const transferStock = useMutation(api.manager.mutations.transferStock);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medicine_id: "",
    from_branch_id: "",
    to_branch_id: "",
    quantity: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.medicine_id ||
      !formData.from_branch_id ||
      !formData.to_branch_id ||
      !formData.quantity
    ) {
      toast.error("All fields are required");
      return;
    }

    if (formData.from_branch_id === formData.to_branch_id) {
      toast.error("Source and destination branches must be different");
      return;
    }

    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }

    const selectedMedicine = medicines.find(
      (m) => String(m.id) === String(formData.medicine_id),
    );
    if (selectedMedicine) {
      const stock =
        selectedMedicine.stock_quantity || selectedMedicine.quantity || 0;
      if (qty > stock) {
        toast.error(`Not enough stock. Available: ${stock}`);
        return;
      }
    }

    setLoading(true);
    try {
      await transferStock({
        fromBranchId: formData.from_branch_id,
        toBranchId: formData.to_branch_id,
        medicineId: formData.medicine_id,
        quantity: qty,
      });

      toast.success("Stock transfer initiated successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error?.message || "Failed to transfer stock");
    } finally {
      setLoading(false);
    }
  };

  const selectedMedicine = medicines.find(
    (m) => String(m.id) === String(formData.medicine_id),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            Stock Transfer
          </DialogTitle>
          <DialogDescription>
            Transfer medicines between different pharmacy branches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Medicine
            </Label>
            <Select
              value={formData.medicine_id}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, medicine_id: val }))
              }
            >
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="Select medicine to transfer" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 max-h-[200px]">
                {medicines.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name} ({m.dosage || "N/A"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMedicine && (
              <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Package className="w-3 h-3" /> Available Stock:{" "}
                {selectedMedicine.stock_quantity ||
                  selectedMedicine.quantity ||
                  0}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                From Branch
              </Label>
              <Select
                value={formData.from_branch_id}
                onValueChange={(val) =>
                  setFormData((p) => ({ ...p, from_branch_id: val }))
                }
              >
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200">
                  {branches.map((b) => (
                    <SelectItem
                      key={b.id || b.branch_id}
                      value={String(b.id || b.branch_id)}
                    >
                      {b.branch_name || b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                To Branch
              </Label>
              <Select
                value={formData.to_branch_id}
                onValueChange={(val) =>
                  setFormData((p) => ({ ...p, to_branch_id: val }))
                }
              >
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200">
                  {branches.map((b) => (
                    <SelectItem
                      key={b.id || b.branch_id}
                      value={String(b.id || b.branch_id)}
                    >
                      {b.branch_name || b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quantity
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                placeholder="Enter quantity to transfer"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, quantity: e.target.value }))
                }
                className="rounded-xl h-12 pr-12"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                UNIT
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 text-white min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Confirm Transfer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
