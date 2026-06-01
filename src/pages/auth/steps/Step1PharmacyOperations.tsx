import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSignupStore } from "@/store/useSignupStore";
import {
  BuildingIcon,
  HashIcon,
  MailIcon,
  MapPinIcon,
  Minus,
  Plus,
  StoreIcon,
} from "lucide-react";

import { useStepAnimation } from "./useStepAnimation";

export function Step1PharmacyOperations() {
  const {
    pharmacyDetails,
    operationsInfo,
    errors,
    setPharmacyDetails,
    setOperationsInfo,
    setBranchLocation,
    addBranchLocation,
    removeBranchLocation,
    validateCurrentStep,
    goToNextStep,
  } = useSignupStore();
  const containerRef = useStepAnimation();

  const updateTotalBranches = (value: number) => {
    const safeValue = Math.max(1, value);
    const currentLength = operationsInfo.branchLocations.length;

    if (safeValue > currentLength) {
      const extra = Array.from({ length: safeValue - currentLength }, () => "");
      setOperationsInfo("branchLocations", [
        ...operationsInfo.branchLocations,
        ...extra,
      ]);
    }

    if (safeValue < currentLength) {
      setOperationsInfo(
        "branchLocations",
        operationsInfo.branchLocations.slice(0, safeValue),
      );
    }

    setOperationsInfo("totalBranches", safeValue);
  };

  const handleContinue = () => {
    if (!validateCurrentStep(1) || !validateCurrentStep(2)) return;

    sessionStorage.setItem(
      "pendingPharmacyDetails",
      JSON.stringify({
        ...pharmacyDetails,
        branchLocations: operationsInfo.branchLocations,
      }),
    );

    goToNextStep();
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="bg-muted p-4 rounded-xl border border-input space-y-2">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-card border border-input rounded-lg shadow-sm">
            <StoreIcon className="size-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Pharmacy & Operations Setup
            </p>
            <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5 font-medium">
              Tell us about your branches and team so we can recommend the best
              subscription.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Pharmacy Name
          </Label>
          <div className="relative">
            <Input
              value={pharmacyDetails.pharmacyName}
              onChange={(e) =>
                setPharmacyDetails("pharmacyName", e.target.value)
              }
              placeholder="e.g. Addis Pharmaceutical Supply"
              className={cn(
                "h-12 ps-11 bg-card border-input focus:border-primary rounded-xl",
                errors.pharmacyName ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <BuildingIcon className="size-4" />
            </div>
          </div>
          {errors.pharmacyName && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.pharmacyName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            License Number
          </Label>
          <div className="relative">
            <Input
              value={pharmacyDetails.licenseCode}
              onChange={(e) =>
                setPharmacyDetails("licenseCode", e.target.value)
              }
              placeholder="EFDA License No."
              className={cn(
                "h-12 ps-11 bg-card border-input focus:border-primary rounded-xl",
                errors.licenseCode ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <HashIcon className="size-4" />
            </div>
          </div>
          {errors.licenseCode && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.licenseCode}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Primary Location
          </Label>
          <div className="relative">
            <Input
              value={pharmacyDetails.locations}
              onChange={(e) => setPharmacyDetails("locations", e.target.value)}
              placeholder="e.g. Bole, Addis Ababa"
              className={cn(
                "h-12 ps-11 bg-card border-input focus:border-primary rounded-xl",
                errors.locations ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <MapPinIcon className="size-4" />
            </div>
          </div>
          {errors.locations && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.locations}
            </p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Pharmacy Email (Optional)
          </Label>
          <div className="relative">
            <Input
              value={pharmacyDetails.pharmacyEmail}
              onChange={(e) =>
                setPharmacyDetails("pharmacyEmail", e.target.value)
              }
              placeholder="pharmacy@example.com"
              className={cn(
                "h-12 ps-11 bg-card border-input focus:border-primary rounded-xl",
                errors.pharmacyEmail ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <MailIcon className="size-4" />
            </div>
          </div>
          {errors.pharmacyEmail && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.pharmacyEmail}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-input p-4 space-y-4 bg-card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Branch Setup</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                updateTotalBranches(operationsInfo.totalBranches - 1)
              }
              disabled={operationsInfo.totalBranches <= 1}
            >
              <Minus className="size-4" />
            </Button>
            <span className="text-sm font-semibold w-8 text-center">
              {operationsInfo.totalBranches}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                updateTotalBranches(operationsInfo.totalBranches + 1)
              }
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {operationsInfo.branchLocations.map((location, idx) => (
            <div key={`branch-location-${idx}`} className="flex gap-2">
              <Input
                value={location}
                onChange={(e) => setBranchLocation(idx, e.target.value)}
                placeholder={`Branch ${idx + 1} location`}
                className="h-11"
              />
              {operationsInfo.branchLocations.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeBranchLocation(idx)}
                  className="h-11 w-11"
                >
                  <Minus className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={addBranchLocation}
          className="text-sm"
        >
          <Plus className="size-4 mr-2" />
          Add another branch location
        </Button>

        {errors.branchLocations && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide">
            {errors.branchLocations}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-input p-4 space-y-4 bg-card">
        <p className="text-sm font-bold">Staff Planning</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Total Staff</Label>
            <Input
              type="number"
              min={1}
              value={operationsInfo.totalStaff}
              onChange={(e) =>
                setOperationsInfo("totalStaff", Number(e.target.value || 0))
              }
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pharmacists</Label>
            <Input
              type="number"
              min={0}
              value={operationsInfo.pharmacistCount}
              onChange={(e) =>
                setOperationsInfo(
                  "pharmacistCount",
                  Number(e.target.value || 0),
                )
              }
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Managers</Label>
            <Input
              type="number"
              min={0}
              value={operationsInfo.managerCount}
              onChange={(e) =>
                setOperationsInfo("managerCount", Number(e.target.value || 0))
              }
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cashiers</Label>
            <Input
              type="number"
              min={0}
              value={operationsInfo.cashierCount}
              onChange={(e) =>
                setOperationsInfo("cashierCount", Number(e.target.value || 0))
              }
              className="h-11"
            />
          </div>
        </div>
        {(errors.totalStaff || errors.staffBreakdown) && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide">
            {errors.totalStaff || errors.staffBreakdown}
          </p>
        )}
      </div>

      <Button
        onClick={handleContinue}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide"
      >
        Continue to Subscription
      </Button>
    </div>
  );
}
