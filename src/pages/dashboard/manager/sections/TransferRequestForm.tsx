import React, { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransferRequestFormProps {
  transferOptions: any;
  canApprove: boolean;
  sessionToken: string | null;
  requestTransfer: (args: any) => Promise<any>;
}

export function TransferRequestForm({
  transferOptions,
  canApprove,
  sessionToken,
  requestTransfer,
}: TransferRequestFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fromBranchId: "",
    toBranchId: "",
    sourceMedicineId: "",
    quantity: "",
    urgency: "normal",
    reason: "",
    notes: "",
  });

  React.useEffect(() => {
    if (!transferOptions) return;
    if (!form.fromBranchId && transferOptions.actorBranchId) {
      setForm((prev) => ({
        ...prev,
        fromBranchId: transferOptions.actorBranchId,
      }));
    }
  }, [transferOptions, form.fromBranchId]);

  const medicinesForSource =
    transferOptions?.medicinesBySource?.[form.fromBranchId] || [];

  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.fromBranchId ||
      !form.toBranchId ||
      !form.sourceMedicineId ||
      !form.quantity ||
      !form.reason.trim()
    ) {
      toast.error("Please complete all required transfer fields");
      return;
    }
    if (form.fromBranchId === form.toBranchId) {
      toast.error("Source and destination branches must be different");
      return;
    }

    try {
      setSubmitting(true);
      await requestTransfer({
        fromBranchId: form.fromBranchId,
        toBranchId: form.toBranchId,
        sourceMedicineId: form.sourceMedicineId,
        quantity: Number(form.quantity),
        urgency: form.urgency,
        reason: form.reason.trim(),
        notes: form.notes.trim() || undefined,
        sessionToken: sessionToken || undefined,
      });
      toast.success("Transfer request submitted");
      setForm((prev) => ({
        ...prev,
        toBranchId: "",
        sourceMedicineId: "",
        quantity: "",
        urgency: "normal",
        reason: "",
        notes: "",
      }));
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit transfer request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="minimal-card">
      <CardHeader>
        <CardTitle>Request Branch Transfer</CardTitle>
        <CardDescription>
          Managers can request stock transfers. Approval requires owner or
          delegated manager access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmitRequest}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label>Source Branch</Label>
            <Select
              value={form.fromBranchId}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  fromBranchId: value,
                  sourceMedicineId: "",
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select source branch" />
              </SelectTrigger>
              <SelectContent>
                {(transferOptions?.branches || []).map((branch: any) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Destination Branch</Label>
            <Select
              value={form.toBranchId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, toBranchId: value }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select destination branch" />
              </SelectTrigger>
              <SelectContent>
                {(transferOptions?.branches || []).map((branch: any) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Medicine</Label>
            <Select
              value={form.sourceMedicineId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, sourceMedicineId: value }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicinesForSource.map((medicine: any) => (
                  <SelectItem key={medicine._id} value={medicine._id}>
                    {medicine.name} (Stock: {medicine.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, quantity: e.target.value }))
              }
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Reason</Label>
            <Input
              value={form.reason}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Urgency</Label>
            <Select
              value={form.urgency}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, urgency: value }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="h-11 rounded-xl"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <Badge variant={canApprove ? "default" : "secondary"}>
              {canApprove
                ? "Delegated approval enabled"
                : "Owner approval required"}
            </Badge>
            <Button type="submit" disabled={submitting} className="rounded-xl">
              {submitting ? "Submitting..." : "Submit Transfer Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
