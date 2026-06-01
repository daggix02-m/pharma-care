import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Medicine } from "./types";

export function NewRequestDialog({
  open,
  onOpenChange,
  sessionToken: _sessionToken,
  medicines,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionToken: string | null;
  medicines: Medicine[] | undefined;
}) {
  const [requestForm, setRequestForm] = React.useState({
    medicineId: "",
    quantity: "",
    urgency: "normal",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const createStockRequest = useMutation(
    api.pharmacist.mutations.createStockRequest,
  );

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requestForm.medicineId || !requestForm.quantity) {
      toast.error("Select a medicine and quantity");
      return;
    }

    try {
      setIsSubmitting(true);
      await createStockRequest({
        medicineId: requestForm.medicineId as Id<"medicines">,
        quantity: Number(requestForm.quantity),
        urgency: requestForm.urgency,
        notes: requestForm.notes.trim() || undefined,
      });
      toast.success("Stock request submitted");
      onOpenChange(false);
      setRequestForm({
        medicineId: "",
        quantity: "",
        urgency: "normal",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to create stock request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Stock Request</DialogTitle>
          <DialogDescription>
            Submit a replenishment request for medicine stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="request-medicine">Medicine</Label>
            <select
              id="request-medicine"
              value={requestForm.medicineId}
              onChange={(e) =>
                setRequestForm((prev) => ({
                  ...prev,
                  medicineId: e.target.value,
                }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select medicine</option>
              {medicines?.map((medicine: Medicine) => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="request-quantity">Quantity</Label>
              <Input
                id="request-quantity"
                type="number"
                min={1}
                value={requestForm.quantity}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="request-urgency">Urgency</Label>
              <select
                id="request-urgency"
                value={requestForm.urgency}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    urgency: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="request-notes">Notes</Label>
            <Textarea
              id="request-notes"
              rows={3}
              value={requestForm.notes}
              onChange={(e) =>
                setRequestForm((prev) => ({ ...prev, notes: e.target.value }))
              }
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TransferRequestForm({
  sessionToken,
  transferOptions,
}: {
  sessionToken: string | null;
  transferOptions: any;
}) {
  const [transferForm, setTransferForm] = React.useState({
    toBranchId: "",
    sourceMedicineId: "",
    quantity: "",
    urgency: "normal",
    reason: "",
    notes: "",
  });
  const [transferSubmitting, setTransferSubmitting] = React.useState(false);
  const requestTransfer = useMutation(
    (api as any).stockTransfers.requestStockTransfer,
  );

  return (
    <Card className="minimal-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Branch Transfer Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              !transferForm.toBranchId ||
              !transferForm.sourceMedicineId ||
              !transferForm.quantity ||
              !transferForm.reason.trim()
            ) {
              toast.error("Please complete all transfer request fields");
              return;
            }

            try {
              setTransferSubmitting(true);
              await requestTransfer({
                fromBranchId: transferOptions?.actorBranchId,
                toBranchId: transferForm.toBranchId,
                sourceMedicineId: transferForm.sourceMedicineId,
                quantity: Number(transferForm.quantity),
                urgency: transferForm.urgency,
                reason: transferForm.reason.trim(),
                notes: transferForm.notes.trim() || undefined,
                sessionToken: sessionToken || undefined,
              });
              toast.success("Transfer request submitted");
              setTransferForm({
                toBranchId: "",
                sourceMedicineId: "",
                quantity: "",
                urgency: "normal",
                reason: "",
                notes: "",
              });
            } catch (error: any) {
              toast.error(error?.message || "Failed to request transfer");
            } finally {
              setTransferSubmitting(false);
            }
          }}
        >
          <div className="space-y-1">
            <Label>Destination Branch</Label>
            <select
              value={transferForm.toBranchId}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  toBranchId: e.target.value,
                }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select branch</option>
              {(transferOptions?.branches || [])
                .filter(
                  (branch: any) =>
                    branch._id !== transferOptions?.actorBranchId,
                )
                .map((branch: any) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Medicine</Label>
            <select
              value={transferForm.sourceMedicineId}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  sourceMedicineId: e.target.value,
                }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select medicine</option>
              {(
                transferOptions?.medicinesBySource?.[
                  transferOptions?.actorBranchId || ""
                ] || []
              ).map((medicine: any) => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name} (Stock: {medicine.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={transferForm.quantity}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Urgency</Label>
            <select
              value={transferForm.urgency}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  urgency: e.target.value,
                }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Reason</Label>
            <Input
              value={transferForm.reason}
              onChange={(e) =>
                setTransferForm((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={transferForm.notes}
              onChange={(e) =>
                setTransferForm((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={transferSubmitting}>
              {transferSubmitting ? "Submitting..." : "Submit Transfer Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
