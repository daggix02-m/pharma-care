import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSignupStore } from "@/store/useSignupStore";
import {
  ChevronLeftIcon,
  Eye,
  EyeOff,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";

import { useStepAnimation } from "./useStepAnimation";

export function Step3OwnerInfo() {
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
}
