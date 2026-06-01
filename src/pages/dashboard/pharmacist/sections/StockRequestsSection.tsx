import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { NewRequestDialog, TransferRequestForm } from "./StockRequestsParts";

export function StockRequestsSection() {
  const { sessionToken } = useAuth();
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const transferOptions = useQuery(
    (api as any).stockTransfers.getTransferFormOptions,
    sessionToken ? { sessionToken } : "skip",
  );
  const transferRequests = useQuery(
    (api as any).stockTransfers.getTransferRequestsForPharmacy,
    sessionToken ? { sessionToken } : "skip",
  );
  const requests = useQuery(
    api.pharmacist.queries.getStockRequests,
    sessionToken ? { sessionToken } : "skip",
  );
  if (!requests || !medicines) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display">
          Replenishment Requests
        </h2>
        <Button
          className="rounded-xl h-10 gap-2"
          onClick={() => setNewRequestOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>
      <div className="grid gap-4">
        {requests.map(
          (r: {
            _id: string;
            medicineName: string;
            quantity: number;
            urgency: string;
            status: string;
          }) => (
            <div
              key={r._id}
              className="minimal-card p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-[15px]">{r.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {r.quantity} · Urgency:{" "}
                    <span className="capitalize">{r.urgency}</span>
                  </p>
                </div>
              </div>
              <Badge className="capitalize px-3 h-7">{r.status}</Badge>
            </div>
          ),
        )}
      </div>

      <TransferRequestForm
        sessionToken={sessionToken}
        transferOptions={transferOptions}
      />

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Transfer Request History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(transferRequests || []).map((request: any) => (
            <div
              key={request._id}
              className="rounded-lg border border-border/40 p-3"
            >
              <p className="font-medium text-sm">
                {request.medicineSnapshot?.name} · {request.quantity} units
              </p>
              <p className="text-xs text-muted-foreground">
                {request.fromBranchName} to {request.toBranchName}
              </p>
              <Badge className="capitalize mt-2">
                {request.status.replace(/_/g, " ")}
              </Badge>
            </div>
          ))}
          {!transferRequests?.length && (
            <p className="text-sm text-muted-foreground">
              No transfer requests yet.
            </p>
          )}
        </CardContent>
      </Card>

      <NewRequestDialog
        open={newRequestOpen}
        onOpenChange={setNewRequestOpen}
        sessionToken={sessionToken}
        medicines={medicines}
      />
    </div>
  );
}
