import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useSignupStore } from "@/store/useSignupStore";
import { ChevronLeftIcon } from "lucide-react";

import { useStepAnimation } from "./useStepAnimation";

const normalizeTierCode = (code: string | undefined | null) =>
  String(code || "")
    .trim()
    .toLowerCase();

export function Step4ReviewConfirm() {
  const {
    pharmacyDetails,
    operationsInfo,
    ownerInfo,
    subscriptionInfo,
    termsAccepted,
    setTermsAccepted,
    validateCurrentStep,
    goToNextStep,
    setCurrentStep,
    buildSignupSubmissionData,
    errors,
  } = useSignupStore();
  const containerRef = useStepAnimation();
  const planResponse = useQuery(
    (api.auth as any).queries.getSignupSubscriptionPlans,
    {},
  ) as any[] | undefined;
  const plans = useMemo(() => planResponse ?? [], [planResponse]);

  const selectedPlan = useMemo(
    () =>
      plans.find(
        (plan: any) =>
          normalizeTierCode(plan?.code) ===
          normalizeTierCode(subscriptionInfo.selectedTier),
      ),
    [plans, subscriptionInfo.selectedTier],
  );

  const recommendedPlan = useMemo(
    () =>
      plans.find(
        (plan: any) =>
          normalizeTierCode(plan?.code) ===
          normalizeTierCode(subscriptionInfo.recommendedTier),
      ),
    [plans, subscriptionInfo.recommendedTier],
  );

  const handleContinue = () => {
    if (!validateCurrentStep(5)) return;

    const pendingSignupData = buildSignupSubmissionData();
    sessionStorage.setItem(
      "pendingSignupData",
      JSON.stringify(pendingSignupData),
    );

    goToNextStep();
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentStep(3)}
          className="h-8 w-8 rounded-lg"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div>
          <p className="text-sm font-bold">Review & Confirm</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">
            Step 4 of 5
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-input p-4 bg-card">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">Pharmacy Information</p>
          <button
            type="button"
            className="text-xs font-semibold text-primary"
            onClick={() => setCurrentStep(1)}
          >
            Edit
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Name:</span>{" "}
            {pharmacyDetails.pharmacyName}
          </p>
          <p>
            <span className="font-semibold text-foreground">License:</span>{" "}
            {pharmacyDetails.licenseCode}
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Primary Location:
            </span>{" "}
            {pharmacyDetails.locations}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-input p-4 bg-card">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">Operations</p>
          <button
            type="button"
            className="text-xs font-semibold text-primary"
            onClick={() => setCurrentStep(1)}
          >
            Edit
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">
              Total Branches:
            </span>{" "}
            {operationsInfo.totalBranches}
          </p>
          <p>
            <span className="font-semibold text-foreground">Total Staff:</span>{" "}
            {operationsInfo.totalStaff}
          </p>
          <p>
            <span className="font-semibold text-foreground">Breakdown:</span>{" "}
            {operationsInfo.pharmacistCount} pharmacist,{" "}
            {operationsInfo.managerCount} manager, {operationsInfo.cashierCount}{" "}
            cashier
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-input p-4 bg-card">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">Subscription</p>
          <button
            type="button"
            className="text-xs font-semibold text-primary"
            onClick={() => setCurrentStep(2)}
          >
            Edit
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Selected:</span>{" "}
            {selectedPlan?.name || subscriptionInfo.selectedTier.toUpperCase()}
          </p>
          {selectedPlan && (
            <p>
              <span className="font-semibold text-foreground">Price:</span> ETB{" "}
              {selectedPlan.price} / month
            </p>
          )}
          <p>
            <span className="font-semibold text-foreground">Recommended:</span>{" "}
            {recommendedPlan?.name ||
              subscriptionInfo.recommendedTier.toUpperCase()}
          </p>
          <p>
            Payment is sent after approval using secure Chapa finish-payment
            link.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-input p-4 bg-card">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">Owner Information</p>
          <button
            type="button"
            className="text-xs font-semibold text-primary"
            onClick={() => setCurrentStep(3)}
          >
            Edit
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Name:</span>{" "}
            {ownerInfo.fullName}
          </p>
          <p>
            <span className="font-semibold text-foreground">Email:</span>{" "}
            {ownerInfo.email}
          </p>
          <p>
            <span className="font-semibold text-foreground">Phone:</span>{" "}
            {ownerInfo.phone}
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-input p-3 bg-muted/30 cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-input"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I confirm the provided information is accurate and I agree to
          PharmaCare terms and privacy policy.
        </span>
      </label>

      {errors.termsAccepted && (
        <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide">
          {errors.termsAccepted}
        </p>
      )}

      <Button
        onClick={handleContinue}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide"
      >
        Submit & Continue to Email Verification
      </Button>
    </div>
  );
}
