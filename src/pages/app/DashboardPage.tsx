import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Wallet, BookOpen, Award, TrendingUp, Activity, Bell, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, StatCard, EmptyState, Spinner, Badge } from '@/components/ui';
import { formatCurrency, timeAgo } from '@/lib/utils';
import {
  fetchWallet, fetchTransactions,
} from '@/services/wallet.service';
import {
  fetchCourseAccess,
} from '@/services/courses.service';
import { fetchAffiliateStats } from '@/services/affiliate.service';
import {
  fetchNotifications, fetchActivityLog,
} from '@/services/general.service';
import type { Wallet as WalletT, Notification, ActivityLog, CourseAccess, AffiliateStats } from '@/types';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletT | null>(null);
  const [access, setAccess] = useState<CourseAccess[]>([]);
  const [affiliate, setAffiliate] = useState<AffiliateStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [certCount, setCertCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const [w, a, aff, notifs, logs] = await Promise.all([
          fetchWallet(user.id),
          fetchCourseAccess(user.id),
          fetchAffiliateStats(user.id),
          fetchNotifications(user.id),
          fetchActivityLog(user.id),
        ]);
        if (!active) return;
        setWallet(w);
        setAccess(a);
        setAffiliate(aff);
        setNotifications(notifs.slice(0, 5));
        setActivity(logs.slice(0, 5));
        // certificate count
        const { count } = await import('@/lib/supabase').then(({ supabase }) =>
          supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        );
        if (active) setCertCount(count ?? 0);
      } catch (e) {
        toast.error('Failed to load dashboard data');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  if (loading) return <Spinner />;
  if (!user) return null;

  const balance = wallet?.balance ?? 0;
  const affiliateEarnings = (affiliate?.paid_commission ?? 0) + (affiliate?.pending_commission ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">
          Welcome back, {profile?.name?.split(' ')[0] ?? 'there'}!
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your account.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Wallet Balance" value={formatCurrency(balance)} color="text-green-600" />
        <StatCard icon={BookOpen} label="Courses Enrolled" value={access.length} color="text-blue-600" />
        <StatCard icon={Award} label="Certificates" value={certCount} color="text-purple-600" />
        <StatCard icon={TrendingUp} label="Affiliate Earnings" value={formatCurrency(affiliateEarnings)} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display flex items-center gap-2">
              <Activity className="h-5 w-5" /> Recent Activity
            </h2>
            <Link to="/app/courses" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {activity.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet" description="Your recent actions will appear here." />
          ) : (
            <div className="space-y-3">
              {activity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.description}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display flex items-center gap-2">
              <Bell className="h-5 w-5" /> Recent Notifications
            </h2>
            <Link to="/app/notifications" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {!n.read && <Badge variant="warning">New</Badge>}
                      <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold font-display">Continue Learning</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick up where you left off.</p>
          </div>
          <Link to="/app/courses" className="btn-outline inline-flex items-center gap-2">
            Browse Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
