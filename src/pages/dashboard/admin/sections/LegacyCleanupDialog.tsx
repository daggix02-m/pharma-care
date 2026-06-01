import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LegacyCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cleanupLoading: null | "preview" | "execute";
  cleanupStats: any | null;
  onPreview: () => Promise<void>;
  onExecute: () => Promise<void>;
}

export function LegacyCleanupDialog({
  open,
  onOpenChange,
  cleanupLoading,
  cleanupStats,
  onPreview,
  onExecute,
}: LegacyCleanupDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cleanup Legacy Rejected States</AlertDialogTitle>
          <AlertDialogDescription>
            This removes old rejected owner/pharmacy records and keeps their
            rejection history for 12 months.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Always run preview first. Then execute cleanup if the numbers look
            correct.
          </p>
          {cleanupStats && (
            <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-2">
              <p>
                Rejected owners scanned: {cleanupStats.scannedRejectedOwners}
              </p>
              <p>Owners cleaned: {cleanupStats.cleanedOwners}</p>
              <p>
                History records created: {cleanupStats.historyRecordsCreated}
              </p>
              <p>
                Orphan rejected pharmacies removed:{" "}
                {cleanupStats.deletedOrphanRejectedPharmacies}
              </p>
              {Array.isArray(cleanupStats.previewOwners) &&
                cleanupStats.previewOwners.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <p className="font-semibold text-foreground">
                      Preview Accounts ({cleanupStats.previewOwners.length})
                    </p>
                    <div className="max-h-56 overflow-auto pr-1 space-y-2">
                      {cleanupStats.previewOwners.map(
                        (owner: any, index: number) => (
                          <div
                            key={`${owner.ownerId}-${index}`}
                            className="rounded-md border border-border/50 bg-background/70 p-2"
                          >
                            <p className="font-medium text-foreground">
                              {owner.ownerName || "Unknown owner"}
                            </p>
                            <p className="text-muted-foreground">
                              {owner.ownerEmail || "No email"}
                            </p>
                            <p className="text-muted-foreground">
                              Pharmacy: {owner.pharmacyName || "N/A"}
                            </p>
                            <p className="text-muted-foreground">
                              Primary Location (set during signup):{" "}
                              {owner.signupLocation || "N/A"}
                            </p>
                            <p className="text-muted-foreground">
                              Branch Setup (from signup):{" "}
                              {owner.plannedBranchLocations?.length
                                ? owner.plannedBranchLocations.join(", ")
                                : "No branch setup provided"}
                            </p>
                            <p className="text-muted-foreground">
                              License: {owner.licenseCode || "N/A"}
                            </p>
                            <p className="text-muted-foreground">
                              Phone: {owner.ownerPhone || "N/A"}
                            </p>
                            <p className="text-muted-foreground">
                              Status: owner {owner.ownerStatus || "unknown"}
                              {", pharmacy "}
                              {owner.pharmacyStatus || "missing"}
                            </p>
                            <p className="text-muted-foreground">
                              Rejection: {owner.rejectionReason}
                            </p>
                            <p className="text-muted-foreground">
                              Rejected at: {formatDateTime(owner.rejectedAt)}
                            </p>
                            <p className="text-muted-foreground">
                              History:{" "}
                              {owner.historyAlreadyExists
                                ? "exists"
                                : "new record"}
                            </p>
                            <p className="text-muted-foreground">
                              Retains until:{" "}
                              {formatDateTime(owner.retentionUntil)}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={Boolean(cleanupLoading)}>
            Close
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={() => {
              void onPreview();
            }}
            disabled={Boolean(cleanupLoading)}
          >
            {cleanupLoading === "preview" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Previewing...
              </span>
            ) : (
              "Run Preview"
            )}
          </Button>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void onExecute();
            }}
            disabled={Boolean(cleanupLoading)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {cleanupLoading === "execute" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cleaning...
              </span>
            ) : (
              "Execute Cleanup"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
