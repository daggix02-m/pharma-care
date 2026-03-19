import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

export function Notifications() {
  const notificationsQuery = useQuery(api.manager.queries.getNotifications);
  const loading = notificationsQuery === undefined;
  const notifications = notificationsQuery || [];

  const markReadMutation = useMutation(api.manager.mutations.markNotificationRead);
  const deleteMutation = useMutation(api.manager.mutations.deleteNotification);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Total');

  const handleMarkAsRead = async (id) => {
    try {
      await markReadMutation({ id });
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length === 0) return;
      await Promise.all(unreadNotifications.map((n) => markReadMutation({ id: n._id })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteMutation({ id });
      toast.success('Notification dismissed');
    } catch (error) {
      toast.error('Failed to dismiss notification');
    }
  };

  const categories = [
    { name: 'All', icon: Bell, color: 'text-blue-600' },
    { name: 'Transactions', icon: DollarSign, color: 'text-green-600', type: 'transaction' },
    { name: 'Stock', icon: Package, color: 'text-orange-600', type: 'stock' },
    { name: 'Staff', icon: Users, color: 'text-purple-600', type: 'staff' },
    { name: 'System', icon: AlertTriangle, color: 'text-red-600', type: 'system' },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter((n) => n.priority === 'high' && !n.read).length;
  const todayCount = notifications.filter((n) => {
      const d = new Date(n._creationTime);
      return d.toDateString() === new Date().toDateString();
  }).length;

  const stats = [
    { title: 'Unread', value: unreadCount, icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'High Priority', value: highPriorityCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Today', value: todayCount, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Total', value: notifications.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          notification.type === categories.find((c) => c.name === selectedCategory)?.type;
    
        const title = (notification.title || '').toLowerCase();
        const desc = (notification.message || '').toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    
        let matchesStatFilter = true;
        if (activeFilter === 'Unread') {
          matchesStatFilter = !notification.read;
        } else if (activeFilter === 'High Priority') {
          matchesStatFilter = notification.priority === 'high' && !notification.read;
        } else if (activeFilter === 'Today') {
          const d = new Date(notification._creationTime);
          matchesStatFilter = d.toDateString() === new Date().toDateString();
        }
    
        return matchesCategory && matchesSearch && matchesStatFilter;
      });
  }, [notifications, selectedCategory, searchTerm, activeFilter]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'transaction': return DollarSign;
      case 'stock': return Package;
      case 'staff': return Users;
      case 'system': return AlertTriangle;
      default: return Bell;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-orange-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground mt-1">Stay updated with pharmacy activities and alerts</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle className="mr-2 h-4 w-4" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
          ))
        ) : (
          stats.map((stat, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === stat.title ? 'ring-2 ring-primary shadow-md' : ''}`}
              onClick={() => setActiveFilter(stat.title)}
            >
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
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search notifications..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  size="sm"
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center gap-1.5"
                >
                  <category.icon className="h-3.5 w-3.5" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <Card key={i}><CardContent className="p-4 flex items-start gap-4"><Skeleton className="h-10 w-10 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-full" /></div></CardContent></Card>)
        ) : filteredNotifications.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No notifications found</CardContent></Card>
        ) : (
          filteredNotifications.map((n) => {
            const Icon = getNotificationIcon(n.type);
            return (
              <Card key={n._id} className={`${getPriorityStyles(n.priority)} ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg shrink-0 ${n.read ? 'bg-muted' : 'bg-blue-100 dark:bg-blue-900'}`}>
                      <Icon className={`h-5 w-5 ${n.read ? 'text-muted-foreground' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-semibold text-sm ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <Clock className="h-3 w-3 text-muted-foreground" />
                             <span className="text-xs text-muted-foreground">{new Date(n._creationTime).toLocaleString()}</span>
                             {!n.read && <Badge className="bg-blue-100 text-blue-700 text-xs">New</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!n.read && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleMarkAsRead(n._id)}><CheckCircle className="h-4 w-4" /></Button>}
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteNotification(n._id)}><X className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
