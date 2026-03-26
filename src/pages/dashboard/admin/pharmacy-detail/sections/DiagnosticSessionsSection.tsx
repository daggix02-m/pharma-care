import { Activity, Eye, Clock, FileText, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface DiagnosticSessionsSectionProps {
  pharmacyId: string;
}

export function DiagnosticSessionsSection({ pharmacyId }: DiagnosticSessionsSectionProps) {
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const diagnosticSessions = [
    {
      id: '1',
      adminId: 'admin_123',
      adminName: 'Dr. Sarah Admin',
      targetUserId: 'user_456',
      targetUserName: 'John Manager',
      targetPharmacyId: pharmacyId,
      sessionStartTime: '2026-03-10T10:30:00',
      sessionEndTime: '2026-03-10T11:15:00',
      duration: 2700, // 45 minutes in seconds
      pagesViewed: [
        { page: '/manager/dashboard', timestamp: '2026-03-10T10:31:00' },
        { page: '/manager/inventory', timestamp: '2026-03-10T10:35:00' },
        { page: '/manager/staff', timestamp: '2026-03-10T10:40:00' },
        { page: '/manager/reports', timestamp: '2026-03-10T10:50:00' },
      ],
      actionsAttempted: [
        { action: 'delete_staff', blockedAt: '2026-03-10T10:42:00', attemptedValue: 'user_789' },
        {
          action: 'modify_pricing',
          blockedAt: '2026-03-10T10:55:00',
          attemptedValue: 'medicine_123',
        },
      ],
      sessionTriggerNote: 'Investigating reported inventory discrepancy',
    },
    {
      id: '2',
      adminId: 'admin_123',
      adminName: 'Dr. Sarah Admin',
      targetUserId: 'user_456',
      targetUserName: 'John Manager',
      targetPharmacyId: pharmacyId,
      sessionStartTime: '2026-03-05T14:20:00',
      sessionEndTime: '2026-03-05T15:00:00',
      duration: 2400, // 40 minutes in seconds
      pagesViewed: [
        { page: '/manager/dashboard', timestamp: '2026-03-05T14:21:00' },
        { page: '/manager/transactions', timestamp: '2026-03-05T14:25:00' },
        { page: '/manager/disputes', timestamp: '2026-03-05T14:35:00' },
      ],
      actionsAttempted: [],
      sessionTriggerNote: 'User reported transaction processing issues',
    },
  ];

  return (
    <div className='space-y-4'>
      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Activity className='h-4 w-4 text-[hsl(var(--medical-teal))]' />
            Diagnostic Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {diagnosticSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onViewDetails={() => setSelectedSession(session)}
              />
            ))}
          </div>

          {diagnosticSessions.length === 0 && (
            <div className='p-12 text-center'>
              <Eye className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Diagnostic Sessions</h3>
              <p className='text-sm text-muted-foreground'>
                No admin diagnostic sessions have been recorded for this pharmacy.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      {selectedSession && (
        <SessionDetailDialog
          session={selectedSession}
          open={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}

interface SessionCardProps {
  session: any;
  onViewDetails: () => void;
}

function SessionCard({ session, onViewDetails }: SessionCardProps) {
  const durationMinutes = Math.floor(session.duration / 60);
  const durationSeconds = session.duration % 60;

  return (
    <Card className='border-2 border-border hover:border-[hsl(var(--medical-teal))]/40 transition-all duration-300'>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='p-2 rounded-lg bg-[hsl(var(--medical-teal))]/10'>
                <Activity className='h-4 w-4 text-[hsl(var(--medical-teal))]' />
              </div>
              <div>
                <h4 className='text-sm font-semibold'>Admin: {session.adminName}</h4>
                <p className='text-xs text-muted-foreground'>Viewing: {session.targetUserName}</p>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-3 mb-3'>
              <SessionStat
                icon={Clock}
                label='Duration'
                value={`${durationMinutes}m ${durationSeconds}s`}
              />
              <SessionStat icon={FileText} label='Pages' value={session.pagesViewed.length} />
              <SessionStat
                icon={AlertTriangle}
                label='Blocked Actions'
                value={session.actionsAttempted.length}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>Started:</span>
                <span className='font-medium'>
                  {new Date(session.sessionStartTime).toLocaleString()}
                </span>
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>Ended:</span>
                <span className='font-medium'>
                  {new Date(session.sessionEndTime).toLocaleString()}
                </span>
              </div>
              {session.sessionTriggerNote && (
                <div className='p-2 bg-muted/30 rounded-lg'>
                  <p className='text-xs font-medium text-muted-foreground'>Trigger:</p>
                  <p className='text-xs'>{session.sessionTriggerNote}</p>
                </div>
              )}
            </div>
          </div>

          <Button variant='outline' size='sm' onClick={onViewDetails}>
            <Eye className='h-4 w-4 mr-1' />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className='flex items-center gap-2'>
      <Icon className='h-3.5 w-3.5 text-muted-foreground' />
      <div>
        <p className='text-[11px] text-muted-foreground uppercase tracking-wide'>{label}</p>
        <p className='text-sm font-medium'>{value}</p>
      </div>
    </div>
  );
}

interface SessionDetailDialogProps {
  session: any;
  open: boolean;
  onClose: () => void;
}

function SessionDetailDialog({ session, open, onClose }: SessionDetailDialogProps) {
  const durationMinutes = Math.floor(session.duration / 60);
  const durationSeconds = session.duration % 60;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5 text-[hsl(var(--medical-teal))]' />
            Diagnostic Session Details
          </DialogTitle>
          <DialogDescription>
            Read-only diagnostic session details - admin was viewing as {session.targetUserName}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Session Summary */}
          <Card className='border-2 border-[hsl(var(--medical-teal))]/20'>
            <CardHeader>
              <CardTitle className='text-base font-semibold'>Session Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <SessionSummaryItem label='Admin' value={session.adminName} />
                <SessionSummaryItem label='Target User' value={session.targetUserName} />
                <SessionSummaryItem
                  label='Duration'
                  value={`${durationMinutes}m ${durationSeconds}s`}
                />
                <SessionSummaryItem label='Pages Viewed' value={session.pagesViewed.length} />
              </div>
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
              <div className='space-y-2'>
                {session.pagesViewed.map((pageView: any, idx: number) => (
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
            </CardContent>
          </Card>

          {/* Blocked Actions */}
          {session.actionsAttempted.length > 0 && (
            <Card className='border-2 border-red-200'>
              <CardHeader>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 text-red-600' />
                  Blocked Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {session.actionsAttempted.map((action: any, idx: number) => (
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

          {/* Session Notes */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base font-semibold'>Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='p-4 bg-muted/30 rounded-lg space-y-2'>
                <p className='text-xs text-muted-foreground'>Trigger Note:</p>
                <p className='text-sm'>{session.sessionTriggerNote}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
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
