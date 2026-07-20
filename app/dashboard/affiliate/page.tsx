'use client';

import { Network, Copy, Gift, Users, IndianRupee, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { referralStats, referrals } from '@/lib/data/dashboard';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function AffiliatePage() {
  const { user } = useAuth();
  const slug = (user?.name || 'aarav-sharma').toLowerCase().replace(/\s+/g, '-');
  const link = `nextup.app/r/${slug}`;

  function copy() {
    navigator.clipboard?.writeText(link);
    toast.success('Referral link copied to clipboard.');
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <Network className="h-5 w-5" />
          </span>
          Affiliate
        </h1>
        <p className="mt-2 text-muted-foreground">Earn by referring friends and tracking your referrals.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {referralStats.map((s) => (
          <Card key={s.label} className="card-premium">
            <CardContent className="p-5">
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral link */}
      <Card className="card-premium mb-6">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Your referral link</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <span className="text-sm text-muted-foreground truncate">{link}</span>
              </div>
            </div>
            <Button onClick={copy} className="bg-brand-gradient font-semibold shrink-0">
              <Copy className="mr-2 h-4 w-4" /> Copy link
            </Button>
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Gift, title: 'Share your link', text: 'Send it to friends, post it, or embed it.' },
              { icon: Users, title: 'They sign up', text: 'Friends get a special discount to join.' },
              { icon: IndianRupee, title: 'You earn', text: 'Get up to ₹999 per paid referral.' },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-border p-4">
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.text}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Referrals table */}
      <Card className="card-premium overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Your referrals</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-semibold">Friend</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">You earned</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.email} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={r.status === 'Joined' ? 'default' : 'secondary'}>{r.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{r.date}, 2026</td>
                  <td className="px-6 py-4 text-right font-semibold">{r.earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <Button asChild variant="outline" className="font-semibold">
          <Link href="/affiliate">View public affiliate page <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </DashboardLayout>
  );
}
