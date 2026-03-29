"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeftIcon,
  AtSignIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(
        "If an account exists for this email, a reset link has been sent.",
      );
      setEmail("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
            Reset Password
          </h1>
          <p className="text-muted-foreground font-body text-sm font-medium">
            Enter your email address and we&apos;ll send you instructions to
            reset your password.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-accent-foreground">
                Success
              </p>
              <p className="text-sm text-accent-foreground/80 mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest">
              Email Address
            </Label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={cn(
                  "h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm",
                  error ? "border-destructive" : "",
                )}
                disabled={isLoading}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
                <AtSignIcon className="size-4" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <div className="p-4 bg-muted rounded-2xl border border-input">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            <strong>Having trouble?</strong> If you don&apos;t receive the email
            within a few minutes, please check your spam folder or contact your
            administrator.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground font-body">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="font-bold text-foreground hover:underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
