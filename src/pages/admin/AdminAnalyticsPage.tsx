import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, IndianRupee, Users, Wallet, ArrowDownToLine, BookOpen, ShieldCheck } from 'lucide-react';
import { Card, StatCard, Spinner, EmptyState } from '@/components/ui';
import { formatCurrency, formatINR } from '@/lib/utils';
import {
  fetchAdminStats, fetchRevenueChartData, fetchUserGrowthData,
} from '@/services/admin.service';

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [growth, setGrowth] = useState<{ month: string; users: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, r, g] = await Promise.all([
          fetchAdminStats(), fetchRevenueChartData(), fetchUserGrowthData(),
        ]);
        setStats(s); setRevenue(r); setGrowth(g);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Spinner />;

  const pieData = [
    { name: 'Wallet Balance', value: stats?.totalWalletBalance ?? 0 },
    { name: 'Lifetime Earnings', value: stats?.totalLifetimeEarnings ?? 0 },
    { name: 'Pending Withdrawals', value: stats?.pendingWithdrawals ?? 0 },
    { name: 'Completed Withdrawals', value: stats?.completedWithdrawals ?? 0 },
    { name: 'Pending Commission', value: stats?.pendingCommission ?? 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed platform insights.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={formatINR(stats?.totalUsers ?? 0)} />
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} color="text-green-600" />
        <StatCard icon={BookOpen} label="Courses" value={stats?.totalCourses ?? 0} color="text-blue-600" />
        <StatCard icon={Wallet} label="Wallet Balance" value={formatCurrency(stats?.totalWalletBalance ?? 0)} color="text-purple-600" />
        <StatCard icon={ArrowDownToLine} label="Pending Withdrawals" value={formatCurrency(stats?.pendingWithdrawals ?? 0)} color="text-orange-600" />
        <StatCard icon={ArrowDownToLine} label="Completed Withdrawals" value={formatCurrency(stats?.completedWithdrawals ?? 0)} color="text-green-600" />
        <StatCard icon={ShieldCheck} label="Pending KYC" value={stats?.pendingKyc ?? 0} color="text-yellow-600" />
        <StatCard icon={BarChart3} label="Pending Commission" value={formatCurrency(stats?.pendingCommission ?? 0)} color="text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-semibold font-display mb-4">Revenue Trend</h2>
          {revenue.length === 0 ? (
            <EmptyState icon={IndianRupee} title="No revenue data" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
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
            <EmptyState icon={Users} title="No growth data" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold font-display mb-4">Financial Breakdown</h2>
        {pieData.length === 0 ? (
          <EmptyState icon={BarChart3} title="No financial data" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e) => e.name}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
