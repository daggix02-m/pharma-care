import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignupStore } from "@/store/useSignupStore";
import { ChevronLeftIcon, Loader2Icon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { normalizeEmail } from "../types";
import { useStepAnimation } from "./useStepAnimation";

export function Step5Verification() {
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
}
