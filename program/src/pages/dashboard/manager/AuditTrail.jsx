import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/ui';
import {
  Search,
  ClipboardList,
  Download,
  Clock,
  User,
  Activity,
  Loader2,
  RefreshCw,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

const PAGE_SIZE = 15;

export function AuditTrail() {
  const logsQuery = useQuery(api.manager.queries.getAuditTrail);
  const loading = logsQuery === undefined;
  const logs = logsQuery || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const getActionBadge = (action) => {
    const actionLower = (action || '').toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Create</Badge>;
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Update</Badge>;
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Delete</Badge>;
    }
    if (actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('auth')) {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Auth</Badge>;
    }
    if (actionLower.includes('sale') || actionLower.includes('refund') || actionLower.includes('payment')) {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Transaction</Badge>;
    }
    if (actionLower.includes('stock') || actionLower.includes('inventory') || actionLower.includes('import')) {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Inventory</Badge>;
    }
    return <Badge variant="outline">{action || 'Unknown'}</Badge>;
  };

  const getActionType = (action) => {
    const a = (action || '').toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'create';
    if (a.includes('update') || a.includes('edit')) return 'update';
    if (a.includes('delete') || a.includes('remove')) return 'delete';
    if (a.includes('login') || a.includes('logout') || a.includes('auth')) return 'auth';
    if (a.includes('sale') || a.includes('refund') || a.includes('payment')) return 'transaction';
    if (a.includes('stock') || a.includes('inventory') || a.includes('import')) return 'inventory';
    return 'other';
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || getActionType(log.action) === filterType;

      return matchesSearch && matchesType;
    });
  }, [logs, searchTerm, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const stats = useMemo(() => [
    { title: 'Total Logs', value: logs.length, icon: ClipboardList, color: 'text-blue-600' },
    { title: 'Creates', value: logs.filter((l) => getActionType(l.action) === 'create').length, icon: FileText, color: 'text-green-600' },
    { title: 'Updates', value: logs.filter((l) => getActionType(l.action) === 'update').length, icon: Activity, color: 'text-orange-600' },
    { title: 'Auth Events', value: logs.filter((l) => getActionType(l.action) === 'auth').length, icon: Shield, color: 'text-purple-600' },
  ], [logs]);

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'auth', label: 'Auth' },
    { value: 'transaction', label: 'Transaction' },
    { value: 'inventory', label: 'Inventory' },
  ];

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }
    const headers = ['Timestamp', 'User', 'Action', 'Description'];
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.user || 'System',
      log.action || '',
      (log.details || '').replace(/,/g, ';'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit trail exported');
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground mt-1">Monitor system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
          ))
        ) : (
          stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                {filterOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
            </div>
          ) : (
            <>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log, index) => (
                      <TableRow key={log._id || `log-${index}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><User className="h-3.5 w-3.5 text-muted-foreground" /></div>
                            <span className="font-medium text-sm">{log.user || 'System'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground max-w-xs truncate block">{log.details || '-'}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} logs
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
                  <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
