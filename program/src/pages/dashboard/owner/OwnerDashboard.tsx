import * as React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  Users,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  ShieldAlert,
  Activity,
  Package,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OwnerInternalMessageDialog } from '@/components/shared/messaging/OwnerInternalMessageDialog';
import { cn } from '@/lib/utils';

export function OwnerDashboard() {
  const auth = useAuth();
  const [messageDialogOpen, setMessageDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'messaging' | 'appeals' | 'staff' | 'branches'
  >('overview');

  const pharmacy = useQuery(
    (api.admin as any).getPharmacyDetail,
    auth.pharmacyId ? { pharmacyId: auth.pharmacyId as any } : 'skip'
  );

  const pendingActions = useQuery(
    (api.owner as any).getPendingActions,
    activeTab === 'overview' ? {} : 'skip'
  );

  const messages = useQuery(
    (api.owner as any).getMyMessages,
    activeTab === 'messaging' ? {} : 'skip'
  );

  const handleSendMessage = () => {
    setMessageDialogOpen(true);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    change?: string;
    color?: string;
  }) => (
    <Card className='group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{label}</CardTitle>
        <Icon className={cn('h-5 w-5 transition-colors', color || 'text-muted-foreground')} />
      </CardHeader>
      <CardContent>
        <div className='text-3xl font-bold tracking-tight'>{value}</div>
        {change && (
          <p
            className={cn(
              'text-xs mt-1',
              change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {change} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold font-display tracking-tight'>
            Welcome, {auth.user?.full_name?.split(' ')[0]}
          </h1>
          <p className='text-muted-foreground mt-1'>
            {pharmacy?.pharmacy?.name || 'Your Pharmacy'}
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={handleSendMessage}
            className='bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
          >
            <Megaphone className='h-4 w-4 mr-2' />
            Send Message
          </Button>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {pendingActions && pendingActions.totalCount > 0 && (
        <Card className='border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-yellow-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-3'>
              <div className='flex-shrink-0'>
                <ShieldAlert className='h-6 w-6 text-orange-600' />
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-orange-900'>
                  {pendingActions.totalCount} Action{pendingActions.totalCount !== 1 ? 's' : ''}{' '}
                  Required
                </h3>
                <p className='text-sm text-orange-700 mt-1'>
                  {pendingActions.adminActions.length} admin action
                  {pendingActions.adminActions.length !== 1 ? 's' : ''},{' '}
                  {pendingActions.flaggedUsers.length} flagged user
                  {pendingActions.flaggedUsers.length !== 1 ? 's' : ''},{' '}
                  {pendingActions.lockedUsers.length} locked user
                  {pendingActions.lockedUsers.length !== 1 ? 's' : ''} need your attention.
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setActiveTab('appeals')}
                className='flex-shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100'
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className='flex gap-2 border-b border-border'>
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'messaging', label: 'Messaging', icon: MessageSquare, badge: messages?.length },
          { id: 'appeals', label: 'Appeals & Actions', icon: ShieldAlert },
          { id: 'staff', label: 'Staff', icon: Users },
          { id: 'branches', label: 'Branches', icon: Building2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className='h-4 w-4' />
            {tab.label}
            {tab.badge !== undefined && (
              <Badge variant={tab.badge > 0 ? 'default' : 'secondary'} className='ml-1'>
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* Stats Grid */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              icon={Package}
              label='Total Branches'
              value={pharmacy?.branches?.length || 0}
              color='text-blue-600'
            />
            <StatCard
              icon={Users}
              label='Total Staff'
              value={pharmacy?.staff?.length || 0}
              color='text-emerald-600'
            />
            <StatCard
              icon={Activity}
              label='Pending Actions'
              value={pendingActions?.totalCount || 0}
              color='text-orange-600'
            />
            <StatCard
              icon={TrendingUp}
              label='Messages Sent'
              value={messages?.length || 0}
              color='text-purple-600'
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-3 md:grid-cols-3'>
                <Button
                  variant='outline'
                  className='h-auto py-6 flex flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200'
                  onClick={handleSendMessage}
                >
                  <Megaphone className='h-8 w-8 text-emerald-600' />
                  <span className='font-medium'>Send Internal Message</span>
                  <span className='text-xs text-muted-foreground'>Communicate with staff</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-auto py-6 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-200'
                  onClick={() => setActiveTab('appeals')}
                >
                  <ShieldAlert className='h-8 w-8 text-orange-600' />
                  <span className='font-medium'>Review Actions</span>
                  <span className='text-xs text-muted-foreground'>Manage admin requests</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-auto py-6 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200'
                  onClick={() => setActiveTab('branches')}
                >
                  <Building2 className='h-8 w-8 text-blue-600' />
                  <span className='font-medium'>Manage Branches</span>
                  <span className='text-xs text-muted-foreground'>View and edit branches</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'messaging' && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {messages && messages.length > 0 ? (
              <div className='space-y-4'>
                {messages.map((message: any) => (
                  <div
                    key={message._id}
                    className='border border-border/40 rounded-lg p-4 hover:bg-secondary/30 transition-colors'
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className='font-semibold text-foreground'>{message.title}</h4>
                      <span className='text-xs text-muted-foreground'>
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground mb-3'>{message.message}</p>
                    <div className='flex items-center gap-2 text-xs'>
                      <Badge variant='outline'>To: {message.targetType || 'All Managers'}</Badge>
                      {message.isUrgent && <Badge variant='destructive'>Urgent</Badge>}
                      <Badge variant='secondary'>
                        Delivered:{' '}
                        {message.deliveryStatus?.filter((s: any) => s.delivered).length || 0}/
                        {message.deliveryStatus?.length || 0}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <MessageSquare className='h-12 w-12 mx-auto text-muted-foreground/50 mb-3' />
                <p className='text-muted-foreground'>No messages sent yet</p>
                <Button variant='outline' className='mt-4' onClick={handleSendMessage}>
                  Send Your First Message
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'appeals' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions & Appeals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingActions && pendingActions.totalCount > 0 ? (
              <div className='space-y-4'>
                {pendingActions.adminActions.map((action: any) => (
                  <div
                    key={action._id}
                    className='border border-border/40 rounded-lg p-4 hover:bg-secondary/30 transition-colors'
                  >
                    <div className='flex items-start gap-3'>
                      <ShieldAlert className='h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5' />
                      <div className='flex-1'>
                        <h4 className='font-semibold text-foreground mb-1'>
                          {action.actionType.replace(/_/g, ' ').toUpperCase()}
                        </h4>
                        <p className='text-sm text-muted-foreground mb-2'>{action.reason}</p>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span>{new Date(action.timestamp).toLocaleDateString()}</span>
                          {!action.actionStatus?.includes('resolved') && (
                            <Badge variant='destructive'>Action Required</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <ShieldAlert className='h-12 w-12 mx-auto text-muted-foreground/50 mb-3' />
                <p className='text-muted-foreground'>No pending admin actions</p>
                <p className='text-xs text-muted-foreground mt-1'>You're all caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'staff' && (
        <Card>
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-12'>
              <Users className='h-12 w-12 mx-auto text-muted-foreground/50 mb-3' />
              <p className='text-muted-foreground'>Staff management coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'branches' && (
        <Card>
          <CardHeader>
            <CardTitle>Branch Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-12'>
              <Building2 className='h-12 w-12 mx-auto text-muted-foreground/50 mb-3' />
              <p className='text-muted-foreground'>Branch management coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Dialog */}
      <OwnerInternalMessageDialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen} />
    </div>
  );
}
