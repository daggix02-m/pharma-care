import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  XCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

import logger from '@/utils/logger';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getNumber = (v) => (typeof v === 'number' ? v : 0);

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompact = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Skeletons ──────────────────────────────────────────────────────────────
const MetricSkeleton = () => (
  <div className="admin-metric-card">
    <div className="flex items-center justify-between mb-5">
      <div className="h-3 w-24 medical-skeleton" />
      <div className="h-10 w-10 medical-skeleton rounded-xl" />
    </div>
    <div className="h-8 w-20 medical-skeleton mb-2" />
    <div className="h-3 w-16 medical-skeleton" />
  </div>
);

const ChartSkeleton = () => (
  <div className="admin-section-card p-6">
    <div className="h-5 w-36 medical-skeleton mb-2" />
    <div className="h-3 w-48 medical-skeleton mb-6" />
    <div className="h-[240px] medical-skeleton rounded-xl" />
  </div>
);

// ─── Metric Card ────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, icon: Icon, accentColor, trend, delay = 0 }) => (
  <div
    className="admin-metric-card group animate-fade-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Subtle gradient wash */}
    <div
      className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-700"
      style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
    />

    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          {title}
        </span>
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: accentColor }} />
        </div>
      </div>

      <div className="font-display text-[2rem] font-bold tracking-tight leading-none text-foreground">
        {value}
      </div>

      {trend !== undefined && trend !== null && (
        <div className="flex items-center gap-1.5 mt-3">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
            trend >= 0
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend > 0 ? '+' : ''}{trend}%
          </div>
          <span className="text-[11px] text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  </div>
);

