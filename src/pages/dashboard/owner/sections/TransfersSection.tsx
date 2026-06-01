import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function TransfersSection() {
  const auth = useAuth();
  const [delegationHoursByManager, setDelegationHoursByManager] =
    React.useState<Record<string, string>>({});
  const [delegatingManagerId, setDelegatingManagerId] = React.useState<
    string | null
  >(null);
  const [decisionLoadingId, setDecisionLoadingId] = React.useState<
    string | null
  >(null);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [selectedTransferRequest, setSelectedTransferRequest] =
    React.useState<any>(null);
  const [transferRejectReason, setTransferRejectReason] = React.useState(
    "Insufficient stock justification",
  );
  const [transferStatusFilter, setTransferStatusFilter] = React.useState("all");

  const transferRequests = useQuery(
    (api as any).stockTransfers.getTransferRequestsForPharmacy,
    auth.sessionToken
      ? {
          sessionToken: auth.sessionToken,
          status:
            transferStatusFilter === "all" ? undefined : transferStatusFilter,
        }
      : "skip",
  );

  const delegationManagers = useQuery(
    (api as any).stockTransfers.getDelegationManagers,
    auth.sessionToken ? { sessionToken: auth.sessionToken } : "skip",
  );

  const setDelegation = useMutation(
    (api as any).stockTransfers.setManagerStockApprovalDelegation,
  );
  const approveTransfer = useMutation(
    (api as any).stockTransfers.approveStockTransferRequest,
  );
  const rejectTransfer = useMutation(
    (api as any).stockTransfers.rejectStockTransferRequest,
  );

  const submitTransferRejection = async () => {
    if (!selectedTransferRequest) return;
    if (!transferRejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setDecisionLoadingId(selectedTransferRequest._id);
      await rejectTransfer({
        requestId: selectedTransferRequest._id,
        rejectionReason: transferRejectReason.trim(),
        sessionToken: auth.sessionToken || undefined,
      });
      toast.success("Transfer request rejected");
      setRejectDialogOpen(false);
      setSelectedTransferRequest(null);
      setTransferRejectReason("Insufficient stock justification");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject transfer");
    } finally {
      setDecisionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manager Approval Delegation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {delegationManagers?.length ? (
            delegationManagers.map((manager: any) => {
              const expiry = manager.stockApprovalDelegationExpiresAt;
              const isActive =
                manager.canApproveStockTransfers &&
                expiry &&
                expiry > Date.now();
              return (
                <div
                  key={manager._id}
                  className="rounded-lg border border-border/40 p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{manager.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {manager.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isActive && expiry
                        ? `Delegation expires ${formatDateTime(expiry)}`
                        : "No active delegation"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={168}
                      value={delegationHoursByManager[manager._id] || "24"}
                      onChange={(e) =>
                        setDelegationHoursByManager((prev) => ({
                          ...prev,
                          [manager._id]: e.target.value,
                        }))
                      }
                      className="h-9 w-24"
                    />
                    <Button
                      size="sm"
                      disabled={delegatingManagerId === manager._id}
                      onClick={async () => {
                        try {
                          setDelegatingManagerId(manager._id);
                          await setDelegation({
                            managerId: manager._id,
                            enabled: true,
                            durationHours: Number(
                              delegationHoursByManager[manager._id] || "24",
                            ),
                            sessionToken: auth.sessionToken || undefined,
                          });
                          toast.success("Delegation enabled");
                        } catch (error: any) {
                          toast.error(
                            error?.message || "Failed to enable delegation",
                          );
                        } finally {
                          setDelegatingManagerId(null);
                        }
                      }}
                    >
                      Delegate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={delegatingManagerId === manager._id}
                      onClick={async () => {
                        try {
                          setDelegatingManagerId(manager._id);
                          await setDelegation({
                            managerId: manager._id,
                            enabled: false,
                            sessionToken: auth.sessionToken || undefined,
                          });
                          toast.success("Delegation revoked");
                        } catch (error: any) {
                          toast.error(
                            error?.message || "Failed to revoke delegation",
                          );
                        } finally {
                          setDelegatingManagerId(null);
                        }
                      }}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No managers found</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Transfer Approval Queue</CardTitle>
            <select
              value={transferStatusFilter}
              onChange={(e) => setTransferStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-52"
            >
              <option value="all">All statuses</option>
              <option value="pending_owner">Pending Approval</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(transferRequests || []).map((request: any) => (
            <div
              key={request._id}
              className="rounded-lg border border-border/40 p-3"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {request.medicineSnapshot?.name} · {request.quantity} units
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.fromBranchName} to {request.toBranchName} · by{" "}
                    {request.requesterName}
                  </p>
                </div>
                <Badge className="capitalize">
                  {request.status.replace(/_/g, " ")}
                </Badge>
              </div>
              {request.status === "pending_owner" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    disabled={decisionLoadingId === request._id}
                    onClick={async () => {
                      try {
                        setDecisionLoadingId(request._id);
                        await approveTransfer({
                          requestId: request._id,
                          sessionToken: auth.sessionToken || undefined,
                        });
                        toast.success("Transfer approved and fulfilled");
                      } catch (error: any) {
                        toast.error(
                          error?.message || "Failed to approve transfer",
                        );
                      } finally {
                        setDecisionLoadingId(null);
                      }
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={decisionLoadingId === request._id}
                    onClick={() => {
                      setSelectedTransferRequest(request);
                      setTransferRejectReason(
                        "Insufficient stock justification",
                      );
                      setRejectDialogOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
          {!transferRequests?.length && (
            <p className="text-sm text-muted-foreground">
              No transfer requests found.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="owner-transfer-reason">Rejection reason</Label>
            <Textarea
              id="owner-transfer-reason"
              value={transferRejectReason}
              onChange={(e) => setTransferRejectReason(e.target.value)}
              className="min-h-[120px]"
              placeholder="Explain why this request is rejected"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void submitTransferRejection()}
              disabled={Boolean(decisionLoadingId)}
            >
              {decisionLoadingId ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
