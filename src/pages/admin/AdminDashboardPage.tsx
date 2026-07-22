import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, IndianRupee, BookOpen, ShieldCheck, ArrowDownToLine, Users2, Activity,
} from 'lucide-react';
import { Card, StatCard, Spinner, EmptyState } from '@/components/ui';
import { formatCurrency, formatINR, timeAgo } from '@/lib/utils';
import {
  fetchAdminStats, fetchRevenueChartData, fetchUserGrowthData, fetchRecentActivity,
} from '@/services/admin.service';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [growth, setGrowth] = useState<{ month: string; users: number }[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, r, g, a] = await Promise.all([
          fetchAdminStats(), fetchRevenueChartData(), fetchUserGrowthData(), fetchRecentActivity(),
        ]);
        setStats(s); setRevenue(r); setGrowth(g); setActivity(a);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={formatINR(stats?.totalUsers ?? 0)} />
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} color="text-green-600" />
        <StatCard icon={BookOpen} label="Published Courses" value={stats?.totalCourses ?? 0} color="text-blue-600" />
        <StatCard icon={ShieldCheck} label="Pending KYC" value={stats?.pendingKyc ?? 0} color="text-orange-600" />
        <StatCard icon={ArrowDownToLine} label="Pending Withdrawals" value={formatCurrency(stats?.pendingWithdrawals ?? 0)} color="text-purple-600" />
        <StatCard icon={Users2} label="Pending Commission" value={formatCurrency(stats?.pendingCommission ?? 0)} color="text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-semibold font-display mb-4">Revenue</h2>
          {revenue.length === 0 ? (
            <EmptyState icon={IndianRupee} title="No revenue data" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold font-display mb-4">User Growth</h2>
          {growth.length === 0 ? (
            <EmptyState icon={Users} title="No user growth data" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold font-display mb-4">Recent Activity</h2>
        {activity.length === 0 ? (
          <EmptyState icon={Activity} title="No recent activity" />
        ) : (
          <div className="space-y-3">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.description || a.action}</p>
                  <p className="text-muted-foreground text-xs">
                    {a.profiles?.name || a.profiles?.email || 'System'} · {timeAgo(a.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
