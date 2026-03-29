import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePharmacies } from "@/hooks/usePharmacies";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import gsap from "gsap";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Settings,
  ShoppingCart,
  FileText,
  Activity,
  BarChart3,
  Clock,
  Bell,
  Receipt,
  RotateCcw,
  TrendingUp,
  Package,
  ClipboardList,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Layout,
} from "lucide-react";

// Types
interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

interface TopBarProps {
  className?: string;
}

// Nav item configuration by role - extracted for maintainability
const NAV_CONFIG: Record<string, NavItem[]> = {
  admin: [
    { label: "Overview", path: "/admin?tab=overview", icon: LayoutDashboard },
    { label: "Approvals", path: "/admin?tab=approvals", icon: ShieldCheck },
    { label: "Pharmacies", path: "/admin?tab=pharmacies", icon: Building2 },
    { label: "Feedbacks", path: "/admin?tab=feedbacks", icon: MessageSquare },
    { label: "Audit Logs", path: "/admin?tab=audit-logs", icon: ClipboardList },
    { label: "Settings", path: "/admin?tab=settings", icon: Settings },
    { label: "Landing Page", path: "/admin?tab=landing-page", icon: Layout },
  ],
  manager: [
    { label: "Overview", path: "/manager?tab=overview", icon: LayoutDashboard },
    { label: "Branches", path: "/manager?tab=branches", icon: Building2 },
    { label: "Staff", path: "/manager?tab=staff", icon: Users },
    { label: "Audit Trail", path: "/manager?tab=audit", icon: ClipboardList },
    { label: "Settings", path: "/manager?tab=settings", icon: Settings },
  ],
  pharmacist: [
    {
      label: "Overview",
      path: "/pharmacist?tab=overview",
      icon: LayoutDashboard,
    },
    { label: "Medicines", path: "/pharmacist?tab=medicines", icon: Package },
    { label: "Expiry Alerts", path: "/pharmacist?tab=expiry", icon: Bell },
    {
      label: "Stock Requests",
      path: "/pharmacist?tab=stock",
      icon: ClipboardList,
    },
    { label: "Reports", path: "/pharmacist?tab=reports", icon: BarChart3 },
  ],
  cashier: [
    { label: "Overview", path: "/cashier/overview", icon: LayoutDashboard },
    { label: "POS", path: "/cashier/pos", icon: ShoppingCart },
    { label: "Sessions", path: "/cashier/sessions", icon: Clock },
    { label: "Pending", path: "/cashier/payments/pending", icon: Receipt },
    { label: "Summary", path: "/cashier/shift-summary", icon: BarChart3 },
    { label: "Receipts", path: "/cashier/receipts", icon: FileText },
    { label: "Returns", path: "/cashier/returns", icon: RotateCcw },
    { label: "Transactions", path: "/cashier/transactions", icon: Activity },
    { label: "Sales", path: "/cashier/sales", icon: TrendingUp },
    { label: "Settings", path: "/cashier/settings", icon: Settings },
  ],
};

// Get home path based on user role
const getHomePath = (userRole: string | null | undefined): string => {
  switch (userRole) {
    case "admin":
      return "/admin";
    case "owner":
      return "/owner";
    case "manager":
      return "/manager";
    case "pharmacist":
      return "/pharmacist";
    case "cashier":
      return "/cashier/overview";
    default:
      return "/";
  }
};

// Memoized DashboardLogo component for performance
const DashboardLogo = React.memo(function DashboardLogo({
  pharmacyName,
  userRole,
}: {
  pharmacyName: string;
  userRole: string | null | undefined;
}) {
  const homePath = getHomePath(userRole);

  return (
    <Link to={homePath} className="flex items-center gap-3 group">
      <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden">
        <img
          src="/favicon.png"
          alt="PharmaCare"
          className="h-10 w-10 object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-display font-bold tracking-tight text-foreground leading-none">
          {pharmacyName}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5">
          Management System
        </span>
      </div>
    </Link>
  );
});

// Memoized NavLink component
const NavLink = React.memo(function NavLink({
  item,
  isActive,
  badge,
}: {
  item: NavItem;
  isActive: boolean;
  badge?: number | null;
}) {
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

// User menu dropdown - memoized
const UserMenu = React.memo(function UserMenu({
  userRole,
  userEmail,
  onLogout,
}: {
  userRole: string | null;
  userEmail?: string | null;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 px-3 flex items-center gap-2 border border-border hover:bg-muted/50 transition-colors"
        >
          <div className="w-7 h-7 bg-foreground flex items-center justify-center text-background font-bold text-xs uppercase">
            {userRole?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-[11px] font-semibold leading-none uppercase tracking-wide">
              {userRole}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2 border-border">
        <DropdownMenuLabel className="font-normal py-3">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-semibold leading-none uppercase tracking-wide text-foreground">
              {userRole}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate(`/${userRole}?tab=settings`)}
          className="cursor-pointer py-2.5"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive cursor-pointer py-2.5"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// Mobile menu sheet
const MobileMenu = React.memo(function MobileMenu({
  navItems,
  isItemActive,
  onClose,
}: {
  navItems: NavItem[];
  isItemActive: (path: string) => boolean;
  onClose: () => void;
}) {
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

// Main TopBar component
export const TopBar = React.memo(function TopBar({ className }: TopBarProps) {
  const { userRole, user, logout: authLogout } = useAuth();
  const { pharmacies } = usePharmacies();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  // OPTIMIZATION: Combined pending counts query
  // Reduces queries from 2 to 1, eliminates N+1 pattern
  const { sessionToken } = useAuth();
  const pendingCounts = useQuery(
    api.admin.queries.getPendingCounts,
    userRole === "admin" && sessionToken ? { sessionToken } : "skip",
  );

  // Memoized computations
  const pendingCount = React.useMemo(() => {
    if (userRole !== "admin") return 0;
    return (pendingCounts?.managers || 0) + (pendingCounts?.branches || 0);
  }, [userRole, pendingCounts]);

  const pharmacyName = React.useMemo(() => {
    return (
      pharmacies.find((b) => b.pharmacy_name)?.pharmacy_name || "PharmaCare"
    );
  }, [pharmacies]);

  const navItems = React.useMemo(() => {
    const items = NAV_CONFIG[userRole || ""] || [];
    // Add badge to Approvals for admin
    if (userRole === "admin" && pendingCount > 0) {
      return items.map((item) =>
        item.label === "Approvals" ? { ...item, badge: pendingCount } : item,
      );
    }
    return items;
  }, [userRole, pendingCount]);

  // Check if nav item is active
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

  // Logout handler
  const handleLogout = React.useCallback(async () => {
    await authLogout();
    navigate("/auth/login");
  }, [authLogout, navigate]);

  // GSAP entrance animation
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

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-8">
            <DashboardLogo pharmacyName={pharmacyName} userRole={userRole} />

            {/* Desktop Nav Links - Brutalist minimalist style */}
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

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <ThemeToggle />

            <UserMenu
              userRole={userRole || null}
              userEmail={user?.email || null}
              onLogout={handleLogout}
            />

            {/* Mobile Menu Toggle */}
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

      {/* Mobile Nav */}
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
