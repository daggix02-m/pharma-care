import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Activity,
  Clock,
  User,
  LogIn,
  LogOut,
  PlusCircle,
  FileEdit,
  Trash2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const getActivityIcon = (action) => {
  const lowerAction = (action || '').toLowerCase();
  if (lowerAction.includes('login') || lowerAction.includes('sign in')) return { icon: LogIn, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
  if (lowerAction.includes('logout') || lowerAction.includes('sign out')) return { icon: LogOut, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10' };
  if (lowerAction.includes('create') || lowerAction.includes('add')) return { icon: PlusCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' };
  if (lowerAction.includes('update') || lowerAction.includes('edit')) return { icon: FileEdit, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
  if (lowerAction.includes('delete') || lowerAction.includes('remove')) return { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' };
  if (lowerAction.includes('sale') || lowerAction.includes('transaction')) return { icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' };
  return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10' };
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function StaffActivityTimeline({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center">
        <Activity className="h-12 w-12 text-slate-200 mb-4" />
        <p className="text-sm text-slate-500">No activity logs found for this staff member.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Timeline line */}
      <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />

      {activities.map((activity, index) => {
        const { icon: Icon, color, bg } = getActivityIcon(activity.action);
        return (
          <div key={activity.id || index} className="relative flex gap-6 items-start">
            {/* Timeline point */}
            <div className={`relative z-10 w-10 h-10 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-slate-900`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>

            <div className="flex-1 pt-1.5 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide leading-none">
                  {activity.action}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {formatDate(activity.created_at || activity.timestamp)}
                </div>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {activity.description || activity.details || 'No details available for this activity.'}
              </p>
              
              {activity.ip_address && (
                <div className="mt-2 text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3 h-3" />
                  IP: {activity.ip_address}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Dummy icon for IP address since I didn't import Server
const Server = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);
