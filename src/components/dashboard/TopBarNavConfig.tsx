import {
  LayoutDashboard,
  Building2,
  Users,
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
  MessageSquare,
  BadgeDollarSign,
  Layout,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

const NAV_CONFIG: Record<string, NavItem[]> = {
  admin: [
    { label: "Overview", path: "/admin?tab=overview", icon: LayoutDashboard },
    { label: "Approvals", path: "/admin?tab=approvals", icon: ShieldCheck },
    { label: "Pharmacies", path: "/admin?tab=pharmacies", icon: Building2 },
    {
      label: "Subscriptions",
      path: "/admin?tab=subscriptions",
      icon: BadgeDollarSign,
    },
    { label: "Feedbacks", path: "/admin?tab=feedbacks", icon: MessageSquare },
    { label: "Audit Logs", path: "/admin?tab=audit-logs", icon: ClipboardList },
    { label: "Settings", path: "/admin?tab=settings", icon: Settings },
    { label: "Landing Page", path: "/admin?tab=landing-page", icon: Layout },
  ],
  manager: [
    { label: "Overview", path: "/manager?tab=overview", icon: LayoutDashboard },
    { label: "Branches", path: "/manager?tab=branches", icon: Building2 },
    { label: "Staff", path: "/manager?tab=staff", icon: Users },
    { label: "Transfers", path: "/manager?tab=transfers", icon: Package },
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

function getHomePath(userRole: string | null | undefined): string {
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
}

export { NAV_CONFIG, getHomePath };
export type { NavItem };
