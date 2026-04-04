"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import gsap from "gsap";

import { AuthLayout } from "@/components/shared/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSignupStore } from "@/store/useSignupStore";

import {
  BuildingIcon,
  CheckCircle2,
  ChevronLeftIcon,
  Eye,
  EyeOff,
  HashIcon,
  Loader2Icon,
  MailIcon,
  MapPinIcon,
  Minus,
  PhoneIcon,
  Plus,
  ShieldCheckIcon,
  StoreIcon,
  UserRoundIcon,
} from "lucide-react";

const STEP_LABELS = ["Pharmacy", "Subscription", "Owner", "Review", "Verify"];

function useStepAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current!.children,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: "power1.out" },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const Step1PharmacyOperations = () => {
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
};

const Step2Subscription = () => {
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

  const normalizeTierCode = (code: string | undefined | null) =>
    String(code || "")
      .trim()
      .toLowerCase();

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
};

const Step3OwnerInfo = () => {
  const {
    ownerInfo,
    errors,
    setOwnerInfo,
    validateCurrentStep,
    goToNextStep,
    goToPreviousStep,
  } = useSignupStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const containerRef = useStepAnimation();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(4)) return;
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
          <p className="text-sm font-bold">Owner Information</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">
            Step 3 of 5
          </p>
        </div>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Full Name
          </Label>
          <div className="relative">
            <Input
              value={ownerInfo.fullName}
              onChange={(e) => setOwnerInfo("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={cn(
                "h-12 ps-11 bg-card border-input focus:border-primary rounded-xl",
                errors.fullName ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <UserRoundIcon className="size-4" />
            </div>
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Email Address
          </Label>
          <div className="relative">
            <Input
              type="email"
              value={ownerInfo.email}
              onChange={(e) => setOwnerInfo("email", e.target.value)}
              placeholder="owner@pharmacy.com"
              className={cn(
                "h-12 ps-11 bg-card border-input focus:border-primary rounded-xl",
                errors.email ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <MailIcon className="size-4" />
            </div>
          </div>
          {errors.email && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Phone Number
          </Label>
          <div className="relative">
            <Input
              value={ownerInfo.phone}
              onChange={(e) => setOwnerInfo("phone", e.target.value)}
              placeholder="09XXXXXXXX"
              className={cn(
                "h-12 ps-11 bg-card border-input focus:border-primary rounded-xl",
                errors.phone ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <PhoneIcon className="size-4" />
            </div>
          </div>
          {errors.phone && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Password
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={ownerInfo.password}
              onChange={(e) => setOwnerInfo("password", e.target.value)}
              placeholder="Minimum 8 characters"
              className={cn(
                "h-12 ps-11 pr-11 bg-card border-input focus:border-primary rounded-xl",
                errors.password ? "border-red-500" : "",
              )}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
              <ShieldCheckIcon className="size-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.password}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={ownerInfo.confirmPassword}
              onChange={(e) => setOwnerInfo("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              className={cn(
                "h-12 pr-11 bg-card border-input focus:border-primary rounded-xl",
                errors.confirmPassword ? "border-red-500" : "",
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide"
        >
          Continue to Review
        </Button>
      </form>
    </div>
  );
};

const Step4ReviewConfirm = () => {
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

  const normalizeTierCode = (code: string | undefined | null) =>
    String(code || "")
      .trim()
      .toLowerCase();

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
};

const Step5Verification = () => {
  const { ownerInfo, goToPreviousStep } = useSignupStore();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [accountSubmitted, setAccountSubmitted] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const hasBootstrappedRef = useRef(false);
  const containerRef = useStepAnimation();

  const signUpMutation = useMutation(api.auth.mutations.signUpWithEmail);
  const verifyMutation = useMutation(api.auth.mutations.verifyEmail);
  const signInMutation = useMutation(api.auth.mutations.signInWithEmail);
  const sendVerificationEmail = useMutation(
    api.auth.mutations.sendVerificationEmail,
  );

  const sendVerificationCode = useCallback(
    async (email: string) => {
      const resendResult = await sendVerificationEmail({ email });
      if (resendResult?.deliveryStatus === "already_verified") {
        throw new Error(
          "This email is already verified. Please sign in instead.",
        );
      }

      if (!resendResult?.success || !resendResult?.emailSent) {
        throw new Error(
          resendResult?.message ||
            "Verification code could not be sent. Please try again.",
        );
      }
    },
    [sendVerificationEmail],
  );

  const submitAccount = useCallback(async () => {
    const rawPendingData = sessionStorage.getItem("pendingSignupData");
    const payload = rawPendingData ? JSON.parse(rawPendingData) : null;

    if (!payload) {
      throw new Error("Missing registration data. Please go back to review.");
    }

    let signUpResult: any;
    try {
      signUpResult = await signUpMutation({
        email: payload.email,
        password: payload.password,
        full_name: payload.full_name,
        phone: payload.phone,
        pharmacyDetails: payload.pharmacyDetails,
        operations: payload.operations,
        subscription: payload.subscription,
        signupSnapshot: payload.signupSnapshot,
      });
    } catch (error: any) {
      const message = String(error?.message || "");
      if (message.toLowerCase().includes("please sign in")) {
        throw new Error(
          "This email already has a verified account. Please sign in.",
        );
      }
      throw error;
    }

    if (!signUpResult?.emailSent) {
      await sendVerificationCode(payload.email);
    }

    sessionStorage.setItem(
      "pendingVerificationEmail",
      normalizeEmail(payload.email),
    );
    sessionStorage.setItem("tempPassword", payload.password);
    setAccountSubmitted(true);
    setSubmissionError(null);
    toast.success(
      signUpResult?.message ||
        "Account submitted. Verification code sent to your email.",
    );
  }, [sendVerificationCode, signUpMutation]);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    const pendingEmail = sessionStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setAccountSubmitted(true);
      return;
    }

    let isMounted = true;
    const bootstrap = async () => {
      setIsSubmittingAccount(true);
      try {
        await submitAccount();
      } catch (error: any) {
        if (isMounted) {
          setSubmissionError(error.message || "Failed to submit account");
          toast.error(error.message || "Failed to submit account");
        }
      } finally {
        if (isMounted) setIsSubmittingAccount(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [submitAccount]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setIsLoading(true);

    try {
      if (!accountSubmitted) {
        await submitAccount();
      }

      const email = sessionStorage.getItem("pendingVerificationEmail");
      const tempPassword = sessionStorage.getItem("tempPassword");

      if (!email || !tempPassword) {
        throw new Error("Session expired. Please restart signup.");
      }

      await verifyMutation({ email, token: code });
      const result = await signInMutation({ email, password: tempPassword });

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to sign in after verification",
        );
      }

      if ("sessionToken" in result && result.sessionToken) {
        localStorage.setItem("sessionToken", result.sessionToken);
      }

      sessionStorage.removeItem("pendingVerificationEmail");
      sessionStorage.removeItem("tempPassword");

      localStorage.setItem("pendingEmail", normalizeEmail(email));
      localStorage.setItem(
        "pendingPharmacyName",
        useSignupStore.getState().pharmacyDetails.pharmacyName,
      );
      localStorage.setItem("pendingRequestType", "head_manager");
      toast.success(
        "Verification complete. Your application is pending approval.",
      );
      window.location.href = "/auth/pending-approval";
    } catch (err: any) {
      toast.error(
        err.message ||
          "Verification failed. Please check the code and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      const email =
        sessionStorage.getItem("pendingVerificationEmail") || ownerInfo.email;
      if (!email) {
        throw new Error("Email not found. Please restart signup.");
      }
      await sendVerificationCode(email);
      toast.success(`A new verification code was sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code");
    } finally {
      setTimeout(() => setIsResending(false), 2500);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 text-center pt-2">
      <div className="flex justify-start">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousStep}
          className="h-8 w-8 rounded-lg"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
      </div>

      <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-sm border border-accent">
        <MailIcon className="size-8 text-accent-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold font-display text-foreground">
          Verify Your Email
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to
          <br />
          <span className="font-bold text-foreground">
            {sessionStorage.getItem("pendingVerificationEmail") ||
              ownerInfo.email}
          </span>
        </p>
        {!accountSubmitted && (
          <p className="text-xs text-muted-foreground">
            Preparing your account and sending verification code...
          </p>
        )}
        {submissionError && (
          <p className="text-xs text-red-600 font-semibold">
            {submissionError}
          </p>
        )}
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <Input
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="h-16 text-center text-3xl tracking-[0.5em] font-bold bg-muted border-input rounded-xl"
          required
          autoFocus
        />

        <Button
          type="submit"
          disabled={isLoading || isSubmittingAccount || code.length !== 6}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2Icon className="size-4 animate-spin" /> Verifying...
            </span>
          ) : isSubmittingAccount ? (
            <span className="flex items-center gap-2">
              <Loader2Icon className="size-4 animate-spin" /> Submitting
              Account...
            </span>
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>

      <Button
        variant="ghost"
        onClick={handleResendCode}
        disabled={isResending}
        className="text-sm font-semibold"
      >
        {isResending ? "Sending..." : "Resend Code"}
      </Button>
    </div>
  );
};

export function SignupPage() {
  const { currentStep, resetSignup } = useSignupStore();

  useEffect(() => {
    resetSignup();
  }, [resetSignup]);

  const progressWidth = ((currentStep - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <AuthLayout>
      <div className="absolute top-8 left-6 sm:top-12 sm:left-12 z-20 hidden lg:block">
        <Button
          variant="ghost"
          asChild
          className="hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground font-semibold text-sm h-10 px-4"
        >
          <Link to="/">
            <ChevronLeftIcon className="size-4 me-2" />
            Home
          </Link>
        </Button>
      </div>

      <div className="mb-10 w-full max-w-sm xl:max-w-md mx-auto pt-8 lg:pt-0">
        <div className="flex justify-between mb-2">
          {STEP_LABELS.map((label, i) => {
            const stepNumber = i + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-muted text-foreground border border-input"
                        : "bg-card text-muted-foreground border border-input",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-sm xl:max-w-md mx-auto">
        <div className="flex flex-col space-y-2 text-left mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Create Your Account
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Complete your setup in a few steps. Payment is finalized only after
            approval.
          </p>
        </div>

        {currentStep === 1 && <Step1PharmacyOperations />}
        {currentStep === 2 && <Step2Subscription />}
        {currentStep === 3 && <Step3OwnerInfo />}
        {currentStep === 4 && <Step4ReviewConfirm />}
        {currentStep === 5 && <Step5Verification />}

        {currentStep < 5 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-bold text-foreground hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
