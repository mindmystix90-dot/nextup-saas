'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Wallet, BookOpen, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Skeleton } from '@/components/ui/skeletons';
import { fetchDashboardStats, type DashboardStats } from '@/services/admin.service';

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDashboardStats();
        if (!cancelled) setStats(data);
      } catch {
        // keep null
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const kpis = [
    { label: 'Total Users', value: stats?.users ?? 0, icon: Users, isCurrency: false },
    { label: 'Revenue', value: stats?.revenue ?? 0, icon: Wallet, isCurrency: true },
    { label: 'Courses', value: stats?.courses ?? 0, icon: BookOpen, isCurrency: false },
    { label: 'Certificates', value: stats?.certificates ?? 0, icon: Award, isCurrency: false },
  ];

  const hasData = stats && (stats.users > 0 || stats.revenue > 0 || stats.courses > 0 || stats.certificates > 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={BarChart3}
        title="Analytics"
        subtitle="Revenue, user growth and engagement trends."
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((s) => {
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
                  <p className="mt-4 font-display text-2xl font-bold">
                    {s.isCurrency ? `₹${formatINR(s.value)}` : formatINR(s.value)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts area — empty state when no data */}
      {!loading && !hasData ? (
        <Card className="card-premium">
          <CardContent className="py-16 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-40" />
            <h2 className="mt-4 font-display text-lg font-semibold">No analytics data yet</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Charts will appear here once users start signing up, courses are published, and payments are processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="card-premium">
            <CardHeader><CardTitle className="text-lg">Revenue &amp; user growth</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Wallet className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">Revenue trend will appear here once payment data is available.</p>
                  <p className="mt-1 text-xs">Current revenue: ₹{formatINR(stats?.revenue ?? 0)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader><CardTitle className="text-lg">Plan distribution</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Users className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">Plan distribution chart will appear here once users sign up.</p>
                  <p className="mt-1 text-xs">Current users: {formatINR(stats?.users ?? 0)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
