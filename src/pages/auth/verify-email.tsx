"use client";

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailIcon, AtSignIcon, ChevronLeftIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [verificationCode, setVerificationCode] = useState(
    searchParams.get("token") || "",
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const verifyMutation = useMutation(api.auth.mutations.verifyEmail);
  const resendMutation = useMutation(api.auth.mutations.sendVerificationEmail);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      await verifyMutation({ email, token: verificationCode });
      toast.success("Email verified successfully. Please sign in.");
      window.location.href = "/auth/login";
    } catch (err: any) {
      setError(
        err?.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address to resend verification.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const resendResult = await resendMutation({ email });
      if (!resendResult?.success || !resendResult?.emailSent) {
        throw new Error(
          resendResult?.message || "Verification code could not be sent.",
        );
      }
      toast.success("Verification code sent. Please check your email.");
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="absolute -top-12 left-0 sm:-top-16 sm:-left-4 lg:hidden"
          asChild
        >
          <Link
            to="/auth/login"
            className="text-muted-foreground hover:text-foreground font-semibold font-body text-sm"
          >
            <ChevronLeftIcon className="size-4 me-2" />
            Back to Login
          </Link>
        </Button>

        <div className="flex flex-col space-y-2 text-left mt-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground font-body text-sm font-medium">
            Enter the code sent to your email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest">
              Email Address
            </Label>
            <div className="relative">
              <Input
                placeholder="Enter your email"
                className={cn(
                  "h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm",
                  error && (error.includes("Email") || error.includes("email"))
                    ? "border-destructive"
                    : "",
                )}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
                <AtSignIcon className="size-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest">
              Verification Code
            </Label>
            <div className="relative">
              <Input
                placeholder="Enter 6-digit code"
                className={cn(
                  "h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-lg font-mono tracking-[0.3em] text-center",
                  error && error.includes("code") ? "border-destructive" : "",
                )}
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                maxLength={6}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
                <MailIcon className="size-4" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-destructive" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        <div className="text-center space-y-4 pt-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
          >
            {isResending ? "Sending..." : "Didn't receive a code? Resend"}
          </button>

          <div className="pt-4 border-t border-input">
            <Link
              to="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors inline-flex items-center gap-2"
            >
              <ChevronLeftIcon className="size-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
