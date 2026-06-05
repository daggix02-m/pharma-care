import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { cn } from "@/lib/utils";
import { useSignupStore } from "@/store/useSignupStore";
import { CheckCircle2, ChevronLeftIcon } from "lucide-react";

import { STEP_LABELS } from "./types";
import { Step1PharmacyOperations } from "./steps/Step1PharmacyOperations";
import { Step2Subscription } from "./steps/Step2Subscription";
import { Step3OwnerInfo } from "./steps/Step3OwnerInfo";
import { Step4ReviewConfirm } from "./steps/Step4ReviewConfirm";
import { Step5Verification } from "./steps/Step5Verification";

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

      <div className="mb-10 w-full max-w-sm md:max-w-md xl:max-w-lg mx-auto pt-28 lg:pt-0">
        <div className="flex justify-between mb-2 gap-1 overflow-x-auto">
          {STEP_LABELS.map((label, i) => {
            const stepNumber = i + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div
                key={label}
                className="flex flex-col items-center gap-2 shrink-0"
              >
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
                    "text-[10px] font-bold uppercase tracking-widest block",
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

      <div className="w-full max-w-sm md:max-w-md xl:max-w-lg mx-auto">
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
