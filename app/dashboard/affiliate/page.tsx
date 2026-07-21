'use client';

import { useEffect, useState } from 'react';
import { Network, MousePointerClick, UserPlus, ShoppingBag, Clock, IndianRupee, Loader2, Copy, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { fetchAffiliateStats, fetchReferrals } from '@/services/affiliate.service';
import type { AffiliateStats, Referral } from '@/types';

export default function AffiliatePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [s, r] = await Promise.all([fetchAffiliateStats(user.uid), fetchReferrals(user.uid)]);
        setStats(s); setReferrals(r);
      } catch { /* best-effort */ } finally { setLoading(false); }
    })();
  }, [user?.uid]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const referralLink = typeof window !== 'undefined' && stats ? `${window.location.origin}/register?ref=${stats.referralCode}` : '';

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied');
  }

  function copyCode() {
    if (!stats?.referralCode) return;
    navigator.clipboard.writeText(stats.referralCode);
    toast.success('Referral code copied');
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary"><Network className="h-5 w-5" /></span>
          Affiliate Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">Share your link and earn commission on every referral.</p>
      </div>

      {/* Referral link card */}
      <Card className="card-premium mb-6 overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <p className="text-xs text-slate-400 mb-2">Your referral link</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-mono text-sm truncate">{referralLink || 'Loading...'}</div>
            <Button onClick={copyLink} className="bg-brand-gradient font-semibold"><Copy className="mr-2 h-4 w-4" /> Copy link</Button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-slate-400">Code:</span>
            <button onClick={copyCode} className="font-mono text-sm font-semibold text-white hover:text-primary transition-colors">
              {stats?.referralCode || '...'}
            </button>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={MousePointerClick} label="Clicks" value={String(stats?.clicks ?? 0)} color="text-blue-500" />
        <StatCard icon={UserPlus} label="Registrations" value={String(stats?.registrations ?? 0)} color="text-success" />
        <StatCard icon={ShoppingBag} label="Sales" value={String(stats?.sales ?? 0)} color="text-primary" />
        <StatCard icon={IndianRupee} label="Available balance" value={`₹${stats?.availableBalance ?? 0}`} color="text-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <StatCard icon={Clock} label="Pending commission" value={`₹${stats?.pendingCommission ?? 0}`} color="text-warning" />
        <StatCard icon={IndianRupee} label="Paid commission" value={`₹${stats?.paidCommission ?? 0}`} color="text-success" />
      </div>

      {/* Referrals table */}
      <Card className="card-premium">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3"><Users className="h-6 w-6" /></span>
              <p className="text-sm font-semibold">No referrals yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Share your link to start earning commission.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Commission</th>
                    <th className="px-4 py-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{r.referredName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.referredEmail}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{r.status}</Badge></td>
                      <td className="px-4 py-3 font-semibold">₹{r.commission}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Network; label: string; value: string; color: string }) {
  return (
    <Card className="card-premium">
      <CardContent className="p-5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${color}`}><Icon className="h-5 w-5" /></span>
        <p className="mt-3 font-display text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
