import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Settings,
  Pill,
  ShoppingCart,
  FileText,
  Activity,
  BarChart3,
  Clock,
  Percent,
  Bell,
  UserCog,
  Receipt,
  RotateCcw,
  TrendingUp,
  Package,
  ClipboardList,
  ChevronDown,
  UserPlus,
  Layers,
  History,
  ShieldCheck,
  Store,
  ShieldPlus,
} from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePharmacies } from '@/hooks/usePharmacies';

function DashboardContent() {
  const { userRole, user, logout: authLogout } = useAuth();
  const { pharmacies } = usePharmacies();
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpenMobile, state: sidebarState } = useSidebar();
  
  // Pending counts for Admin badge
  const [pendingCount, setPendingCount] = useState(0);

  // Get pharmacy name from pharmacies list
  const pharmacyName = pharmacies.find(b => b.pharmacy_name)?.pharmacy_name || 'PharmaCare';

  // Track which collapsible sub-menus are open
  const [openMenus, setOpenMenus] = useState({});

  const handleLogout = async () => {
    await authLogout();
    navigate('/auth/login');
  };

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Poll for pending approvals if admin
  const pendingManagers = useQuery(api.admin.queries.getPendingManagers) || [];
  const pendingBranches = useQuery(api.admin.queries.getPendingBranches) || [];

  const newPendingCount = (pendingManagers?.length || 0) + (pendingBranches?.length || 0);

  useEffect(() => {
    if (userRole !== 'admin') return;

    setPendingCount(newPendingCount);
  }, [userRole, newPendingCount]);

  // Auto-expand parent menu when a child route is active
  useEffect(() => {
    if (userRole === 'manager') {
      const staffPaths = ['/manager/staff', '/manager/pharmacies'];
      const inventoryPaths = ['/manager/inventory', '/manager/import'];

      if (staffPaths.some((p) => location.pathname.startsWith(p))) {
        setOpenMenus((prev) => ({ ...prev, staff: true }));
      }
      if (inventoryPaths.some((p) => location.pathname.startsWith(p))) {
        setOpenMenus((prev) => ({ ...prev, inventory: true }));
      }
    }
  }, [location.pathname, userRole]);

  // Define navigation items based on role
  // Items can be flat links OR collapsible groups with children
  const getNavItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin/overview', icon: LayoutDashboard },
          { 
            label: 'Approvals', 
            path: '/admin/approvals', 
            icon: ShieldCheck,
            badge: pendingCount > 0 ? pendingCount : null 
          },
          { label: 'Managers', path: '/admin/managers', icon: ShieldPlus },
          { label: 'Pharmacies', path: '/admin/pharmacies', icon: Building2 },
          { label: 'Branches', path: '/admin/branches', icon: Store },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
          { label: 'Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'manager':
        return [
          { label: 'Overview', path: '/manager/overview', icon: LayoutDashboard },
          {
            label: 'Staff',
            icon: Users,
            key: 'staff',
            children: [
              { label: 'All Staff', path: '/manager/staff', icon: UserPlus },
              { label: 'Pharmacies', path: '/manager/pharmacies', icon: Building2 },
            ],
          },
          {
            label: 'Inventory',
            icon: Pill,
            key: 'inventory',
            children: [
              { label: 'Medicines', path: '/manager/inventory', icon: Layers },
              { label: 'Import Data', path: '/manager/import', icon: History },
            ],
          },
          { label: 'POS Sales', path: '/manager/pos-sales', icon: ShoppingCart },
          { label: 'Audit Trail', path: '/manager/audit-trail', icon: ClipboardList },
          { label: 'Notifications', path: '/manager/notifications', icon: Bell },
          { label: 'Settings', path: '/manager/settings', icon: Settings },
        ];
      case 'pharmacist':
        return [
          { label: 'Dashboard', path: '/pharmacist/overview', icon: LayoutDashboard },
          { label: 'Inventory', path: '/pharmacist/inventory', icon: Pill },
          { label: 'Medicines', path: '/pharmacist/medicines', icon: Package },
          { label: 'Sale', path: '/pharmacist/sale', icon: ShoppingCart },
          { label: 'Stock Requests', path: '/pharmacist/stock-requests', icon: ClipboardList },
          { label: 'Expiry Alerts', path: '/pharmacist/expiry-alerts', icon: Bell },
          { label: 'Reports', path: '/pharmacist/medicines-reports', icon: BarChart3 },
          { label: 'Settings', path: '/pharmacist/settings', icon: Settings },
        ];
      case 'cashier':
        return [
          { label: 'Dashboard', path: '/cashier/overview', icon: LayoutDashboard },
          { label: 'POS', path: '/cashier/pos', icon: ShoppingCart },
          { label: 'Sessions', path: '/cashier/sessions', icon: Clock },
          { label: 'Pending Payments', path: '/cashier/payments/pending', icon: Receipt },
          { label: 'Shift Summary', path: '/cashier/shift-summary', icon: BarChart3 },
          { label: 'Receipts', path: '/cashier/receipts', icon: FileText },
          { label: 'Returns', path: '/cashier/returns', icon: RotateCcw },
          { label: 'Transactions', path: '/cashier/transactions', icon: Activity },
          { label: 'Sales', path: '/cashier/sales', icon: TrendingUp },
          { label: 'Settings', path: '/cashier/settings', icon: Settings },
        ];
      default:
        return [
          { label: 'Dashboard', path: '/admin/overview', icon: LayoutDashboard },
          { label: 'Approvals', path: '/admin/approvals', icon: ShieldCheck },
          { label: 'Managers', path: '/admin/managers', icon: ShieldPlus },
          { label: 'Pharmacies', path: '/admin/pharmacies', icon: Building2 },
          { label: 'Branches', path: '/admin/branches', icon: Store },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
          { label: 'Settings', path: '/admin/settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <div className='flex items-center gap-2'>
            <img src='/logo.png' alt='Logo' className='size-8' />
            <span className='text-xl font-bold text-foreground group-data-[collapsible=icon]:hidden'>
              {pharmacyName}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;

                  // Collapsible group with children
                  if (item.children) {
                    const isOpen = openMenus[item.key] ?? false;
                    const hasActiveChild = item.children.some(
                      (child) => location.pathname === child.path
                    );

                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          isActive={hasActiveChild}
                          tooltip={item.label}
                          onClick={() => toggleMenu(item.key)}
                          className="justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="size-4 shrink-0" />
                            <span>{item.label}</span>
                          </span>
                          <ChevronDown
                            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            } group-data-[collapsible=icon]:hidden`}
                          />
                        </SidebarMenuButton>

                        {isOpen && (
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = location.pathname === child.path;
                              return (
                                <SidebarMenuSubItem key={child.path}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isChildActive}
                                  >
                                    <Link to={child.path} onClick={handleNavClick}>
                                      <ChildIcon className="size-4 shrink-0" />
                                      <span>{child.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  // Flat link (no children)
                  const isActive = location.pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link to={item.path} onClick={handleNavClick}>
                          <Icon />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white group-data-[collapsible=icon]:hidden animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className='text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className='bg-background shadow-sm border-b border-border h-16 flex items-center px-4 md:px-6 justify-between sticky top-0 z-40'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger />
            <h1 className='text-lg font-semibold text-foreground md:hidden'>
              {pharmacyName}
            </h1>
          </div>
          <div className='flex items-center gap-4 ml-auto'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary font-bold capitalize'>
                {userRole?.charAt(0)}
              </div>
              <div className='hidden md:block'>
                <p className='text-sm font-medium text-foreground capitalize'>
                  {userRole}
                </p>
                <p className='text-xs text-muted-foreground'>{user?.email}</p>
              </div>
            </div>
          </div>
        </header>
        <main className='flex-1 overflow-auto p-6'>
          {/* Breadcrumbs */}
          {/* Dynamically generate breadcrumb paths based on location.pathname */}
          {(() => {
            const { pathname } = location;
            // Split path and build breadcrumb array
            const segments = pathname.split('/').filter(Boolean);
            const paths = segments.map((seg, idx) => {
              const href = '/' + segments.slice(0, idx + 1).join('/');
              // Capitalize segment for display
              const name = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              return { name, href };
            });
            // Add root dashboard if not present
            if (paths.length > 0 && paths[0].name.toLowerCase() !== 'dashboard') {
              const dashboardPath = userRole ? `/${userRole}/overview` : '/manager/overview';
              paths.unshift({ name: 'Dashboard', href: dashboardPath });
            }
            return <Breadcrumb paths={paths} />;
          })()}
          <Outlet />
        </main>
      </SidebarInset>
    </>
  );
}

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
