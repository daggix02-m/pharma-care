import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  badge?: number | null;
}

export const NavLink = React.memo(function NavLink({
  item,
  isActive,
  badge,
}: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        "relative px-3 py-2 text-[13px] font-medium transition-all duration-200",
        "flex items-center gap-2 group",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 transition-transform duration-200",
          isActive && "scale-110",
        )}
      />
      <span>{item.label}</span>
      {badge && badge > 0 && (
        <span className="flex h-4 min-w-[16px] px-1 items-center justify-center bg-foreground text-background text-[10px] font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
      )}
    </Link>
  );
});

export type { NavItem };
