import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransferRequestsListProps {
  canApprove: boolean;
  sessionToken: string | null;
  approveTransfer: (args: any) => Promise<any>;
  onRejectRequest: (request: any) => void;
}

export function TransferRequestsList({
  canApprove,
  sessionToken,
  approveTransfer,
  onRejectRequest,
}: TransferRequestsListProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalLoadingId, setApprovalLoadingId] = useState<string | null>(
    null,
  );

  const transferRequests = useQuery(
    (api as any).stockTransfers.getTransferRequestsForPharmacy,
    sessionToken
      ? {
          sessionToken,
          status: statusFilter === "all" ? undefined : statusFilter,
        }
      : "skip",
  );

  return (
    <Card className="minimal-card">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Transfer Requests</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending_owner">Pending Approval</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(transferRequests || []).map((request: any) => (
          <div
            key={request._id}
            className="rounded-xl border border-border/40 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {request.medicineSnapshot?.name} · {request.quantity} units
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.fromBranchName} to {request.toBranchName} · Requested
                  by {request.requesterName}
                </p>
              </div>
              <Badge className="capitalize">
                {request.status.replace(/_/g, " ")}
              </Badge>
            </div>
            {canApprove && request.status === "pending_owner" && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="rounded-lg"
                  disabled={approvalLoadingId === request._id}
                  onClick={async () => {
                    try {
                      setApprovalLoadingId(request._id);
                      await approveTransfer({
                        requestId: request._id,
                        sessionToken: sessionToken || undefined,
                      });
                      toast.success("Transfer approved and fulfilled");
                    } catch (error: any) {
                      toast.error(
                        error?.message || "Failed to approve transfer",
                      );
                    } finally {
                      setApprovalLoadingId(null);
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRejectRequest(request)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
        {!transferRequests?.length && (
          <p className="text-sm text-muted-foreground">
            No transfer requests yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
