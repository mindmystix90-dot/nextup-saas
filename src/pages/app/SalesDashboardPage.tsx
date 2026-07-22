import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target, Phone, TrendingUp, CheckCircle, XCircle, Clock, IndianRupee, Wallet, Award,
} from 'lucide-react';
import { Card, StatCard, Badge, EmptyState, Spinner } from '@/components/ui';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { fetchSalesDashboardStats } from '@/services/sales.service';
import { fetchWallet } from '@/services/wallet.service';

export default function SalesDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchSalesDashboardStats>> | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [s, w] = await Promise.all([
          fetchSalesDashboardStats(user.id),
          fetchWallet(user.id),
        ]);
        setStats(s);
        setBalance(w?.balance ?? 0);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Sales Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your sales performance at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Target} label="Today's Leads" value={stats?.todayLeads ?? 0} color="text-blue-600" />
        <StatCard icon={Target} label="Assigned Leads" value={stats?.totalLeads ?? 0} color="text-indigo-600" />
        <StatCard icon={Phone} label="Today's Calls" value={stats?.todayCalls ?? 0} color="text-purple-600" />
        <StatCard icon={Clock} label="Follow Ups" value={stats?.followUps ?? 0} color="text-orange-600" />
        <StatCard icon={CheckCircle} label="Closed Sales" value={stats?.closedSales ?? 0} color="text-green-600" />
        <StatCard icon={XCircle} label="Rejected Leads" value={stats?.rejectedLeads ?? 0} color="text-red-600" />
        <StatCard icon={IndianRupee} label="Weekly Earnings" value={formatCurrency(stats?.weeklyEarnings ?? 0)} color="text-green-600" />
        <StatCard icon={Wallet} label="Wallet Balance" value={formatCurrency(balance)} color="text-purple-600" />
        <StatCard icon={Award} label="Performance Score" value={`${stats?.performanceScore ?? 0}%`} color="text-brand-600" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold font-display">Recent Leads</h2>
          <Link to="/app/sales/leads" className="text-sm text-brand-600 hover:underline">View all →</Link>
        </div>
        {(!stats?.recentLeads || stats.recentLeads.length === 0) ? (
          <EmptyState icon={Target} title="No leads yet" description="Leads assigned to you will appear here." />
        ) : (
          <div className="space-y-2">
            {stats.recentLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.email || l.phone} · {timeAgo(l.created_at)}</p>
                </div>
                <Badge variant={l.status === 'closed' ? 'success' : l.status === 'rejected' ? 'danger' : l.status === 'follow_up' ? 'warning' : 'secondary'}>
                  {l.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