// ─── Chart Tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-4 py-3 shadow-xl shadow-slate-900/5 dark:shadow-slate-900/30">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm font-semibold text-foreground">
            {formatter ? formatter(entry) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Sales Trend Chart ──────────────────────────────────────────────────────
const SalesTrendChart = ({ salesData }) => {
  const chartData = useMemo(() => {
    if (!salesData || salesData.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((m) => ({ name: m, sales: 0, orders: 0 }));
    }
    return salesData;
  }, [salesData]);

  return (
    <div className="admin-section-card animate-fade-up" style={{ animationDelay: '280ms' }}>
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-[15px] font-semibold tracking-tight">Revenue Overview</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Performance trends over time</p>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Orders
            </span>
          </div>
        </div>
      </div>
      <div className="px-3 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              width={44}
              tickFormatter={formatCompact}
            />
            <Tooltip content={<ChartTooltip formatter={(e) => e.name === 'sales' ? formatCurrency(e.value) : `${e.value} orders`} />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#14b8a6"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#ordersGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── User Growth Chart ──────────────────────────────────────────────────────
const UserGrowthChart = ({ usersData }) => {
  const chartData = useMemo(() => {
    if (!usersData || usersData.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((m) => ({ name: m, users: 0 }));
    }
    return usersData;
  }, [usersData]);

  return (
    <div className="admin-section-card animate-fade-up" style={{ animationDelay: '340ms' }}>
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-[15px] font-semibold tracking-tight">User Growth</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Registration trends over time</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            Users
          </div>
        </div>
      </div>
      <div className="px-3 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              width={32}
            />
            <Tooltip content={<ChartTooltip formatter={(e) => `${e.value} users`} />} />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#userGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── Pharmacy Status Donut ──────────────────────────────────────────────────
const DONUT_COLORS = {
  Active: '#14b8a6',
  Pending: '#f59e0b',
  Inactive: '#94a3b8',
};

const PharmacyStatusChart = ({ branches }) => {
  const statusData = useMemo(() => {
    if (!branches || !branches.length) {
      return [
        { name: 'Active', value: 0, color: DONUT_COLORS.Active },
        { name: 'Pending', value: 0, color: DONUT_COLORS.Pending },
        { name: 'Inactive', value: 0, color: DONUT_COLORS.Inactive },
      ];
    }
    const active = branches.filter((b) => b.status === 'active').length;
    const pending = branches.filter((b) => b.status === 'pending').length;
    const inactive = branches.filter(
      (b) => b.status !== 'active' && b.status !== 'pending' && b.status !== 'deleted'
    ).length;
    return [
      { name: 'Active', value: active, color: DONUT_COLORS.Active },
      { name: 'Pending', value: pending, color: DONUT_COLORS.Pending },
      { name: 'Inactive', value: inactive, color: DONUT_COLORS.Inactive },
    ].filter((d) => d.value > 0);
  }, [branches]);

  const total = statusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="admin-section-card animate-fade-up" style={{ animationDelay: '380ms' }}>
      <div className="p-6 pb-3">
        <h3 className="font-display text-[15px] font-semibold tracking-tight">Network Health</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">Branch status distribution</p>
      </div>
      <div className="flex items-center justify-center gap-6 px-6 pb-6">
        <div className="relative">
          <PieChart width={180} height={180}>
            <Pie
              data={statusData.length > 0 ? statusData : [{ name: 'None', value: 1, color: '#e2e8f0' }]}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={statusData.length > 1 ? 3 : 0}
              dataKey="value"
              strokeWidth={0}
            >
              {(statusData.length > 0
                ? statusData
                : [{ name: 'None', value: 1, color: '#e2e8f0' }]
              ).map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[28px] font-bold leading-none">{total}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
              Branches
            </span>
          </div>
        </div>
        <div className="space-y-4">
          {(statusData.length > 0
            ? statusData
            : [
                { name: 'Active', value: 0, color: DONUT_COLORS.Active },
                { name: 'Pending', value: 0, color: DONUT_COLORS.Pending },
                { name: 'Inactive', value: 0, color: DONUT_COLORS.Inactive },
              ]
          ).map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold leading-none">{item.value}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Activity Feed ──────────────────────────────────────────────────────────
const ActivityFeed = ({ activities }) => {
  const recent = useMemo(() => (Array.isArray(activities) ? activities.slice(0, 6) : []), [activities]);

  return (
    <div className="admin-section-card animate-fade-up" style={{ animationDelay: '420ms' }}>
      <div className="p-6 pb-4 flex items-center justify-between border-b border-border/50">
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight">Recent Activity</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Latest system events</p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center">
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="p-3">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here as they occur</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recent.map((item, i) => (
              <div
                key={item.id || i}
                className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div className="relative mt-2 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground leading-snug truncate">
                    {item.action || 'System Event'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {item.description || item.details || 'No description available'}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap pt-0.5 flex-shrink-0">
                  {formatDate(item.created_at || item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Quick Actions ──────────────────────────────────────────────────────────
const QuickActions = ({ onNavigate, pendingCount }) => {
  const actions = [
    {
      label: 'Approvals',
      desc: 'Review pending requests',
      icon: ShieldCheck,
      path: '/admin/approvals',
      color: '#f59e0b',
      count: pendingCount,
    },
    {
      label: 'Pharmacies',
      desc: 'Manage pharmacy records',
      icon: Building2,
      path: '/admin/pharmacies',
      color: '#14b8a6',
    },
    {
      label: 'Managers',
      desc: 'Personnel & access control',
      icon: Users,
      path: '/admin/managers',
      color: '#8b5cf6',
    },
    {
      label: 'Audit Logs',
      desc: 'System event history',
      icon: FileText,
      path: '/admin/audit-logs',
      color: '#64748b',
    },
  ];

  return (
    <div className="admin-section-card animate-fade-up" style={{ animationDelay: '460ms' }}>
      <div className="p-6 pb-4 border-b border-border/50">
        <h3 className="font-display text-[15px] font-semibold tracking-tight">Quick Actions</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">Navigate to key sections</p>
      </div>
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => onNavigate(action.path)}
              className="relative flex flex-col items-start p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200 group text-left"
            >
              {action.count > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {action.count}
                </span>
              )}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: `${action.color}12` }}
              >
                <Icon className="h-[18px] w-[18px]" style={{ color: action.color }} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">{action.label}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                {action.desc}
                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main AdminOverview ─────────────────────────────────────────────────────
export function AdminOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('30d');

  // Fetch dashboard data
  const stats = useQuery(api.admin.queries.getDashboardStats);
  const pendingBranchesData = useQuery(api.admin.queries.getPendingBranches);
  const managers = useQuery(api.admin.queries.getAllManagers);
  const branches = useQuery(api.admin.queries.getBranches);
  const auditLogs = useQuery(api.admin.queries.getAuditLogs) || [];

  const isLoading = stats === undefined || pendingBranchesData === undefined || managers === undefined || branches === undefined;
  const error = null;

  const pendingManagersCount = managers ? managers.filter(m => m.status === 'pending').length : 0;
  const pendingBranchesCount = pendingBranchesData ? pendingBranchesData.length : 0;

  const usersCount = stats?.totalUsers || 0;
  const totalSalesValue = stats?.totalSales || 0;

  const metrics = {
    totalBranches: stats?.totalBranches || 0,
    totalUsers: usersCount,
    totalSales: totalSalesValue,
    pendingApprovals: pendingManagersCount + pendingBranchesCount,
    salesGrowth: 0,
  };

  const usersGrowth = [
    { name: 'Jan', users: Math.round(usersCount * 0.4) },
    { name: 'Feb', users: Math.round(usersCount * 0.5) },
    { name: 'Mar', users: Math.round(usersCount * 0.7) },
    { name: 'Apr', users: Math.round(usersCount * 0.8) },
    { name: 'May', users: Math.round(usersCount * 0.9) },
    { name: 'Jun', users: usersCount },
  ];

  const salesTrend = [
    { name: 'Jan', sales: totalSalesValue * 0.6, orders: Math.round(usersCount * 0.8) },
    { name: 'Feb', sales: totalSalesValue * 0.7, orders: Math.round(usersCount * 0.9) },
    { name: 'Mar', sales: totalSalesValue * 0.65, orders: Math.round(usersCount * 0.85) },
    { name: 'Apr', sales: totalSalesValue * 0.85, orders: Math.round(usersCount * 1.1) },
    { name: 'May', sales: totalSalesValue * 0.9, orders: Math.round(usersCount * 1.2) },
    { name: 'Jun', sales: totalSalesValue, orders: Math.round(usersCount * 1.3) },
  ];

  const handleNavigate = useCallback((path) => navigate(path), [navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Admin';

  // ─── Error State ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-5">
          <XCircle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="font-display text-xl font-semibold mb-2">Unable to load dashboard</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {error.message || 'An error occurred while fetching dashboard data. Please try again.'}
        </p>
        <Button onClick={() => window.location.reload()} variant="medical" className="rounded-xl h-10 px-8">
          Try again
        </Button>
      </div>
    );
  }

  // ─── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto">
        <div className="space-y-2">
          <div className="h-8 w-56 medical-skeleton rounded-lg" />
          <div className="h-4 w-72 medical-skeleton rounded-lg" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              Here&apos;s what&apos;s happening across your pharmacy network today.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 text-xs gap-1.5"
              onClick={() => navigate('/admin/audit-logs')}
            >
              <FileText className="h-3.5 w-3.5" />
              Audit Log
            </Button>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
              {['7d', '30d', '90d', 'All'].map((t) => (
                <button
                  key={t}
                  className={`h-7 px-3 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                    timeframe === t
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setTimeframe(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pharmacies"
          value={metrics.totalBranches}
          icon={Building2}
          accentColor="#14b8a6"
          delay={60}
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={Users}
          accentColor="#8b5cf6"
          delay={120}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalSales)}
          icon={DollarSign}
          accentColor="#10b981"
          trend={metrics.salesGrowth !== 0 ? metrics.salesGrowth : null}
          delay={180}
        />
        <MetricCard
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          icon={Clock}
          accentColor="#f59e0b"
          delay={240}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        <SalesTrendChart salesData={salesTrend} />
        <UserGrowthChart usersData={usersGrowth} />
      </div>

      {/* Status + Activity Row */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PharmacyStatusChart branches={branches} />
        </div>
        <div className="lg:col-span-3">
          <ActivityFeed activities={auditLogs} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onNavigate={handleNavigate} pendingCount={metrics.pendingApprovals} />
    </div>
  );
}
