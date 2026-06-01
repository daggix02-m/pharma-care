import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Search, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationCard } from "./ApplicationCard";
import { RejectApplicationDialog } from "./RejectApplicationDialog";
import { LegacyCleanupDialog } from "./LegacyCleanupDialog";

export function ApprovalsSection() {
  const { sessionToken } = useAuth();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState<
    null | "preview" | "execute"
  >(null);
  const [cleanupStats, setCleanupStats] = useState<any | null>(null);

  const pendingApplications = useQuery(
    api.admin.queries.getPendingPharmacyApplications,
    sessionToken ? { sessionToken, search: searchQuery } : "skip",
  );

  const approveApplication = useMutation(
    api.admin.mutations.approvePharmacyApplication,
  );
  const rejectApplication = useMutation(
    api.admin.mutations.rejectPharmacyApplication,
  );
  const cleanupLegacyRejectedStates = useMutation(
    api.admin.mutations.cleanupLegacyRejectedOwnerStates,
  );

  const isLoading = pendingApplications === undefined;

  const submitRejection = async (reason: string) => {
    if (!selectedApplication) return;
    setRejectingId(selectedApplication.pharmacyId);
    try {
      await rejectApplication({
        pharmacyId: selectedApplication.pharmacyId,
        reason,
        sessionToken: sessionToken || undefined,
      });
      toast.success("Application rejected");
      setRejectDialogOpen(false);
      setSelectedApplication(null);
    } catch {
      toast.error("Failed to reject application");
    } finally {
      setRejectingId(null);
    }
  };

  const runLegacyCleanup = async (dryRun: boolean) => {
    setCleanupLoading(dryRun ? "preview" : "execute");
    try {
      const stats = await cleanupLegacyRejectedStates({
        sessionToken: sessionToken || undefined,
        dryRun,
        limit: 500,
      });
      setCleanupStats(stats);
      if (dryRun) {
        toast.success(
          `Preview complete: ${stats.cleanedOwners} rejected owner states eligible for cleanup`,
        );
        return;
      }
      toast.success(
        `Cleanup complete: removed ${stats.cleanedOwners} rejected owner states`,
      );
      setCleanupDialogOpen(false);
    } catch {
      toast.error("Failed to run legacy cleanup");
    } finally {
      setCleanupLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="minimal-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Pharmacy Applications
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2.5">
              {pendingApplications.length}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => setCleanupDialogOpen(true)}
            >
              Legacy Cleanup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by owner or pharmacy email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          {pendingApplications.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                All clear. No pending pharmacy applications.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingApplications.map((application: any) => (
                <ApplicationCard
                  key={application.pharmacyId || application.ownerId}
                  application={application}
                  isApproving={approvingId === application.pharmacyId}
                  isRejecting={rejectingId === application.pharmacyId}
                  onApprove={async () => {
                    if (!application.pharmacyId) {
                      toast.error(
                        "Cannot approve yet: pharmacy record is still being created.",
                      );
                      return;
                    }
                    setApprovingId(application.pharmacyId);
                    try {
                      await approveApplication({
                        pharmacyId: application.pharmacyId,
                        sessionToken: sessionToken || undefined,
                      });
                      toast.success("Application approved");
                    } catch {
                      toast.error("Failed to approve application");
                    } finally {
                      setApprovingId(null);
                    }
                  }}
                  onReject={() => {
                    setSelectedApplication(application);
                    setRejectDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RejectApplicationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        isSubmitting={Boolean(rejectingId)}
        onSubmit={submitRejection}
      />

      <LegacyCleanupDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
        cleanupLoading={cleanupLoading}
        cleanupStats={cleanupStats}
        onPreview={() => runLegacyCleanup(true)}
        onExecute={() => runLegacyCleanup(false)}
      />
    </div>
  );
}
