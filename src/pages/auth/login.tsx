"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AtSignIcon,
  LockIcon,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeftIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { OAuthButtons } from "@/components/shared/OAuthButtons";
import { usePageTransition } from "@/hooks/useGsapAnimation";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const formRef = usePageTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation is handled in login function
    } catch {
      // Error feedback is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div ref={formRef} className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="absolute -top-12 left-0 sm:-top-16 sm:-left-4 lg:hidden"
          asChild
        >
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground font-semibold font-body text-sm"
          >
            <ChevronLeftIcon className="size-4 me-2" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-base text-muted-foreground font-body">
            Sign in to your PharmaCare account
          </p>
        </div>

        {/* OAuth Section - Coming Soon */}
        <OAuthButtons mode="login" />

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-bold text-muted-foreground uppercase tracking-wider"
            >
              Email Address
            </Label>
            <div className="relative">
              <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-card border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-bold text-muted-foreground uppercase tracking-wider"
              >
                Password
              </Label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-card border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
