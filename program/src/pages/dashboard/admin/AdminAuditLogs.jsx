import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  Clock,
  User,
  Activity,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  LogIn,
  LogOut,
  RefreshCw,
  Calendar,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateGroup = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
};

const actionConfig = {
  create: { icon: Plus, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/40', badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  update: { icon: Edit, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800/40', badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  delete: { icon: Trash2, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/40', badge: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  activate: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/8 dark:bg-primary/10', border: 'border-primary/20 dark:border-primary/30', badge: 'bg-primary/8 dark:bg-primary/10 text-primary' },
  deactivate: { icon: XCircle, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800/40', badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
  login: { icon: LogIn, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-100 dark:border-violet-800/40', badge: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
  logout: { icon: LogOut, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/40', border: 'border-slate-100 dark:border-slate-700/40', badge: 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400' },
  approve: { icon: ShieldCheck, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/40', badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  reject: { icon: XCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/40', badge: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
};

const getActionStyle = (action) => {
  const lower = (action || '').toLowerCase();
  for (const [key, cfg] of Object.entries(actionConfig)) {
    if (lower.includes(key)) return cfg;
  }
  return { 
    icon: Activity, 
    color: 'text-muted-foreground', 
    bg: 'bg-muted/40 dark:bg-slate-800/30', 
    border: 'border-border/40',
    badge: 'bg-muted/40 dark:bg-slate-800/30 text-muted-foreground'
  };
};

export default function AdminAuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(20);

  const logs = useQuery(api.admin.queries.getAuditLogs) || [];
  const isLoading = logs === undefined;

  const filteredLogs = useMemo(() => {
    return (Array.isArray(logs) ? logs : [])
      .filter(log => 
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [logs, searchQuery]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups = {};
    filteredLogs.slice(0, limit).forEach(log => {
      const dateKey = formatDateGroup(log.timestamp || log.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [filteredLogs, limit]);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-up">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 dark:bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> System Activity
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Audit Log
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-[13px] leading-relaxed">
          Track every critical event within the PharmaCare platform.
        </p>
      </div>

      {/* Search Bar */}
      <div className="sticky top-4 z-20 px-4">
        <div className="relative group max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search logs by user or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-xl bg-background border-border/60 shadow-sm focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative px-4">
        {/* Central Line */}
        <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent sm:-translate-x-1/2" />

        <div className="space-y-14">
          {Object.entries(groupedLogs).map(([date, dayLogs]) => (
            <div key={date} className="relative space-y-10">
              {/* Date Header */}
              <div className="sticky top-24 z-10 flex justify-start sm:justify-center">
                <div className="bg-foreground text-background px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md">
                  {date}
                </div>
              </div>

              <div className="space-y-10">
                {dayLogs.map((log, idx) => {
                  const style = getActionStyle(log.action);
                  const Icon = style.icon;
                  const isLeft = idx % 2 === 0;
                  const isFailed = log.status?.toLowerCase() === 'failed';

                  return (
                    <div key={log._id || log.id || idx} className={`relative flex items-center justify-start ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'} group`}>
                      {/* Timeline Node */}
                      <div className="absolute left-8 sm:left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-background border-2 border-border/60 z-10 group-hover:scale-125 group-hover:border-primary transition-all duration-300" />

                      {/* Content Card */}
                      <div className={`ml-14 sm:ml-0 sm:w-[45%] p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all duration-300 ${isLeft ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.color} flex items-center justify-center border ${style.border}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                {formatTime(log.timestamp || log.created_at)}
                              </span>
                              {isFailed && (
                                <Badge variant="medical-rejected" className="text-[9px] px-2 py-0.5">Failed</Badge>
                              )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2.5">
                            <h3 className="font-semibold text-[14px] text-foreground leading-snug">
                                {log.action}
                            </h3>
                            <p className="text-[12px] text-muted-foreground leading-relaxed">
                                {log.details || log.description || 'System event recorded.'}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-3.5 border-t border-border/40 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted/50 dark:bg-slate-800/50 flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                                {log.user_name?.charAt(0) || 'S'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Initiated By</p>
                                <p className="text-[13px] font-medium text-foreground truncate">{log.user_name || 'System'}</p>
                            </div>
                        </div>
                      </div>

                      {/* Time connector for desktop */}
                      <div className={`hidden sm:block absolute top-1/2 -translate-y-1/2 w-6 h-px bg-border/40 ${isLeft ? 'left-[45%]' : 'right-[45%]'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More */}
      {filteredLogs.length > limit && (
          <div className="flex justify-center pt-6">
              <Button 
                variant="outline"
                onClick={() => setLimit(l => l + 20)}
                className="rounded-full px-6 h-10 font-semibold text-[12px] uppercase tracking-wider"
              >
                  Load More
                  <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
          </div>
      )}

      {/* Empty State */}
      {filteredLogs.length === 0 && (
          <div className="py-20 text-center space-y-4 admin-section-card">
              <div className="w-14 h-14 rounded-2xl bg-muted/40 mx-auto flex items-center justify-center">
                  <Activity className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-semibold text-[12px] uppercase tracking-wider">No entries found</p>
          </div>
      )}
    </div>
  );
}
