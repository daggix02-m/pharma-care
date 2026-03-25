import { Clock, MessageCircle, AlertCircle, FileText, ChevronDown, Send } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HistoryPageSectionProps {
  pharmacyId: string;
}

export function HistoryPageSection({ pharmacyId: _pharmacyId }: HistoryPageSectionProps) {
  const [appealDialog, setAppealDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedEvent, _setSelectedEvent] = useState<unknown>(null);

  const historyEvents = [
    {
      id: '1',
      type: 'lifecycle',
      title: 'Pharmacy Registration',
      date: '2026-01-15',
      description: 'Pharmacy registered and approved',
      status: 'completed',
      details: {
        registrationDate: '2026-01-15',
        approvedBy: 'System',
        approvalDate: '2026-01-16',
      },
    },
    {
      id: '2',
      type: 'admin_action',
      title: 'Branch Creation Approved',
      date: '2026-02-01',
      description: 'Admin approved new branch request',
      status: 'completed',
      details: {
        branchName: 'Main Branch',
        approvedBy: 'Admin',
        approvalDate: '2026-02-01',
      },
    },
    {
      id: '3',
      type: 'subscription',
      title: 'Subscription Upgraded',
      date: '2026-02-15',
      description: 'Upgraded from Basic to Premium plan',
      status: 'completed',
      details: {
        oldPlan: 'Basic',
        newPlan: 'Premium',
        effectiveDate: '2026-03-01',
      },
    },
    {
      id: '4',
      type: 'admin_action',
      title: 'Manager Flagged',
      date: '2026-03-01',
      description: 'Manager John Doe flagged for review',
      status: 'pending',
      details: {
        managerId: 'manager_123',
        flagReason: 'Suspicious activity detected',
        flaggedBy: 'Admin',
        ownerNotified: true,
      },
    },
    {
      id: '5',
      type: 'appeal',
      title: 'Owner Appeal - Branch Creation',
      date: '2026-03-05',
      description: 'Owner submitted appeal for branch creation',
      status: 'in_progress',
      details: {
        appealType: 'Branch Creation',
        appealDetails: 'Requesting additional branch due to business expansion',
        submittedBy: 'Owner',
        submittedDate: '2026-03-05',
      },
    },
  ];

  const typeConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    lifecycle: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    admin_action: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    subscription: { icon: FileText, color: 'text-green-600', bg: 'bg-green-500/10' },
    appeal: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-500/10' },
  };

  const statusConfig = {
    completed: { label: 'Completed', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'secondary' as const },
    in_progress: { label: 'In Progress', variant: 'outline' as const },
    rejected: { label: 'Rejected', variant: 'destructive' as const },
  };

  return (
    <div className='space-y-4'>
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Clock className='h-4 w-4 text-[hsl(var(--medical-teal))]' />
            History Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {historyEvents.map((event, idx) => (
              <HistoryEvent
                key={event.id}
                event={event}
                index={idx}
                config={typeConfig}
                statusConfig={statusConfig}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Appeal Dialog */}
      <Dialog open={appealDialog} onOpenChange={setAppealDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MessageCircle className='h-5 w-5 text-[hsl(var(--medical-teal))]' />
              Submit Appeal
            </DialogTitle>
            <DialogDescription>Submit an appeal for an admin action or decision</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label htmlFor='appeal-type'>Appeal Type</Label>
              <select
                id='appeal-type'
                className='w-full mt-2 px-3 py-2 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-[hsl(var(--medical-teal))] transition-colors'
              >
                <option>Admin Action</option>
                <option>Branch Rejection</option>
                <option>Subscription Issue</option>
                <option>Account Lock</option>
              </select>
            </div>
            <div>
              <Label htmlFor='appeal-details'>
                Appeal Details <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='appeal-details'
                placeholder='Describe the reason for your appeal...'
                rows={5}
                className='mt-2'
              />
            </div>
            <div>
              <Label htmlFor='appeal-attachment'>Attachment (Optional)</Label>
              <Input id='appeal-attachment' type='file' className='mt-2' />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAppealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAppealDialog(false)}>
              <Send className='h-4 w-4 mr-2' />
              Submit Appeal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface HistoryEventProps {
  event: any;
  index: number;
  config: Record<string, { icon: typeof Clock; color: string; bg: string }>;
  statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
  >;
}

function HistoryEvent({ event, index: _index, config, statusConfig }: HistoryEventProps) {
  const typeInfo = config[event.type] || config.lifecycle;
  const Icon = typeInfo.icon;
  const statusInfo = statusConfig[event.status] || statusConfig.completed;

  return (
    <div className='flex gap-4'>
      {/* Timeline Line */}
      <div className='w-0.5 bg-border ml-5 h-full min-h-[80px]' />

      {/* Event Card */}
      <div
        className={cn(
          'flex-1 p-4 rounded-lg border-2 transition-all duration-200',
          event.type === 'appeal'
            ? 'bg-purple-50/50 border-purple-200'
            : event.type === 'admin_action'
              ? 'bg-orange-50/50 border-orange-200'
              : event.type === 'subscription'
                ? 'bg-green-50/50 border-green-200'
                : 'bg-blue-50/50 border-blue-200'
        )}
      >
        <div className='flex items-start gap-3'>
          <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
            <Icon className={cn('h-4 w-4', typeInfo.color)} />
          </div>

          <div className='flex-1'>
            <div className='flex items-center justify-between mb-2'>
              <h4 className='text-sm font-semibold'>{event.title}</h4>
              <Badge variant={statusInfo.variant} className='text-xs'>
                {statusInfo.label}
              </Badge>
            </div>

            <p className='text-xs text-muted-foreground mb-2'>{event.description}</p>

            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span>{new Date(event.date).toLocaleDateString()}</span>
              {event.details.approvedBy && <span>• Approved by: {event.details.approvedBy}</span>}
              {event.details.ownerNotified && <span>• Owner notified</span>}
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className='mt-3 pt-3 border-t border-border/50'>
          <button className='text-xs text-[hsl(var(--medical-teal))] font-medium flex items-center gap-1 hover:underline'>
            View Details
            <ChevronDown className='h-3 w-3' />
          </button>
        </div>
      </div>
    </div>
  );
}
