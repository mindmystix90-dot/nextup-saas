'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Users, BookOpen, Award, Wallet, Network, Activity, ArrowUpRight, MessageSquare, Video, LifeBuoy, Handshake, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Skeleton } from '@/components/ui/skeletons';
import { fetchDashboardStats, fetchRecentSignups, fetchRecentPayments, type DashboardStats, type RecentSignup, type PaymentRow } from '@/services/admin.service';
import { membershipLabel } from '@/lib/utils';

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [signups, setSignups] = useState<RecentSignup[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, r, p] = await Promise.all([fetchDashboardStats(), fetchRecentSignups(5), fetchRecentPayments(5)]);
        if (cancelled) return;
        setStats(s);
        setSignups(r);
        setPayments(p);
      } catch {
        // keep nulls — will show zeros
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: stats?.totalRevenue ?? 0, icon: Wallet, suffix: '', isCurrency: true },
    { label: 'Monthly Revenue', value: stats?.monthlyRevenue ?? 0, icon: TrendingUp, suffix: '', isCurrency: true },
    { label: 'Total Users', value: stats?.users ?? 0, icon: Users, suffix: '' },
    { label: 'Active Users', value: stats?.activeUsers ?? 0, icon: Users, suffix: '' },
    { label: 'New Users', value: stats?.newUsers ?? 0, icon: Users, suffix: '' },
    { label: 'Course Sales', value: stats?.courseSales ?? 0, icon: BookOpen, suffix: '', isCurrency: true },
    { label: 'Affiliate Sales', value: stats?.affiliateSales ?? 0, icon: Network, suffix: '', isCurrency: true },
    { label: 'Pending Payouts', value: stats?.pendingPayouts ?? 0, icon: Wallet, suffix: '', isCurrency: true },
    { label: 'Sales Partner Revenue', value: stats?.salesPartnerRevenue ?? 0, icon: Handshake, suffix: '', isCurrency: true },
    { label: 'Active Courses', value: stats?.courses ?? 0, icon: BookOpen, suffix: '' },
    { label: 'Community Posts', value: stats?.communityPosts ?? 0, icon: MessageSquare, suffix: '' },
    { label: 'Live Classes', value: stats?.liveClasses ?? 0, icon: Video, suffix: '' },
    { label: 'Support Tickets', value: stats?.supportTickets ?? 0, icon: LifeBuoy, suffix: '' },
    { label: 'Certificates', value: stats?.certificates ?? 0, icon: Award, suffix: '' },
  ];

  function formatDate(iso: string): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); } catch { return '—'; }
  }

  function initials(name: string): string {
    return (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ShieldCheck}
        title="Admin overview"
        subtitle="Platform metrics, activity and growth at a glance."
        actions={
          <>
            <Button asChild variant="outline" size="sm"><a href="/admin/reports">Export report</a></Button>
            <Button asChild size="sm" className="bg-brand-gradient font-semibold"><a href="/admin/analytics">View analytics</a></Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="card-premium">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                {loading ? (
                  <Skeleton className="mt-4 h-7 w-20" />
                ) : (
                  <p className="mt-4 font-display text-2xl font-bold tracking-tight">
                    {s.isCurrency ? `₹${formatINR(s.value)}` : `${formatINR(s.value)}${s.suffix}`}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>



      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Reporting snapshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 md:grid-cols-5">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-5">
              {[
                ['Revenue', stats?.totalRevenue ?? 0, true],
                ['User Growth', stats?.newUsers ?? 0, false],
                ['Course Sales', stats?.courseSales ?? 0, true],
                ['Affiliate Performance', stats?.affiliateSales ?? 0, true],
                ['Sales Performance', stats?.salesPartnerRevenue ?? 0, true],
              ].map(([label, value, currency]) => (
                <div key={String(label)} className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-2 font-display text-xl font-bold">{currency ? `₹${formatINR(Number(value))}` : formatINR(Number(value))}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent signups + Recent payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Recent signups
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/users">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : signups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No signups yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signups.map((u) => (
                      <tr key={u.uid} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {u.photoURL && <AvatarImage src={u.photoURL} alt={u.name} />}
                              <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">{initials(u.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{u.name || 'Unnamed'}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{membershipLabel(u.membership)}</Badge></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.suspended ? 'text-destructive' : 'text-success'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.suspended ? 'bg-destructive' : 'bg-success'}`} />
                            {u.suspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Recent payments
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/payments">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No payments yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{p.user}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(p.date)}</p>
                        </td>
                        <td className="px-4 py-3"><Badge variant="secondary">{p.plan}</Badge></td>
                        <td className="px-4 py-3 font-semibold text-success">{p.amount}</td>
                        <td className="px-4 py-3"><Badge variant={p.status === 'Completed' ? 'default' : p.status === 'Pending' ? 'secondary' : 'destructive'}>{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : signups.length === 0 && payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {signups.slice(0, 3).map((u) => (
                <div key={`s-${u.uid}`} className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-foreground">New signup: {u.name || u.email}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                  </div>
                </div>
              ))}
              {payments.slice(0, 3).map((p) => (
                <div key={`p-${p.id}`} className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-success">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-foreground">Payment: {p.amount} from {p.user}</p>
                    <p className="text-xs text-muted-foreground">{p.status} · {formatDate(p.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
