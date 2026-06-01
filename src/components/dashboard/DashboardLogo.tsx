import * as React from "react";
import { Link } from "react-router-dom";
import { getHomePath } from "./TopBarNavConfig";

interface DashboardLogoProps {
  pharmacyName: string;
  userRole: string | null | undefined;
}

export const DashboardLogo = React.memo(function DashboardLogo({
  pharmacyName,
  userRole,
}: DashboardLogoProps) {
  const homePath = getHomePath(userRole);

  return (
    <Link
      to={homePath}
      className="flex items-center gap-2 sm:gap-3 group min-w-0"
    >
      <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden">
        <img
          src="/favicon.png"
          alt="PharmaCare"
          className="h-10 w-10 object-contain"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[14px] sm:text-[15px] font-display font-bold tracking-tight text-foreground leading-none truncate max-w-[130px] sm:max-w-[220px]">
          {pharmacyName}
        </span>
        <span className="hidden sm:block text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5">
          Management System
        </span>
      </div>
    </Link>
  );
});
