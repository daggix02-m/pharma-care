"use client";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Mail, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/shared/AuthLayout";

export const PharmacySuspendedPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="relative p-6 bg-destructive/10 rounded-full border border-destructive/20">
            <ShieldAlert className="size-16 text-destructive" />
            <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-2 shadow-sm border border-input animate-pulse">
              <div className="size-3 rounded-full bg-destructive" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Access Suspended
          </h1>
          <p className="text-muted-foreground font-medium">
            Your pharmacy has been{" "}
            <span className="text-destructive font-semibold">
              {user?.pharmacy_status === "deleted" ? "removed" : "deactivated"}
            </span>{" "}
            by the administrator.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-left">
          <div className="p-4 bg-destructive/5 rounded-2xl border border-destructive/10 space-y-2">
            <h3 className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              Impact
            </h3>
            <ul className="text-xs text-destructive/80 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <div className="size-1 rounded-full bg-destructive/60" />
                Account access revoked
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1 rounded-full bg-destructive/60" />
                All staff members affected
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1 rounded-full bg-destructive/60" />
                Data preserved but inaccessible
              </li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-2xl border border-input space-y-3">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <Mail className="size-3" />
              Resolution
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To reactivate your pharmacy, please contact our support team.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                <Mail className="size-3" />
                support@pharmacare.com
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                <Phone className="size-3" />
                +251-XXX-XXXX
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 border-input text-foreground hover:bg-muted rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Return to Login
        </Button>

        <p className="text-[11px] text-muted-foreground">
          PharmaCare Management System • Access Log:{" "}
          {new Date().toLocaleDateString()}
        </p>
      </div>
    </AuthLayout>
  );
};
