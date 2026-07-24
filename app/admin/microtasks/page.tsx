'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Building2,
  FileCheck2,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Plus,
  RefreshCw,
  Users,
  BarChart3,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  fetchMicrotaskAnalytics,
  fetchProviders,
  subscribeProviders,
  syncTasksForProvider,
} from '@/services/microtasks.service';
import { formatINR } from '@/services/wallet.service';
import type { MicrotaskAnalytics, MicrotaskProvider } from '@/types';

export default function AdminMicrotasksPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<MicrotaskAnalytics | null>(null);
  const [providers, setProviders] = useState<MicrotaskProvider[]>([]);
  const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anData, pList] = await Promise.all([
        fetchMicrotaskAnalytics(),
        fetchProviders(),
      ]);
      setAnalytics(anData);
      setProviders(pList);
    } catch (err) {
      console.error('Failed to load admin microtask analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const anData = await fetchMicrotaskAnalytics();
        setAnalytics(anData);
      } catch (err) {
        console.error('Failed analytics fetch:', err);
      } finally {
        setLoading(false);
      }
    })();

    const unsubProviders = subscribeProviders((pList) => {
      setProviders(pList);
    });

    return () => unsubProviders();
  }, []);

  const handleSyncProvider = async (providerId: string) => {
    setSyncingProviderId(providerId);
    try {
      await syncTasksForProvider(providerId);
      await loadData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncingProviderId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                <CheckSquare className="mr-1 h-3.5 w-3.5" /> Provider Architecture
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Automated Margin Engine
              </Badge>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mt-1">Microtask & Offer Marketplace</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage third-party task providers, task sync, user proof approvals, and profit analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/microtasks/providers">
                <Building2 className="mr-2 h-4 w-4" /> Manage Providers ({providers.length})
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/microtasks/submissions">
                <FileCheck2 className="mr-2 h-4 w-4" /> Proof Approvals
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-brand-gradient font-semibold">
              <Link href="/admin/microtasks/tasks">
                <ListChecks className="mr-2 h-4 w-4" /> Tasks Directory
              </Link>
            </Button>
          </div>
        </div>

        {/* Analytics High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Active Tasks</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{analytics?.totalTasks || 0}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CheckSquare className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Platform Profit</p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{formatINR(analytics?.totalPlatformProfit || 0)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total User Payouts</p>
                <h3 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mt-1">
                  ₹{formatINR(analytics?.totalUserPayout || 0)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Approval Rate</p>
                <h3 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 mt-1">
                  {analytics?.approvalRatePercent || 100}%
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Shortcut Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="card-premium p-6 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <Badge variant="outline">{providers.length} Providers</Badge>
            </div>
            <h3 className="font-bold text-base">Task Providers</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Configure SproutGigs, TimeBucks, PicoWorkers, and custom provider API credentials & webhook secrets.
            </p>
            <Button asChild variant="outline" className="w-full text-xs font-semibold">
              <Link href="/admin/microtasks/providers">
                Manage Providers <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

          <Card className="card-premium p-6 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                {analytics?.pendingSubmissions || 0} Pending
              </Badge>
            </div>
            <h3 className="font-bold text-base">Proof Submissions</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Review user proof submissions, verify text/URLs/screenshots, approve wallet payouts or reject with notes.
            </p>
            <Button asChild variant="outline" className="w-full text-xs font-semibold">
              <Link href="/admin/microtasks/submissions">
                Review Submissions <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

          <Card className="card-premium p-6 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ListChecks className="h-5 w-5" />
              </div>
              <Badge variant="outline">{analytics?.totalTasks || 0} Tasks Cached</Badge>
            </div>
            <h3 className="font-bold text-base">Local Tasks Directory</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Inspect locally cached provider tasks, edit profit margins, pause offers, or manually trigger task sync.
            </p>
            <Button asChild variant="outline" className="w-full text-xs font-semibold">
              <Link href="/admin/microtasks/tasks">
                View Tasks <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>
        </div>

        {/* Active Providers Status Table */}
        <Card className="card-premium p-6">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Configured Microtask Providers</CardTitle>
              <CardDescription>
                Each provider syncs independently and applies custom profit margins before presenting tasks to users.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/microtasks/providers">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Provider
              </Link>
            </Button>
          </CardHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profit Margin</TableHead>
                <TableHead>Sync Interval</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.enabled ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Active & Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                    {p.profitMarginPercent}%
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Every {p.syncIntervalMinutes} mins
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.lastSyncAt ? new Date(p.lastSyncAt).toLocaleTimeString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSyncProvider(p.id)}
                      disabled={syncingProviderId === p.id}
                      className="text-xs"
                    >
                      <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncingProviderId === p.id ? 'animate-spin' : ''}`} />
                      Sync Tasks
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Top Earners Table */}
        {analytics?.topWorkers && analytics.topWorkers.length > 0 && (
          <Card className="card-premium p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Top Worker Leaderboard
              </CardTitle>
              <CardDescription>
                Users earning the most from completed microtask offers.
              </CardDescription>
            </CardHeader>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Tasks Completed</TableHead>
                  <TableHead className="text-right">Total Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topWorkers.map((worker, index) => (
                  <TableRow key={worker.uid}>
                    <TableCell className="font-semibold flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">#{index + 1}</span>
                      <span>{worker.name}</span>
                    </TableCell>
                    <TableCell>{worker.completed} offer(s)</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{formatINR(worker.totalEarned)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
