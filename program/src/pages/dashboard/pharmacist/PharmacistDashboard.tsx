import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/ui';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

import gsap from 'gsap';
import {
  Search,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  ClipboardList,
  Pill,
  Trash2,
  Edit,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Medicine {
  _id: Id<'medicines'>;
  _creationTime: number;
  branchId: Id<'branches'>;
  name: string;
  category: string;
  stock: number;
  price: number;
  minStock?: number;
  type?: string;
  manufacturer?: string;
  barcode?: string;
  expiryDate?: number;
  status?: string;
  genericName?: string;
  prescriptionRequired?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

export function PharmacistDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            immediateRender: true,
          }
        );
      }
    }, contentRef);
    return () => ctx.revert();
  }, [activeTab]);

  return (
    <div className='space-y-8 pb-12'>
      <div>
        <h1 className='text-3xl font-display font-bold tracking-tight text-foreground'>
          Pharmacist Dashboard
        </h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Monitor branch inventory and medical supplies
        </p>
      </div>

      <Tabs value={activeTab} className='w-full'>
        <div ref={contentRef}>
          <TabsContent value='overview' className='mt-0 focus:outline-none'>
            <OverviewTab />
          </TabsContent>

          <TabsContent value='medicines' className='mt-0 focus:outline-none'>
            <MedicinesTab />
          </TabsContent>

          <TabsContent value='expiry' className='mt-0 focus:outline-none'>
            <ExpiryAlertsTab />
          </TabsContent>

          <TabsContent value='stock' className='mt-0 focus:outline-none'>
            <StockRequestsTab />
          </TabsContent>

          <TabsContent value='reports' className='mt-0 focus:outline-none'>
            <ReportsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const stats = useQuery(api.pharmacist.queries.getDashboardStats);
  const medicines = useQuery(api.pharmacist.queries.getMedicines);
  const expiringMedicines = useQuery(api.pharmacist.queries.getExpiringMedicines);
  const lowStockMedicines = useQuery(api.pharmacist.queries.getLowStockMedicines);
  const loading =
    stats === undefined ||
    medicines === undefined ||
    expiringMedicines === undefined ||
    lowStockMedicines === undefined;

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-32 rounded-2xl' />
          ))}
        </div>
        <Skeleton className='h-96 rounded-2xl' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Medicines'
          value={stats.totalMedicines}
          icon={Pill}
          color='text-primary'
        />
        <StatCard
          title='Low Stock'
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color='text-destructive'
        />
        <StatCard
          title='Near Expiry'
          value={expiringMedicines.length}
          icon={Clock}
          color='text-amber-600'
        />
        <StatCard
          title="Today's Sales"
          value={`ETB ${stats.todaySales.toLocaleString()}`}
          icon={DollarSign}
          color='text-primary'
        />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {lowStockMedicines.length > 0 && (
          <Card className='minimal-card border-destructive/10'>
            <CardHeader>
              <CardTitle className='text-sm font-bold uppercase tracking-widest text-destructive flex items-center gap-2'>
                <AlertTriangle className='w-4 h-4' />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {lowStockMedicines.slice(0, 4).map((medicine: Medicine) => (
                  <div
                    key={medicine._id}
                    className='flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10'
                  >
                    <span className='font-semibold text-[13px]'>{medicine.name}</span>
                    <Badge variant='destructive' className='text-[10px]'>
                      {medicine.stock} units left
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className='minimal-card'>
          <CardHeader>
            <CardTitle className='text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2'>
              <ShieldAlert className='w-4 h-4' />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {expiringMedicines.slice(0, 4).map((medicine: Medicine) => {
                const days = Math.ceil((medicine.expiryDate! - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    key={medicine._id}
                    className='flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/40'
                  >
                    <span className='font-semibold text-[13px]'>{medicine.name}</span>
                    <Badge variant='outline' className='text-[10px] font-bold'>
                      {days} days
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className='minimal-card p-6'>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
          {title}
        </p>
        <div
          className={cn('w-8 h-8 rounded-lg bg-secondary flex items-center justify-center', color)}
        >
          <Icon className='h-4 w-4' />
        </div>
      </div>
      <div className='text-2xl font-display font-bold'>{value}</div>
    </Card>
  );
}

function MedicinesTab() {
  const medicines = useQuery(api.pharmacist.queries.getMedicines);
  const loading = medicines === undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const removeMedicineMutation = useMutation(api.pharmacist.mutations.removeMedicine);

  const categories = useMemo(() => {
    if (!medicines) return [] as string[];
    const cats = medicines
      .map((m: Medicine) => m.category)
      .filter((c: string | undefined): c is string => Boolean(c));
    return [...new Set(cats)] as string[];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    let filtered = [...medicines];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m: Medicine) => m.name?.toLowerCase().includes(q) || m.barcode?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all')
      filtered = filtered.filter((m: Medicine) => m.category === categoryFilter);
    return filtered;
  }, [medicines, searchQuery, categoryFilter]);

  const getStockBadge = (stock: number) => {
    if (stock <= 10)
      return (
        <Badge variant='destructive' className='text-[10px] px-2'>
          Low
        </Badge>
      );
    if (stock <= 20)
      return (
        <Badge className='bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-2'>
          Medium
        </Badge>
      );
    return (
      <Badge className='bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-2'>
        Good
      </Badge>
    );
  };

  if (loading) return <Skeleton className='h-96 rounded-2xl' />;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
          <Input
            placeholder='Search inventory...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 h-11 rounded-xl'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='h-11 rounded-xl w-40'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className='rounded-xl h-11 px-6 gap-2'>
            <Plus className='w-4 h-4' />
            Add Item
          </Button>
        </div>
      </div>

      <Card className='minimal-card overflow-hidden'>
        <Table>
          <TableHeader className='bg-secondary/20'>
            <TableRow>
              <TableHead className='py-4 font-bold text-[11px] uppercase tracking-widest pl-6'>
                Medicine
              </TableHead>
              <TableHead className='py-4 font-bold text-[11px] uppercase tracking-widest'>
                Category
              </TableHead>
              <TableHead className='py-4 font-bold text-[11px] uppercase tracking-widest'>
                Stock
              </TableHead>
              <TableHead className='py-4 font-bold text-[11px] uppercase tracking-widest'>
                Price
              </TableHead>
              <TableHead className='py-4 font-bold text-[11px] uppercase tracking-widest text-right pr-6'>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((medicine: Medicine) => (
              <TableRow key={medicine._id} className='hover:bg-secondary/5 transition-colors'>
                <TableCell className='py-4 pl-6 font-semibold'>{medicine.name}</TableCell>
                <TableCell className='text-muted-foreground'>{medicine.category}</TableCell>
                <TableCell>{getStockBadge(medicine.stock)}</TableCell>
                <TableCell className='font-mono text-[13px]'>ETB {medicine.price}</TableCell>
                <TableCell className='text-right pr-6'>
                  <div className='flex justify-end gap-1'>
                    <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg'>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 rounded-lg text-destructive'
                      onClick={() => removeMedicineMutation({ id: medicine._id })}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function ExpiryAlertsTab() {
  const medicines = useQuery(api.pharmacist.queries.getMedicines);
  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
    return medicines.filter((m: Medicine) => m.expiryDate && m.expiryDate <= thirtyDays);
  }, [medicines]);

  if (!medicines) return <Skeleton className='h-96 rounded-2xl' />;

  return (
    <div className='space-y-6'>
      <Card className='minimal-card bg-destructive/5 border-destructive/20'>
        <CardHeader>
          <CardTitle className='text-destructive font-bold flex items-center gap-2'>
            <ShieldAlert className='w-5 h-5' />
            Critical Expiry Watchlist
          </CardTitle>
          <CardDescription>Items identified for immediate return or disposal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredMedicines.map((m: Medicine) => (
              <div
                key={m._id}
                className='p-4 rounded-xl bg-background border border-destructive/10 flex flex-col justify-between'
              >
                <div>
                  <p className='font-bold text-[14px] mb-1'>{m.name}</p>
                  <p className='text-xs text-muted-foreground mb-4'>
                    Exp: {new Date(m.expiryDate!).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant='destructive'
                  size='sm'
                  className='w-full rounded-lg h-8 text-[11px] font-bold uppercase tracking-wider'
                >
                  Mark for Return
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StockRequestsTab() {
  const requests = useQuery(api.pharmacist.queries.getStockRequests);
  if (!requests) return <Skeleton className='h-96 rounded-2xl' />;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold font-display'>Replenishment Requests</h2>
        <Button className='rounded-xl h-10 gap-2'>
          <Plus className='w-4 h-4' />
          New Request
        </Button>
      </div>
      <div className='grid gap-4'>
        {requests.map(
          (r: {
            _id: string;
            medicineName: string;
            quantity: number;
            urgency: string;
            status: string;
          }) => (
            <div key={r._id} className='minimal-card p-5 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 rounded-xl bg-secondary flex items-center justify-center'>
                  <ClipboardList className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <p className='font-bold text-[15px]'>{r.medicineName}</p>
                  <p className='text-xs text-muted-foreground'>
                    Qty: {r.quantity} · Urgency: <span className='capitalize'>{r.urgency}</span>
                  </p>
                </div>
              </div>
              <Badge className='capitalize px-3 h-7'>{r.status}</Badge>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  const medicines = useQuery(api.pharmacist.queries.getMedicines);
  if (!medicines) return <Skeleton className='h-96 rounded-2xl' />;

  return (
    <div className='grid gap-6 lg:grid-cols-3'>
      <Card className='minimal-card lg:col-span-2'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>Inventory Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl'>
            Analytics Visualization Placeholder
          </div>
        </CardContent>
      </Card>
      <Card className='minimal-card'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>Stock Valuation</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 text-center py-8'>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1'>
              Total Assets
            </p>
            <p className='text-4xl font-display font-bold'>ETB 142k</p>
          </div>
          <div className='pt-6 border-t border-border/40'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1'>
              Items Tracked
            </p>
            <p className='text-2xl font-bold'>{medicines.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
