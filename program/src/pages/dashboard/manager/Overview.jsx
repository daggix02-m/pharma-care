import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/ui';
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MapPin,
  BellRing,
  RefreshCw,
  Plus,
  FileText,
  RotateCcw,
  FileSpreadsheet,
  Upload,
  Loader2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

// --- Sub-components ---

const KPICard = ({ title, value, change, icon, trend, onClick, loading, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/10 border-blue-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/10 border-emerald-500/20',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/10 border-amber-500/20',
    violet: 'from-violet-500 to-purple-600 shadow-violet-500/10 border-violet-500/20',
  };

  return (
    <Card
      className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors[color]}`} />
      
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors'>
          {title}
        </CardTitle>
        <div className={`h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-gradient-to-br group-hover:text-white transition-all duration-300 ${colors[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='h-10 w-24 bg-muted animate-pulse rounded-xl' />
        ) : (
          <div className="space-y-2">
            <div className='text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-50'>{value}</div>
            {change !== undefined && (
              <div className='flex items-center gap-1.5'>
                <div className={`flex items-center justify-center h-5 px-1.5 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {change > 0 ? '+' : ''}{change}%
                </div>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>vs last period</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Decorative inner glow */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-br ${colors[color]}`} />
    </Card>
  );
};

const BulkImportModal = ({ open, onOpenChange, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setImporting(true);
      // For now, note that Convex handles file uploads differently (Action + Upload URL)
      // Since migrate to Convex, we'll need to implement an Action for this.
      // Placeholder until Action is implemented.
      toast.info('EXCEL Import will be integrated with Convex Actions in the next step.');
      onOpenChange(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import medicines');
    } finally {
      setImporting(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Bulk Import Medicines</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx) containing medicine details to update your stock.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
          >
            <input
              type='file'
              id='file-upload'
              className='hidden'
              accept='.xlsx, .xls'
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor='file-upload' className='cursor-pointer flex flex-col items-center gap-2'>
              <Upload className={`h-8 w-8 ${file ? 'text-primary' : 'text-muted-foreground'}`} />
              {file ? (
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{file.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className='text-sm font-medium'>Click or drag to upload</p>
                  <p className='text-xs text-muted-foreground'>Excel files only (.xlsx, .xls)</p>
                </>
              )}
            </label>
          </div>
          <div className='text-xs text-muted-foreground bg-muted p-3 rounded-md'>
            <p className='font-semibold mb-1'>Format requirements:</p>
            <ul className='list-disc list-inside space-y-0.5'>
              <li>Columns: Name, Generic Name, Category, Price, Stock</li>
              <li>Expiry date format: YYYY-MM-DD</li>
              <li>Maximum file size: 5MB</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={importing || !file}>
            {importing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Importing...
              </>
            ) : (
              'Start Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Fallback Data Constants ---

const FALLBACK_SALES_DATA = [
  { date: '2025-02-22', revenue: 0, orders: 0 },
  { date: '2025-02-23', revenue: 0, orders: 0 },
  { date: '2025-02-24', revenue: 0, orders: 0 },
  { date: '2025-02-25', revenue: 0, orders: 0 },
  { date: '2025-02-26', revenue: 0, orders: 0 },
  { date: '2025-02-27', revenue: 0, orders: 0 },
  { date: '2025-02-28', revenue: 0, orders: 0 },
];

const FALLBACK_INVENTORY_DATA = [
  { name: 'In Stock', value: 0, color: '#10b981' },
  { name: 'Low Stock', value: 0, color: '#f59e0b' },
  { name: 'Expired', value: 0, color: '#ef4444' },
  { name: 'Out of Stock', value: 0, color: '#6b7280' }
];

// --- Error State Component ---

const ErrorState = ({ message, onRetry }) => (
  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
    <AlertCircle className="h-8 w-8 mb-2 text-rose-500" />
    <p className="text-sm mb-2">{message}</p>
    {onRetry && (
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-3 w-3 mr-2" />
        Retry
      </Button>
    )}
  </div>
);

// --- Main Dashboard Component ---

export function Overview() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7days');
  const [showImportModal, setShowImportModal] = useState(false);

  // Convex Queries
  const dashboardStats = useQuery(api.manager.queries.getDashboardStats);
  const salesSummary = useQuery(api.manager.queries.getSalesSummary);
  const inventorySummary = useQuery(api.manager.queries.getInventorySummary);
  const topSelling = useQuery(api.manager.queries.getTopSelling);
  const notifications = useQuery(api.manager.queries.getNotifications) || [];
  const branchOverview = useQuery(api.manager.queries.getBranchOverview);

  const loading = !dashboardStats || !salesSummary || !inventorySummary || !topSelling || !branchOverview;

  const kpiData = {
    revenue: { 
      value: `${(dashboardStats?.todayRevenue || 0).toLocaleString()} ETB`, 
      change: dashboardStats?.revenueChange || 0, 
      trend: (dashboardStats?.revenueChange || 0) >= 0 ? 'up' : 'down' 
    },
    lowStock: { 
      value: dashboardStats?.lowStockCount || 0, 
      change: dashboardStats?.stockChange || 0, 
      trend: (dashboardStats?.stockChange || 0) <= 0 ? 'down' : 'up' 
    },
    staffActive: { 
      value: `${dashboardStats?.activeStaff || 0} / ${dashboardStats?.totalStaff || 0}`, 
      active: dashboardStats?.activeStaff || 0, 
      total: dashboardStats?.totalStaff || 0 
    },
    salesVolume: { 
      value: dashboardStats?.todayOrders || 0, 
      change: dashboardStats?.ordersChange || 0, 
      trend: (dashboardStats?.ordersChange || 0) >= 0 ? 'up' : 'down' 
    },
  };

  const inventoryData = inventorySummary ? Object.entries(inventorySummary).map(([name, value]) => ({
    name,
    value,
    color: name === 'In Stock' ? '#10b981' : name === 'Low Stock' ? '#f59e0b' : name === 'Expired' ? '#ef4444' : '#6b7280'
  })) : FALLBACK_INVENTORY_DATA;

  const pharmacyData = {
    name: branchOverview?.name || 'Pharmacy',
    location: branchOverview?.address || 'Location Not Set',
    status: branchOverview?.status === 'active' ? 'Active' : 'Inactive',
  };

  const salesData = salesSummary || FALLBACK_SALES_DATA;
  const topProducts = topSelling || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background border border-border rounded-lg shadow-lg p-3'>
          <p className='text-sm font-medium'>{payload[0].payload.date}</p>
          <p className='text-sm text-emerald-500'>Revenue: {payload[0].value.toLocaleString()} ETB</p>
          <p className='text-sm text-blue-500'>Orders: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='min-h-screen bg-background p-6 space-y-6'>
      {/* Header Section */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm text-muted-foreground mb-1'>
              Dashboard &gt; Manager &gt; Overview
            </div>
            <h1 className='text-3xl font-bold'>Welcome back, Manager!</h1>
            <p className='text-muted-foreground mt-1'>
              Here&apos;s what&apos;s happening at {pharmacyData.name} today.
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select range' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='today'>Today</SelectItem>
                <SelectItem value='7days'>Last 7 Days</SelectItem>
                <SelectItem value='30days'>Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              size='icon'
              onClick={() => {}}
              className={loading ? 'animate-spin' : ''}
              disabled={loading}
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='icon' onClick={() => navigate('/manager/notifications')}>
              <BellRing className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Scorecard Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up'>
        <KPICard
          title="Daily Revenue"
          value={kpiData.revenue.value}
          change={kpiData.revenue.change}
          trend={kpiData.revenue.trend}
          icon={<DollarSign className='h-5 w-5' />}
          loading={loading}
          color="emerald"
        />
        <KPICard
          title='Critical Inventory'
          value={kpiData.lowStock.value}
          change={kpiData.lowStock.change}
          trend={kpiData.lowStock.trend}
          icon={<Package className='h-5 w-5' />}
          onClick={() => navigate('/manager/inventory')}
          loading={loading}
          color="amber"
        />
        <KPICard
          title='Staff Coverage'
          value={kpiData.staffActive.value}
          icon={<Users className='h-5 w-5' />}
          onClick={() => navigate('/manager/staff')}
          loading={loading}
          color="violet"
        />
        <KPICard
          title='Transaction Volume'
          value={kpiData.salesVolume.value}
          change={kpiData.salesVolume.change}
          trend={kpiData.salesVolume.trend}
          icon={<ShoppingCart className='h-5 w-5' />}
          loading={loading}
          color="blue"
        />
      </div>

      {/* Main Control Center Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left Column: Trend Analysis & Products */}
        <div className="lg:col-span-8 space-y-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {/* Sales Chart */}
            <Card className='rounded-[2.5rem] border-slate-200 overflow-hidden shadow-sm'>
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                    <CardTitle className="text-xl font-bold font-display">Performance Metrics</CardTitle>
                    <CardDescription>Visualizing revenue and traffic flows</CardDescription>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Orders</span>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="px-1">
                {loading ? (
                  <div className='h-[300px] w-full bg-muted animate-pulse rounded-3xl' />
                ) : salesData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={320}>
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#10b981' stopOpacity={0.15} />
                          <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id='colorOrders' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.15} />
                          <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' vertical={false} className='stroke-slate-100 dark:stroke-slate-800' />
                      <XAxis dataKey='date' axisLine={false} tickLine={false} className='text-[10px] font-bold text-slate-400' dy={10} />
                      <YAxis axisLine={false} tickLine={false} className='text-[10px] font-bold text-slate-400' dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type='monotone'
                        dataKey='revenue'
                        stroke='#10b981'
                        strokeWidth={3}
                        fillOpacity={1}
                        fill='url(#colorRevenue)'
                      />
                      <Area
                        type='monotone'
                        dataKey='orders'
                        stroke='#3b82f6'
                        strokeWidth={3}
                        fillOpacity={1}
                        fill='url(#colorOrders)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                    No sales data available.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className='rounded-[2.5rem] border-slate-200 overflow-hidden shadow-sm'>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold font-display">Fast Moving Inventory</CardTitle>
                    <CardDescription>The most requested medicines this week</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-full text-[10px] font-black uppercase" onClick={() => navigate('/manager/inventory')}>View Inventory</Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='space-y-4'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='h-14 w-full bg-muted animate-pulse rounded-2xl' />
                    ))}
                  </div>
                ) : topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 group">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-xs font-black text-slate-400 group-hover:text-slate-900 transition-colors">
                                0{index + 1}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{product.name}</p>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{product.totalSold || 0} units sold</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{(product.revenue || 0).toLocaleString()} ETB</p>
                                <Badge variant="outline" className={`text-[9px] rounded-full px-2 font-black ${product.stockLeft < 20 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                    {product.stockLeft} LEFT
                                </Badge>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='py-12 text-center text-muted-foreground'>No data found.</div>
                )}
              </CardContent>
            </Card>
        </div>

        {/* Right Column: Health Status & Alerts */}
        <div className="lg:col-span-4 space-y-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {/* Quick Actions Panel */}
            <Card className="rounded-[2.5rem] bg-slate-900 dark:bg-slate-950 text-white overflow-hidden border-0 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                        Quick Command
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                    <Button className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white border-0 justify-start gap-4 transition-all hover:scale-[1.02]" onClick={() => navigate('/manager/inventory')}>
                        <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/20">
                            <Plus className="w-4 h-4" strokeWidth={3} />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">New Stock</span>
                    </Button>
                    <Button className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white border-0 justify-start gap-4 transition-all hover:scale-[1.02]" onClick={() => setShowImportModal(true)}>
                        <div className="w-8 h-8 rounded-xl bg-blue-400 flex items-center justify-center text-slate-900 shadow-lg shadow-blue-400/20">
                            <Upload className="w-4 h-4" strokeWidth={3} />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">Bulk Import</span>
                    </Button>
                    <Button className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white border-0 justify-start gap-4 transition-all hover:scale-[1.02]" onClick={() => navigate('/manager/pos-sales')}>
                        <div className="w-8 h-8 rounded-xl bg-emerald-400 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-400/20">
                            <ShoppingCart className="w-4 h-4" strokeWidth={3} />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">Register Sale</span>
                    </Button>
                </CardContent>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            </Card>

            {/* Inventory Status Chart */}
            <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg font-bold font-display">Stock Composition</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    {loading ? (
                        <div className="h-64 w-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : (
                        <>
                        <div className="relative w-full h-64">
                            <ResponsiveContainer width='100%' height='100%'>
                                <PieChart>
                                <Pie
                                    data={inventoryData}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey='value'
                                    strokeWidth={0}
                                >
                                    {inventoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black uppercase text-slate-400">Total Items</span>
                                <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                                    {inventoryData.reduce((acc, curr) => acc + curr.value, 0)}
                                </span>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4 mt-4">
                            {inventoryData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card className="rounded-[2.5rem] border-slate-200 shadow-sm bg-slate-50/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-rose-500" /> Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((n, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.02]">
                                <div className={`w-2 h-10 rounded-full flex-shrink-0 ${n.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title || n.message}</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">{n.time || 'A moment ago'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Healthy</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      <BulkImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onSuccess={() => {}}
      />
    </div>
  );
}
