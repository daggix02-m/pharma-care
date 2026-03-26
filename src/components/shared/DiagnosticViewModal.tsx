import * as React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Activity,
  FileText,
  AlertTriangle,
  Play,
  Square,
  X,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId?: string;
  sessionId?: string;
}

export function DiagnosticViewModal({
  open,
  onOpenChange,
  targetUserId,
  sessionId,
}: DiagnosticViewModalProps) {
  const auth = useAuth() as any;
  const [mode, setMode] = React.useState<'view' | 'start'>('view');
  const [startReason, setStartReason] = React.useState('');

  const session = useQuery(
    (api.admin as any).getDiagnosticSessions,
    sessionId ? { sessionId } : 'skip'
  );

  const startSessionMutation = useMutation((api.admin as any).startDiagnosticSession);
  const endSessionMutation = useMutation((api.admin as any).endDiagnosticSession);

  const isStarting = React.useMemo(
    () => (startSessionMutation as any).status === 'loading',
    [(startSessionMutation as any).status]
  );
  const isEnding = React.useMemo(
    () => (endSessionMutation as any).status === 'loading',
    [(endSessionMutation as any).status]
  );

  const activeSession = React.useMemo(
    () => session?.find((s: any) => s.isActive) || null,
    [session]
  );

  React.useEffect(() => {
    if (targetUserId && open) {
      setMode('start');
      setStartReason('');
    } else if (sessionId && open) {
      setMode('view');
    }
  }, [targetUserId, sessionId, open]);

  const handleStartSession = async () => {
    if (!startReason.trim()) {
      toast.error('Please provide a reason for starting the diagnostic session');
      return;
    }

    try {
      await startSessionMutation({
        targetUserId: targetUserId as any,
        reason: startReason,
      });

      toast.success('Diagnostic session started successfully');
      setStartReason('');
      setMode('view');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start diagnostic session');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSessionMutation({ sessionId });
      toast.success('Diagnostic session ended successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to end diagnostic session');
    }
  };

  const formatDuration = (startTime: number, endTime?: number | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const StartSessionForm = () => (
    <div className='space-y-4 py-4'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Reason for Diagnostic Session</label>
        <Textarea
          value={startReason}
          onChange={(e) => setStartReason(e.target.value)}
          placeholder="Explain why you're starting this diagnostic session..."
          rows={4}
          className='resize-none'
        />
      </div>

      <div className='flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
        <AlertTriangle className='h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5' />
        <div className='flex-1'>
          <p className='text-sm font-medium text-orange-900'>Important Notice</p>
          <p className='text-xs text-orange-700 mt-1'>
            This is a read-only diagnostic view. All actions will be logged and blocked. The user
            will be notified that an admin is viewing their session.
          </p>
        </div>
      </div>
    </div>
  );

  const SessionViewContent = () => {
    if (!session || session.length === 0) {
      return (
        <div className='text-center py-12'>
          <Activity className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
          <p className='text-muted-foreground'>No diagnostic sessions found</p>
        </div>
      );
    }

    const sessionData = sessionId ? session.find((s: any) => s._id === sessionId) : activeSession;

    if (!sessionData) {
      return (
        <div className='text-center py-12'>
          <AlertTriangle className='h-12 w-12 text-orange-600 mx-auto mb-3' />
          <p className='text-muted-foreground'>Session not found</p>
        </div>
      );
    }

    const duration = formatDuration(sessionData.startedAt, sessionData.endedAt);

    return (
      <div className='space-y-4 py-4'>
        {/* Session Summary */}
        <Card className='border-2 border-[hsl(var(--medical-teal))]/20'>
          <CardHeader>
            <CardTitle className='text-base font-semibold flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Activity className='h-4 w-4 text-[hsl(var(--medical-teal))]' />
                Session Summary
              </div>
              {sessionData.isActive && (
                <Badge className='bg-emerald-500 hover:bg-emerald-600'>
                  <div className='flex items-center gap-1'>
                    <div className='h-2 w-2 rounded-full bg-white animate-pulse' />
                    Active
                  </div>
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <SessionSummaryItem label='Admin' value={auth.user?.full_name || 'Admin'} />
              <SessionSummaryItem
                label='Target User'
                value={sessionData.targetUserName || 'User'}
              />
              <SessionSummaryItem label='Duration' value={duration} />
              <SessionSummaryItem
                label='Pages Viewed'
                value={sessionData.pagesViewed?.length || 0}
              />
            </div>
            {sessionData.reason && (
              <div className='mt-4 p-3 bg-muted/30 rounded-lg'>
                <p className='text-xs text-muted-foreground mb-1'>Trigger Note:</p>
                <p className='text-sm'>{sessionData.reason}</p>
              </div>
            )}
            {sessionData.isActive && (
              <div className='mt-4'>
                <Button
                  onClick={() => handleEndSession(sessionData._id)}
                  disabled={isEnding}
                  variant='destructive'
                  className='w-full'
                >
                  {isEnding ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Ending Session...
                    </>
                  ) : (
                    <>
                      <Square className='h-4 w-4 mr-2' />
                      End Diagnostic Session
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pages Viewed */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <FileText className='h-4 w-4 text-[hsl(var(--medical-teal))]' />
              Pages Viewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionData.pagesViewed && sessionData.pagesViewed.length > 0 ? (
              <div className='space-y-2'>
                {sessionData.pagesViewed.map((pageView: any, idx: number) => (
                  <div key={idx} className='flex items-center gap-3 p-3 bg-muted/30 rounded-lg'>
                    <ChevronRight className='h-4 w-4 text-muted-foreground' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>{pageView.page}</p>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(pageView.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-6 text-sm text-muted-foreground'>
                No pages viewed yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blocked Actions */}
        {sessionData.blockedActions && sessionData.blockedActions.length > 0 && (
          <Card className='border-2 border-red-200'>
            <CardHeader>
              <CardTitle className='text-base font-semibold flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4 text-red-600' />
                Blocked Actions
                <Badge variant='destructive'>{sessionData.blockedActions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {sessionData.blockedActions.map((action: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex items-center gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200'
                  >
                    <X className='h-4 w-4 text-red-600' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-red-600'>{action.action}</p>
                      <p className='text-xs text-muted-foreground'>
                        Blocked at: {new Date(action.blockedAt).toLocaleString()}
                      </p>
                      {action.attemptedValue && (
                        <p className='text-xs text-muted-foreground'>
                          Value: {action.attemptedValue}
                        </p>
                      )}
                    </div>
                    <Badge variant='destructive'>BLOCKED</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5 text-[hsl(var(--medical-teal))]' />
            {mode === 'start' ? 'Start Diagnostic Session' : 'Diagnostic Session View'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'start'
              ? 'Start a read-only diagnostic session to view user activity without making changes'
              : 'View read-only diagnostic session details and activity'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'start' ? <StartSessionForm /> : <SessionViewContent />}

        <DialogFooter>
          {mode === 'start' ? (
            <>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStartSession}
                disabled={!startReason.trim() || isStarting}
                className='bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
              >
                {isStarting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className='h-4 w-4 mr-2' />
                    Start Session
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SessionSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs text-muted-foreground mb-1'>{label}</p>
      <p className='text-sm font-semibold'>{value}</p>
    </div>
  );
}
