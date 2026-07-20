'use client';

import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, PiggyBank, CreditCard, TrendingUp, Clock, IndianRupee } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  walletBalance,
  lifetimeEarnings,
  pendingPayouts,
  totalWithdrawn,
  walletTransactions,
  withdrawalHistory,
  paymentMethods,
} from '@/lib/data/wallet';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-success/10 text-success',
  Pending: 'bg-warning/10 text-warning',
  Rejected: 'bg-destructive/10 text-destructive',
};

export default function WalletPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <Wallet className="h-5 w-5" />
          </span>
          Wallet
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your balance, transactions, and payouts.</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="card-premium">
          <CardContent className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{walletBalance}</p>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{lifetimeEarnings}</p>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Clock className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{pendingPayouts}</p>
            <p className="text-xs text-muted-foreground">Pending payouts</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <IndianRupee className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{totalWithdrawn}</p>
            <p className="text-xs text-muted-foreground">Total withdrawn</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance card */}
        <Card className="card-premium overflow-hidden">
          <div className="bg-brand-gradient p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Wallet className="h-5 w-5" />
              </span>
              <CreditCard className="h-6 w-6 text-white/60" />
            </div>
            <p className="mt-6 text-sm text-white/80">Available balance</p>
            <p className="mt-1 font-display text-4xl font-bold">{walletBalance}</p>
            <p className="mt-2 text-xs text-white/70">Total earnings: {lifetimeEarnings}</p>
          </div>
          <CardContent className="p-5 space-y-3">
            <Button className="w-full bg-brand-gradient font-semibold" onClick={() => toast.success('Opening add funds…')}>
              <Plus className="mr-2 h-4 w-4" /> Add funds
            </Button>
            <Button variant="outline" className="w-full font-semibold opacity-60 cursor-not-allowed" disabled>
              <PiggyBank className="mr-2 h-4 w-4" /> Withdraw · Coming Soon
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-1">Withdrawals are disabled in the demo.</p>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Recent transactions</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {walletTransactions.map((t) => (
              <div key={t.label + t.date} className="flex items-center gap-4 rounded-xl border border-border p-3.5 hover:bg-secondary/40 transition-colors">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.type === 'in' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {t.type === 'in' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'in' ? 'text-success' : 'text-foreground'}`}>{t.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal history */}
      <Card className="card-premium mt-6 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" /> Withdrawal history
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-semibold">Request ID</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawalHistory.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{w.id}</td>
                  <td className="px-6 py-4 font-semibold">{w.amount}</td>
                  <td className="px-6 py-4 text-muted-foreground">{w.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[w.status]}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">{w.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment methods */}
      <Card className="card-premium mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Payment methods</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {paymentMethods.map((m) => (
            <div key={m.brand + m.last4} className="flex items-center gap-4 rounded-2xl border border-border p-4">
              <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-950 text-white text-[10px] font-bold">
                {m.brand}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">•••• {m.last4}</p>
                <p className="text-xs text-muted-foreground">{m.type} · Expires {m.exp}</p>
              </div>
              <Badge variant="secondary">Default</Badge>
            </div>
          ))}
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
            <Plus className="h-4 w-4" /> Add payment method
          </button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
