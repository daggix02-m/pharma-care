import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle,
  User,
  Clock,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AuditLog {
  action: string;
  entityType: string;
  details?: string | Record<string, unknown>;
  userId: string;
  timestamp: number;
}

interface AuditLogSectionProps {
  logs: AuditLog[];
}

export function AuditLogSection({ logs }: AuditLogSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const categories = Array.from(new Set(logs.map((log) => log.entityType)));
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.entityType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <Card className='border-2 border-[hsl(var(--medical-teal))]/20 bg-gradient-to-br from-background to-[hsl(var(--medical-teal))]/5'>
        <CardContent className='p-4'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex-1 min-w-[200px]'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search audit logs...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-muted-foreground' />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className='px-3 py-2 rounded-lg border-2 border-border bg-background text-sm focus:outline-none focus:border-[hsl(var(--medical-teal))] transition-colors'
              >
                <option value='all'>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <Input
                type='date'
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className='w-auto'
              />
              <Input
                type='date'
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className='w-auto'
              />

              <Button variant='outline' size='sm'>
                <Download className='h-4 w-4 mr-1' />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <FileText className='h-4 w-4 text-[hsl(var(--medical-teal))]' />
              Audit Log
            </CardTitle>
            <Badge variant='outline'>{filteredLogs.length} entries</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {filteredLogs.slice(0, 20).map((log, idx) => (
              <AuditLogEntry key={idx} log={log} />
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className='p-12 text-center'>
              <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Audit Logs Found</h3>
              <p className='text-sm text-muted-foreground'>Try adjusting your search or filters.</p>
            </div>
          )}

          {filteredLogs.length > 20 && (
            <div className='text-center pt-4'>
              <Button variant='outline'>Load More</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface AuditLogEntryProps {
  log: AuditLog;
}

function AuditLogEntry({ log }: AuditLogEntryProps) {
  const actionConfig: Record<string, { icon: typeof AlertCircle; color: string; label: string }> = {
    approve_branch: { icon: CheckCircle, color: 'text-green-600', label: 'Branch Approved' },
    reject_branch: { icon: AlertCircle, color: 'text-red-600', label: 'Branch Rejected' },
    delete_pharmacy: { icon: AlertCircle, color: 'text-red-600', label: 'Pharmacy Deleted' },
    flag_manager: { icon: Shield, color: 'text-yellow-600', label: 'Manager Flagged' },
    lock_manager: { icon: Shield, color: 'text-orange-600', label: 'Manager Locked' },
    suspend_pharmacy: { icon: AlertCircle, color: 'text-red-600', label: 'Pharmacy Suspended' },
    create_staff: { icon: User, color: 'text-blue-600', label: 'Staff Created' },
  };

  const config = actionConfig[log.action] || {
    icon: FileText,
    color: 'text-muted-foreground',
    label: log.action,
  };
  const Icon = config.icon;

  return (
    <div className='flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors'>
      <div
        className={`p-2 rounded-lg ${config.color.replace('text-', 'bg-').replace('-600', '/10')}`}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      <div className='flex-1'>
        <div className='flex items-center gap-2 mb-1'>
          <span className='text-sm font-semibold'>{config.label}</span>
          <Badge variant='outline' className='text-xs'>
            {log.entityType}
          </Badge>
        </div>

        {log.details && (
          <p className='text-sm text-muted-foreground mb-2'>
            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
          </p>
        )}

        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <User className='h-3 w-3' />
            <span>User ID: {log.userId.slice(0, 8)}...</span>
          </div>
          <div className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            <span>{new Date(log.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
