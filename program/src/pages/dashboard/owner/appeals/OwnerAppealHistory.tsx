import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import {
  ShieldAlert,
  UserX,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ManagerFlagAppeal {
  id: string;
  type: 'manager_flag';
  managerName: string;
  managerEmail: string;
  flaggedBy: string;
  flaggedAt: number;
  flagReason: string;
  ownerResponse: string;
  ownerRespondedAt: number | undefined;
  status: string;
}

interface AdminActionAppeal {
  id: string;
  type: 'admin_action';
  targetUserName: string;
  targetUserEmail: string;
  performedBy: string;
  actionType: string;
  reason: string;
  timestamp: number;
  ownerNotifiedAt: number;
  actionStatus: string;
}

export function OwnerAppealHistory() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'manager_flags' | 'admin_actions'>('all');
  const { sessionToken } = useAuth();

  const appealHistory = useQuery(
    api.owner.queries.getAppealHistory,
    sessionToken ? { sessionToken } : 'skip'
  );

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (appeal: ManagerFlagAppeal | AdminActionAppeal) => {
    if (appeal.type === 'manager_flag') {
      switch (appeal.status) {
        case 'flagged':
          return <Badge className='bg-amber-500 hover:bg-amber-600'>Flagged</Badge>;
        case 'reviewed':
          return <Badge className='bg-red-500 hover:bg-red-600'>Rejected</Badge>;
        case 'dismissed':
          return <Badge className='bg-emerald-500 hover:bg-emerald-600'>Dismissed</Badge>;
        default:
          return <Badge variant='outline'>Unknown</Badge>;
      }
    } else {
      switch (appeal.actionStatus) {
        case 'active':
          return <Badge className='bg-red-500 hover:bg-red-600'>Active</Badge>;
        case 'lifted_by_admin':
          return <Badge className='bg-emerald-500 hover:bg-emerald-600'>Lifted</Badge>;
        case 'lifted_by_owner':
          return <Badge className='bg-blue-500 hover:bg-blue-600'>Resolved</Badge>;
        default:
          return <Badge variant='outline'>Unknown</Badge>;
      }
    }
  };

  const renderManagerFlagCard = (appeal: ManagerFlagAppeal) => {
    const isExpanded = expandedCards.has(appeal.id);

    return (
      <Card
        key={appeal.id}
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded && 'ring-2 ring-emerald-500/20'
        )}
      >
        <CardHeader
          className={cn(
            'cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20',
            'transition-colors'
          )}
          onClick={() => toggleCard(appeal.id)}
        >
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1 space-y-2'>
              <div className='flex items-center gap-3'>
                <ShieldAlert className='h-5 w-5 text-amber-600' />
                <CardTitle className='text-lg'>Manager Flag</CardTitle>
                {getStatusBadge(appeal)}
              </div>
              <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  {appeal.managerName}
                </span>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  {formatDate(appeal.flaggedAt)}
                </span>
              </div>
            </div>
            <div className='flex-shrink-0'>
              {isExpanded ? (
                <ChevronUp className='h-5 w-5 text-muted-foreground' />
              ) : (
                <ChevronDown className='h-5 w-5 text-muted-foreground' />
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className='space-y-4 pt-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>Flag Details</h4>
                <div className='rounded-lg border bg-muted/30 p-3 space-y-2'>
                  <div className='flex items-start gap-2 text-sm'>
                    <ShieldAlert className='h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='font-medium'>Flagged By:</p>
                      <p className='text-muted-foreground'>{appeal.flaggedBy}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-2 text-sm'>
                    <FileText className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='font-medium'>Flag Reason:</p>
                      <p className='text-muted-foreground'>{appeal.flagReason}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>Your Response</h4>
                <div className='rounded-lg border bg-emerald-50/30 dark:bg-emerald-950/20 p-3 space-y-2'>
                  {appeal.ownerRespondedAt && (
                    <div className='flex items-start gap-2 text-sm'>
                      <Calendar className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                      <p className='text-muted-foreground'>
                        Responded: {formatDate(appeal.ownerRespondedAt)}
                      </p>
                    </div>
                  )}
                  <div className='flex items-start gap-2 text-sm'>
                    <FileText className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                    <p className='text-muted-foreground'>{appeal.ownerResponse}</p>
                  </div>
                </div>
              </div>
            </div>

            {appeal.status === 'reviewed' && (
              <div className='flex items-start gap-2 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'>
                <XCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium text-red-900 dark:text-red-100'>Appeal Rejected</p>
                  <p className='text-sm text-red-700 dark:text-red-300'>
                    The flag remains active. The admin reviewed your response and decided to
                    maintain the flag.
                  </p>
                </div>
              </div>
            )}

            {appeal.status === 'dismissed' && (
              <div className='flex items-start gap-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900'>
                <CheckCircle2 className='h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium text-emerald-900 dark:text-emerald-100'>
                    Flag Dismissed
                  </p>
                  <p className='text-sm text-emerald-700 dark:text-emerald-300'>
                    Your appeal was successful. The flag has been dismissed and removed from your
                    manager's record.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderAdminActionCard = (appeal: AdminActionAppeal) => {
    const isExpanded = expandedCards.has(appeal.id);

    return (
      <Card
        key={appeal.id}
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded && 'ring-2 ring-emerald-500/20'
        )}
      >
        <CardHeader
          className={cn(
            'cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20',
            'transition-colors'
          )}
          onClick={() => toggleCard(appeal.id)}
        >
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1 space-y-2'>
              <div className='flex items-center gap-3'>
                <UserX className='h-5 w-5 text-red-600' />
                <CardTitle className='text-lg'>Admin Action</CardTitle>
                {getStatusBadge(appeal)}
              </div>
              <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  {appeal.targetUserName}
                </span>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  {formatDate(appeal.timestamp)}
                </span>
              </div>
            </div>
            <div className='flex-shrink-0'>
              {isExpanded ? (
                <ChevronUp className='h-5 w-5 text-muted-foreground' />
              ) : (
                <ChevronDown className='h-5 w-5 text-muted-foreground' />
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className='space-y-4 pt-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>Action Details</h4>
                <div className='rounded-lg border bg-muted/30 p-3 space-y-2'>
                  <div className='flex items-start gap-2 text-sm'>
                    <UserX className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='font-medium'>Action Type:</p>
                      <p className='text-muted-foreground'>
                        {appeal.actionType === 'flag_for_review'
                          ? 'Flag for Review'
                          : 'Temporary Lock'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-2 text-sm'>
                    <Clock className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='font-medium'>Performed By:</p>
                      <p className='text-muted-foreground'>{appeal.performedBy}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-2 text-sm'>
                    <FileText className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='font-medium'>Reason:</p>
                      <p className='text-muted-foreground'>{appeal.reason}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>Status Timeline</h4>
                <div className='rounded-lg border bg-muted/30 p-3 space-y-2'>
                  <div className='flex items-start gap-2 text-sm'>
                    <Calendar className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                    <p className='text-muted-foreground'>
                      Action taken: {formatDate(appeal.timestamp)}
                    </p>
                  </div>
                  <div className='flex items-start gap-2 text-sm'>
                    <Calendar className='h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0' />
                    <p className='text-muted-foreground'>
                      Notified: {formatDate(appeal.ownerNotifiedAt)}
                    </p>
                  </div>
                  <div className='flex items-start gap-2 text-sm'>
                    <ShieldAlert className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                    <p className='text-muted-foreground'>
                      Current Status: <span className='font-medium'>{appeal.actionStatus}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {appeal.actionStatus === 'lifted_by_admin' && (
              <div className='flex items-start gap-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900'>
                <CheckCircle2 className='h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium text-emerald-900 dark:text-emerald-100'>
                    Action Lifted
                  </p>
                  <p className='text-sm text-emerald-700 dark:text-emerald-300'>
                    Your appeal was successful. The admin has lifted this action and it is no longer
                    in effect.
                  </p>
                </div>
              </div>
            )}

            {appeal.actionStatus === 'active' && (
              <div className='flex items-start gap-2 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'>
                <XCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium text-red-900 dark:text-red-100'>Action Still Active</p>
                  <p className='text-sm text-red-700 dark:text-red-300'>
                    This admin action is still in effect. You may need to take corrective action or
                    wait for review.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  if (appealHistory === undefined) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
          Appeal History
        </h2>
        <p className='text-muted-foreground'>
          Track the status of your appeals and responses from administrators
        </p>
      </div>

      {appealHistory.totalAppeals === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <FileText className='h-16 w-16 text-emerald-600/20 mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No Appeals History</h3>
            <p className='text-muted-foreground text-center max-w-md'>
              You haven't submitted any appeals yet. Appeals will appear here when they're created.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='all'>All Appeals ({appealHistory.totalAppeals})</TabsTrigger>
              <TabsTrigger value='manager_flags'>
                Manager Flags ({appealHistory.managerFlagAppeals.length})
              </TabsTrigger>
              <TabsTrigger value='admin_actions'>
                Admin Actions ({appealHistory.adminActionAppeals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='all' className='space-y-4 mt-6'>
              <div className='space-y-3'>
                {appealHistory.managerFlagAppeals.map((appeal: ManagerFlagAppeal) =>
                  renderManagerFlagCard(appeal)
                )}
                {appealHistory.adminActionAppeals.map((appeal: AdminActionAppeal) =>
                  renderAdminActionCard(appeal)
                )}
              </div>
            </TabsContent>

            <TabsContent value='manager_flags' className='space-y-4 mt-6'>
              {appealHistory.managerFlagAppeals.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='flex flex-col items-center justify-center py-12'>
                    <ShieldAlert className='h-12 w-12 text-emerald-600/20 mb-3' />
                    <p className='text-muted-foreground'>No manager flag appeals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className='space-y-3'>
                  {appealHistory.managerFlagAppeals.map((appeal: ManagerFlagAppeal) =>
                    renderManagerFlagCard(appeal)
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value='admin_actions' className='space-y-4 mt-6'>
              {appealHistory.adminActionAppeals.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='flex flex-col items-center justify-center py-12'>
                    <UserX className='h-12 w-12 text-emerald-600/20 mb-3' />
                    <p className='text-muted-foreground'>No admin action appeals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className='space-y-3'>
                  {appealHistory.adminActionAppeals.map((appeal: AdminActionAppeal) =>
                    renderAdminActionCard(appeal)
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
