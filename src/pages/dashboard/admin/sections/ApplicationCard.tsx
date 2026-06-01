import { CheckCircle, XCircle, Mail, Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface ApplicationCardProps {
  application: any;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function ApplicationCard({
  application,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: ApplicationCardProps) {
  const snapshot = application.signupSnapshot;
  const step1Pharmacy = snapshot?.step1Pharmacy;
  const step1Operations = snapshot?.step1Operations;
  const step2Subscription = snapshot?.step2Subscription;
  const step3Owner = snapshot?.step3Owner;
  const step4Review = snapshot?.step4Review;

  const snapshotPrimaryLocation = String(
    step1Pharmacy?.primaryLocation || "",
  ).trim();
  const persistedPrimaryLocation = String(
    application.signupLocation || application.primaryLocation || "",
  ).trim();
  const snapshotBranchLocations = (step1Operations?.branchLocations || [])
    .map((location: string) => String(location || "").trim())
    .filter(Boolean);
  const persistedBranchLocations = (application.plannedBranchLocations || [])
    .map((location: string) => String(location || "").trim())
    .filter(Boolean);

  const pharmacyName = step1Pharmacy?.pharmacyName || application.pharmacyName;
  const ownerEmail =
    step3Owner?.email || application.ownerEmail || "No owner email";
  const pharmacyEmail =
    step1Pharmacy?.pharmacyEmail ||
    application.pharmacyEmail ||
    "No pharmacy email";
  const ownerPhone =
    step3Owner?.phone || application.ownerPhone || "No owner phone";

  const licenseLabel = step1Pharmacy?.licenseLabel || "License Number";
  const licenseValue =
    step1Pharmacy?.licenseCode || application.licenseCode || "N/A";
  const primaryLocationLabel =
    step1Pharmacy?.primaryLocationLabel || "Primary Location";
  const primaryLocationValue =
    snapshotPrimaryLocation ||
    persistedPrimaryLocation ||
    snapshotBranchLocations[0] ||
    persistedBranchLocations[0] ||
    "Not provided";
  const pharmacyEmailLabel =
    step1Pharmacy?.pharmacyEmailLabel || "Pharmacy Email (Optional)";

  const ownerNameLabel = step3Owner?.nameLabel || "Full Name";
  const ownerNameValue = step3Owner?.fullName || application.ownerName || "N/A";
  const ownerEmailLabel = step3Owner?.emailLabel || "Email Address";
  const ownerPhoneLabel = step3Owner?.phoneLabel || "Phone Number";

  const selectedLabel = step2Subscription?.selectedLabel || "Selected";
  const selectedValue =
    step2Subscription?.selectedTier || application.selectedTier || "";
  const recommendedLabel = step2Subscription?.recommendedLabel || "Recommended";
  const recommendedValue =
    step2Subscription?.recommendedTier || application.recommendedTier || "";

  const totalBranchesLabel =
    step1Operations?.totalBranchesLabel || "Total Branches";
  const totalBranchesRaw =
    step1Operations?.totalBranches ?? application.plannedBranches;
  const totalBranchesValue = totalBranchesRaw ?? "N/A";
  const totalStaffLabel = step1Operations?.totalStaffLabel || "Total Staff";
  const totalStaffValue =
    step1Operations?.totalStaff ?? application.plannedStaffTotal ?? "N/A";
  const branchSetupLabel =
    step1Operations?.branchSetupLabel || "Branch Locations";

  const resolvedBranchLocations = snapshotBranchLocations.length
    ? snapshotBranchLocations
    : persistedBranchLocations;

  const parsedTotalBranches = Number(totalBranchesRaw);
  const totalBranchesCount = Number.isFinite(parsedTotalBranches)
    ? parsedTotalBranches
    : 0;

  const branchSetupValue = resolvedBranchLocations.length
    ? resolvedBranchLocations.join(", ")
    : totalBranchesCount >= 1 && primaryLocationValue !== "Not provided"
      ? primaryLocationValue
      : "Not provided";
  const breakdownLabel = step1Operations?.breakdownLabel || "Breakdown";
  const pharmacists =
    step1Operations?.pharmacists ??
    application.plannedStaffBreakdown?.pharmacists;
  const managers =
    step1Operations?.managers ?? application.plannedStaffBreakdown?.managers;
  const cashiers =
    step1Operations?.cashiers ?? application.plannedStaffBreakdown?.cashiers;

  const termsAcceptedLabel =
    step4Review?.termsAcceptedLabel || "Terms Accepted";
  const termsAcceptedValue =
    step4Review?.termsAccepted === undefined
      ? "N/A"
      : step4Review.termsAccepted
        ? "Yes"
        : "No";

  return (
    <div className="flex items-center justify-between p-5 rounded-2xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-background border border-border/60 flex items-center justify-center">
          <Store className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-bold text-[15px]">{pharmacyName}</p>
          <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {ownerEmail}
          </p>
          {!application.pharmacyId && (
            <p className="text-[12px] text-amber-700 mt-1">
              Waiting for linked pharmacy record before approval.
            </p>
          )}
          {application.previousRejection && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="rounded-full border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-semibold"
                title={application.previousRejection.rejectionReason}
              >
                Previous rejection on{" "}
                {formatDateTime(application.previousRejection.rejectedAt)}
              </Badge>
            </div>
          )}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">
                {licenseLabel}:
              </span>{" "}
              {licenseValue}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {primaryLocationLabel}:
              </span>{" "}
              {primaryLocationValue}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {ownerNameLabel}:
              </span>{" "}
              {ownerNameValue}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {selectedLabel}:
              </span>{" "}
              {selectedValue ? selectedValue.toUpperCase() : "N/A"}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {recommendedLabel}:
              </span>{" "}
              {recommendedValue ? recommendedValue.toUpperCase() : "N/A"}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {totalBranchesLabel}:
              </span>{" "}
              {totalBranchesValue}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {totalStaffLabel}:
              </span>{" "}
              {totalStaffValue}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-foreground">
                {branchSetupLabel}:
              </span>{" "}
              {branchSetupValue}
            </p>
            {totalBranchesCount > 1 &&
              resolvedBranchLocations.length > 0 &&
              resolvedBranchLocations.length < totalBranchesCount && (
                <p className="sm:col-span-2 text-amber-700">
                  {totalBranchesCount} branches planned; only{" "}
                  {resolvedBranchLocations.length} location
                  {resolvedBranchLocations.length === 1 ? "" : "s"} captured.
                </p>
              )}
            <p className="sm:col-span-2">
              <span className="font-semibold text-foreground">
                {breakdownLabel}:
              </span>{" "}
              {pharmacists !== undefined &&
              managers !== undefined &&
              cashiers !== undefined
                ? `${pharmacists} pharmacists, ${managers} managers, ${cashiers} cashiers`
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {pharmacyEmailLabel}:
              </span>{" "}
              {pharmacyEmail}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {ownerEmailLabel}:
              </span>{" "}
              {ownerEmail}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {ownerPhoneLabel}:
              </span>{" "}
              {ownerPhone}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {termsAcceptedLabel}:
              </span>{" "}
              {termsAcceptedValue}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/5"
          onClick={onReject}
          disabled={!application.pharmacyId || isRejecting}
        >
          {isRejecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
        </Button>
        <Button
          size="sm"
          className="rounded-xl h-10 px-5 gap-2"
          onClick={onApprove}
          disabled={!application.pharmacyId || isApproving}
        >
          {isApproving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Approve
        </Button>
      </div>
    </div>
  );
}
