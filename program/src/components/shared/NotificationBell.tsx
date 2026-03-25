import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Clock,
  Inbox,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  _id: string;
  _creationTime: number;
  type: 'info' | 'warning' | 'success' | 'error' | 'ai_escalation';
  title: string;
  message: string;
  read: boolean;
  readAt?: number;
  createdAt: number;
  referenceNumber?: string;
  priority?: 'low' | 'medium' | 'high';
  link?: string;
}

// Memoized notification icon
const NotificationIcon = React.memo(function NotificationIcon({
  type,
}: {
  type: Notification['type'];
}) {
  const iconClassName = 'h-4 w-4';

  switch (type) {
    case 'success':
      return <CheckCircle2 className={cn(iconClassName, 'text-emerald-600')} />;
    case 'warning':
      return <AlertCircle className={cn(iconClassName, 'text-amber-600')} />;
    case 'error':
      return <X className={cn(iconClassName, 'text-red-600')} />;
    case 'ai_escalation':
      return <AlertTriangle className={cn(iconClassName, 'text-purple-600')} />;
    default:
      return <Info className={cn(iconClassName, 'text-blue-600')} />;
  }
});

// Memoized notification item
const NotificationItem = React.memo(function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const itemRef = React.useRef<HTMLDivElement>(null);

  const handleMarkAsRead = React.useCallback(() => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  }, [notification._id, notification.read, onMarkAsRead]);

  return (
    <div
      ref={itemRef}
      className={cn(
        'p-4 transition-colors duration-200 cursor-pointer',
        'hover:bg-muted/50 border-b border-border last:border-b-0',
        !notification.read && 'bg-muted/30'
      )}
      onClick={handleMarkAsRead}
    >
      <div className='flex gap-3'>
        <div className='flex-shrink-0 mt-0.5'>
          <NotificationIcon type={notification.type} />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <p className='text-sm font-semibold text-foreground leading-tight'>
              {notification.title}
            </p>
            {!notification.read && (
              <div className='w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1' />
            )}
          </div>
          <p className='text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
            {notification.message}
          </p>
          {notification.referenceNumber && (
            <p className='text-xs text-muted-foreground mt-1'>
              Ref: {notification.referenceNumber}
            </p>
          )}
          <div className='flex items-center gap-1 mt-2'>
            <Clock className='h-3 w-3 text-muted-foreground/70' />
            <span className='text-xs text-muted-foreground/70'>
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Time formatter - extracted outside component to avoid recreation
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const NotificationBell = React.memo(function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const bellRef = React.useRef<HTMLButtonElement>(null);
  const { user } = useAuth();

  // Real-time Convex queries
  const notifications = useQuery(
    api.notifications.queries.getNotifications,
    user?._id ? undefined : 'skip'
  );
  const unreadCount = useQuery(
    api.notifications.queries.getUnreadCount,
    user?._id ? undefined : 'skip'
  );

  // Mutations
  const markAsReadMutation = useMutation(api.notifications.mutations.markAsRead);
  const markAllAsReadMutation = useMutation(api.notifications.mutations.markAllAsRead);

  // Memoized unread count from API
  const displayUnreadCount = React.useMemo(() => {
    return unreadCount || 0;
  }, [unreadCount]);

  // Memoized handlers
  const handleMarkAsRead = React.useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadMutation({ notificationId });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        toast.error('Failed to mark as read');
      }
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = React.useCallback(async () => {
    try {
      await markAllAsReadMutation();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, [markAllAsReadMutation]);

  // Bell animation on new notifications
  React.useEffect(() => {
    if (displayUnreadCount > 0 && bellRef.current && !isOpen) {
      gsap.fromTo(
        bellRef.current,
        { rotation: -15 },
        {
          rotation: 15,
          duration: 0.2,
          repeat: 3,
          yoyo: true,
          ease: 'power2.inOut',
        }
      );
    }
  }, [displayUnreadCount, isOpen]);

  // Play sound for high priority notifications (optional)
  React.useEffect(() => {
    const highPriorityNotification = notifications?.find(
      (n: Notification) => n.priority === 'high' && !n.read
    );

    if (highPriorityNotification && !isOpen) {
      // Optional: Play notification sound
      // const audio = new Audio('/notification-sound.mp3');
      // audio.play().catch(() => {});
    }
  }, [notifications, isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={bellRef}
          variant='ghost'
          size='icon'
          className='relative h-9 w-9 hover:bg-muted transition-colors'
        >
          <Bell className='h-[18px] w-[18px]' />
          {displayUnreadCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1.5 bg-foreground text-background text-[10px] font-bold border-2 border-background'>
              {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80 p-0 border-border'>
        <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30'>
          <DropdownMenuLabel className='font-semibold text-foreground p-0'>
            Notifications
          </DropdownMenuLabel>
          {displayUnreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleMarkAllAsRead}
              className='h-7 text-xs font-medium hover:text-foreground'
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className='h-[320px]'>
          {notifications && notifications.length > 0 ? (
            <div>
              {notifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3'>
                <Inbox className='h-5 w-5 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium text-foreground'>No notifications</p>
              <p className='text-xs text-muted-foreground mt-1'>You&apos;re all caught up!</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default NotificationBell;
