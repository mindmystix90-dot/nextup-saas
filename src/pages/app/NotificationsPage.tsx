import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, EmptyState, Spinner, Button } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead,
} from '@/services/general.service';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = async () => {
    if (!user) return;
    try {
      const n = await fetchNotifications(user.id);
      setNotifications(n);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAll}>
            <CheckCheck className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications yet."
          description="Your notifications will appear here when there's activity on your account."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.read ? 'border-l-4 border-l-primary' : ''}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${n.type === 'success' ? 'bg-green-500/10' : n.type === 'error' ? 'bg-red-500/10' : n.type === 'info' ? 'bg-blue-500/10' : 'bg-secondary/50'}`}>
                  <Bell className={`h-4 w-4 ${n.type === 'success' ? 'text-green-600' : n.type === 'error' ? 'text-red-600' : n.type === 'info' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{n.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {!n.read && <Badge variant="warning">New</Badge>}
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-sm text-primary hover:underline">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
