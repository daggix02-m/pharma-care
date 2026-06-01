import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { TransferRequestForm } from "./TransferRequestForm";
import { TransferRequestsList } from "./TransferRequestsList";
import { RejectTransferDialog } from "./RejectTransferDialog";

export function TransferRequestsSection() {
  const { sessionToken } = useAuth();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestForReject, setSelectedRequestForReject] =
    useState<any>(null);

  const transferOptions = useQuery(
    (api as any).stockTransfers.getTransferFormOptions,
    sessionToken ? { sessionToken } : "skip",
  );
  const requestTransfer = useMutation(
    (api as any).stockTransfers.requestStockTransfer,
  );
  const approveTransfer = useMutation(
    (api as any).stockTransfers.approveStockTransferRequest,
  );
  const rejectTransfer = useMutation(
    (api as any).stockTransfers.rejectStockTransferRequest,
  );

  const canApprove = Boolean(transferOptions?.canApproveAsManager);

  return (
    <div className="space-y-6">
      <TransferRequestForm
        transferOptions={transferOptions}
        canApprove={canApprove}
        sessionToken={sessionToken}
        requestTransfer={requestTransfer}
      />
      <TransferRequestsList
        canApprove={canApprove}
        sessionToken={sessionToken}
        approveTransfer={approveTransfer}
        onRejectRequest={(request) => {
          setSelectedRequestForReject(request);
          setRejectDialogOpen(true);
        }}
      />
      <RejectTransferDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        request={selectedRequestForReject}
        sessionToken={sessionToken}
        rejectTransfer={rejectTransfer}
      />
    </div>
  );
}
