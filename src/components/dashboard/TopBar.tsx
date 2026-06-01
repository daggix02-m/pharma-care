import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePharmacies } from "@/hooks/usePharmacies";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import gsap from "gsap";
import { Menu, X } from "lucide-react";
import { DashboardLogo } from "./DashboardLogo";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { NAV_CONFIG } from "./TopBarNavConfig";

export const TopBar = React.memo(function TopBar({
  className,
}: {
  className?: string;
}) {
  const { userRole, user, logout: authLogout } = useAuth();
  const { pharmacies } = usePharmacies();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  const { sessionToken } = useAuth();
  const pendingApprovals = useQuery(
    api.admin.queries.getPendingApprovalsCount,
    userRole === "admin" && sessionToken ? { sessionToken } : "skip",
  );

  const pendingCount = React.useMemo(() => {
    if (userRole !== "admin") return 0;
    return pendingApprovals?.pendingApprovals || 0;
  }, [userRole, pendingApprovals]);

  const pharmacyName = React.useMemo(() => {
    return (
      pharmacies.find((b) => b.pharmacy_name)?.pharmacy_name || "PharmaCare"
    );
  }, [pharmacies]);

  const navItems = React.useMemo(() => {
    const items = NAV_CONFIG[userRole || ""] || [];
    if (userRole === "admin" && pendingCount > 0) {
      return items.map((item) =>
        item.label === "Approvals" ? { ...item, badge: pendingCount } : item,
      );
    }
    return items;
  }, [userRole, pendingCount]);

  const isItemActive = React.useCallback(
    (path: string) => {
      if (path.includes("?")) {
        const [baseUrl, query] = path.split("?");
        return location.pathname === baseUrl && location.search.includes(query);
      }
      return location.pathname === path;
    },
    [location.pathname, location.search],
  );

  const handleLogout = React.useCallback(async () => {
    await authLogout();
    navigate("/auth/login");
  }, [authLogout, navigate]);

  React.useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          immediateRender: true,
        },
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <DashboardLogo pharmacyName={pharmacyName} userRole={userRole} />

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  isActive={isItemActive(item.path)}
                  badge={item.badge}
                />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <ThemeToggle />

            <UserMenu
              userRole={userRole || null}
              userEmail={user?.email || null}
              onLogout={handleLogout}
            />

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenu
          navItems={navItems}
          isItemActive={isItemActive}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
});

export default TopBar;
