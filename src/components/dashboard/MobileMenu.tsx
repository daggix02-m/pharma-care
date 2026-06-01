import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import type { NavItem } from "./NavLink";

interface MobileMenuProps {
  navItems: NavItem[];
  isItemActive: (path: string) => boolean;
  onClose: () => void;
}

export const MobileMenu = React.memo(function MobileMenu({
  navItems,
  isItemActive,
  onClose,
}: MobileMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
      );
    }
  }, []);

  return (
    <div
      ref={menuRef}
      className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md"
    >
      <nav className="px-4 pt-2 pb-6 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] px-1.5 items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
});
