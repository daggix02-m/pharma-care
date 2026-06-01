import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSignupStore } from "@/store/useSignupStore";
import { ChevronLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { useStepAnimation } from "./useStepAnimation";

const normalizeTierCode = (code: string | undefined | null) =>
  String(code || "")
    .trim()
    .toLowerCase();

export function Step2Subscription() {
  const {
    operationsInfo,
    subscriptionInfo,
    setSubscriptionInfo,
    validateCurrentStep,
    goToNextStep,
    goToPreviousStep,
    errors,
  } = useSignupStore();
  const containerRef = useStepAnimation();

  const planResponse = useQuery(
    (api.auth as any).queries.getSignupSubscriptionPlans,
    {},
  ) as any[] | undefined;
  const plans = useMemo(() => planResponse ?? [], [planResponse]);
  const isPlansLoading = planResponse === undefined;

  const normalizedPlans = useMemo(
    () =>
      plans
        .map((plan: any) => ({
          ...plan,
          code: normalizeTierCode(plan?.code),
          maxBranches:
            typeof plan?.maxBranches === "number" ? plan.maxBranches : 0,
          maxUsers: typeof plan?.maxUsers === "number" ? plan.maxUsers : 0,
          price: typeof plan?.price === "number" ? plan.price : 0,
          currency: "ETB",
        }))
        .filter((plan: any) => plan.code),
    [plans],
  );

  const recommendedPlan = useMemo(() => {
    if (normalizedPlans.length === 0) return null;

    const compatiblePlans = normalizedPlans
      .filter(
        (plan: any) =>
          plan.maxBranches >= operationsInfo.totalBranches &&
          plan.maxUsers >= operationsInfo.totalStaff,
      )
      .sort((a: any, b: any) => a.price - b.price);

    if (compatiblePlans.length > 0) {
      return compatiblePlans[0];
    }

    return [...normalizedPlans].sort((a: any, b: any) => {
      if (b.maxBranches !== a.maxBranches) return b.maxBranches - a.maxBranches;
      if (b.maxUsers !== a.maxUsers) return b.maxUsers - a.maxUsers;
      return a.price - b.price;
    })[0];
  }, [
    normalizedPlans,
    operationsInfo.totalBranches,
    operationsInfo.totalStaff,
  ]);

  const recommendedTier = useMemo(
    () => normalizeTierCode(recommendedPlan?.code),
    [recommendedPlan],
  );

  useEffect(() => {
    if (!isPlansLoading && normalizedPlans.length === 0) {
      if (!normalizeTierCode(subscriptionInfo.recommendedTier)) {
        setSubscriptionInfo("recommendedTier", "basic");
      }
      if (!normalizeTierCode(subscriptionInfo.selectedTier)) {
        setSubscriptionInfo("selectedTier", "basic");
      }
      return;
    }

    if (!recommendedTier) return;

    if (
      normalizeTierCode(subscriptionInfo.recommendedTier) !== recommendedTier
    ) {
      setSubscriptionInfo("recommendedTier", recommendedTier);
    }

    const selectedCode = normalizeTierCode(subscriptionInfo.selectedTier);
    const selectedIsAvailable = normalizedPlans.some(
      (plan: any) => plan.code === selectedCode,
    );

    if (!selectedIsAvailable) {
      setSubscriptionInfo("selectedTier", recommendedTier);
    }
  }, [
    normalizedPlans,
    recommendedTier,
    setSubscriptionInfo,
    subscriptionInfo.recommendedTier,
    subscriptionInfo.selectedTier,
  ]);

  const handleContinue = () => {
    if (!isPlansLoading && normalizedPlans.length === 0) {
      if (!normalizeTierCode(subscriptionInfo.selectedTier)) {
        setSubscriptionInfo("selectedTier", "basic");
      }
      if (!validateCurrentStep(3)) return;
      goToNextStep();
      return;
    }

    const selectedCode = normalizeTierCode(subscriptionInfo.selectedTier);
    const selectedIsAvailable = normalizedPlans.some(
      (plan: any) => plan.code === selectedCode,
    );

    if (!selectedIsAvailable) {
      toast.error("Please select an active subscription plan.");
      return;
    }

    if (!validateCurrentStep(3)) return;
    goToNextStep();
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousStep}
          className="h-8 w-8 rounded-lg"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div>
          <p className="text-sm font-bold">Subscription Options</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">
            Step 2 of 5
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-semibold">Recommended Plan</p>
        <p className="text-xs text-muted-foreground mt-1">
          Based on {operationsInfo.totalBranches} branch(es) and{" "}
          {operationsInfo.totalStaff} planned staff, we recommend
          <span className="font-bold text-foreground">
            {" "}
            {recommendedPlan?.name || "the best available plan"}
          </span>
          .
        </p>
        {recommendedPlan && (
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-8 text-xs"
            onClick={() =>
              setSubscriptionInfo("selectedTier", recommendedPlan.code)
            }
          >
            Choose Recommended Plan
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isPlansLoading ? (
          <div className="rounded-xl border border-input p-4 text-sm text-muted-foreground">
            Loading available plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-input p-4 text-sm text-muted-foreground">
            No active subscription plans are available right now. You can still
            continue and we will assign a starter plan after admin approval.
          </div>
        ) : (
          plans.map((plan: any) => {
            const planCode = normalizeTierCode(plan?.code);
            const selected =
              normalizeTierCode(subscriptionInfo.selectedTier) === planCode;
            const recommended = normalizeTierCode(recommendedTier) === planCode;

            const planName = plan?.name || "Unnamed plan";
            const planDescription = plan?.description || "Subscription plan";
            const planPrice =
              typeof plan?.price === "number"
                ? `ETB ${plan.price} / month`
                : "Pricing unavailable";
            const maxBranches =
              typeof plan?.maxBranches === "number" ? plan.maxBranches : "N/A";
            const maxUsers =
              typeof plan?.maxUsers === "number" ? plan.maxUsers : "N/A";
            const planFeatures = Array.isArray(plan?.features)
              ? plan.features.filter((feature: unknown) => {
                  return (
                    typeof feature === "string" && feature.trim().length > 0
                  );
                })
              : [];

            return (
              <button
                key={plan._id || `${planName}-${planCode}`}
                type="button"
                onClick={() => {
                  if (!planCode) return;
                  setSubscriptionInfo("selectedTier", planCode);
                }}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-base">{planName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {planDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{planPrice}</p>
                    {recommended && (
                      <p className="text-[10px] mt-1 font-bold text-primary uppercase tracking-wider">
                        Recommended
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <p>Branches: {maxBranches}</p>
                  <p>Users: {maxUsers}</p>
                </div>

                <div className="mt-3 rounded-lg border border-input/70 bg-muted/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Included in this plan
                  </p>
                  {planFeatures.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-foreground/90">
                      {planFeatures.slice(0, 6).map((feature: string) => (
                        <li
                          key={`${planCode}-${feature}`}
                          className="truncate before:content-['-'] before:mr-1.5 before:text-primary"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Plan features will be shown here once configured by admin.
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {errors.selectedTier && (
        <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide">
          {errors.selectedTier}
        </p>
      )}

      <p className="text-xs text-muted-foreground rounded-lg border border-input p-3 bg-muted/30">
        Payment is completed after admin approval. You will receive a secure
        Chapa finish-payment link by email.
      </p>

      <Button
        onClick={handleContinue}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide"
      >
        Continue to Owner Info
      </Button>
    </div>
  );
}
