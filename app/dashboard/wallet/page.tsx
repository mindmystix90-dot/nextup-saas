'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, Clock, IndianRupee, Loader2, PiggyBank, CheckCircle2, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import {
  fetchWallet, fetchTransactions, fetchWithdrawals, requestWithdrawal, fetchKyc, formatINR,
} from '@/services/wallet.service';
import type { WalletData, WalletTransaction, Withdrawal, KycInfo, WithdrawalMethod } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-blue-500/10 text-blue-500',
  paid: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function WalletPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [kyc, setKyc] = useState<KycInfo | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawalMethod>('upi');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [w, txns, wd, k] = await Promise.all([
          fetchWallet(user.uid),
          fetchTransactions(user.uid),
          fetchWithdrawals(user.uid),
          fetchKyc(user.uid),
        ]);
        setWallet(w);
        setTransactions(txns);
        setWithdrawals(wd);
        setKyc(k);
      } catch { /* best-effort */ } finally { setLoading(false); }
    })();
  }, [user?.uid]);

  async function handleWithdraw() {
    if (!user || !kyc) return;
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await requestWithdrawal(user.uid, user.name, user.email, amount, withdrawMethod, kyc);
      toast.success('Withdrawal request submitted');
      setShowWithdraw(false);
      setWithdrawAmount('');
      const [w, txns, wd] = await Promise.all([
        fetchWallet(user.uid), fetchTransactions(user.uid), fetchWithdrawals(user.uid),
      ]);
      setWallet(w); setTransactions(txns); setWithdrawals(wd);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to request withdrawal');
    } finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const balance = wallet?.balance ?? 0;
  const lifetime = wallet?.lifetimeEarnings ?? 0;
  const pending = wallet?.pendingWithdrawals ?? 0;
  const completed = wallet?.completedWithdrawals ?? 0;
  const todayTxns = transactions.filter((t) => isToday(t.date));
  const todayEarnings = todayTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const last7 = transactions.filter((t) => withinDays(t.date, 7)).filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const last28 = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const kycVerified = kyc?.status === 'verified';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary"><Wallet className="h-5 w-5" /></span>
          Wallet
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your balance, transactions, and withdrawals.</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Available balance" value={`₹${formatINR(balance)}`} color="text-primary" />
        <StatCard icon={TrendingUp} label="Today's earnings" value={`₹${formatINR(todayEarnings)}`} color="text-success" />
        <StatCard icon={Clock} label="Last 7 days" value={`₹${formatINR(last7)}`} color="text-blue-500" />
        <StatCard icon={IndianRupee} label="Lifetime earnings" value={`₹${formatINR(lifetime)}`} color="text-violet-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance card */}
        <Card className="card-premium overflow-hidden">
          <div className="bg-slate-950 p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient"><Wallet className="h-5 w-5 text-white" /></span>
              <span className="text-xs text-slate-400">Available</span>
            </div>
            <p className="mt-6 font-display text-4xl font-bold">₹{formatINR(balance)}</p>
            <p className="mt-2 text-xs text-slate-400">Lifetime: ₹{formatINR(lifetime)}</p>
          </div>
          <CardContent className="p-5 space-y-3">
            <Button className="w-full bg-brand-gradient font-semibold" onClick={() => {
              if (!kycVerified) { toast.error('Complete KYC to withdraw'); return; }
              setShowWithdraw(true);
            }}>
              <PiggyBank className="mr-2 h-4 w-4" /> Request Withdrawal
            </Button>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="text-xs text-muted-foreground">KYC Status</span>
              {kycVerified ? (
                <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>
              ) : kyc?.status === 'pending' ? (
                <Badge className="bg-warning/10 text-warning"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
              ) : kyc?.status === 'rejected' ? (
                <Badge className="bg-destructive/10 text-destructive"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>
              ) : (
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <a href="/dashboard/kyc">Complete KYC</a>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-display text-sm font-bold">₹{formatINR(pending)}</p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="font-display text-sm font-bold">₹{formatINR(completed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="pb-4"><CardTitle className="text-lg">Recent transactions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3"><Wallet className="h-6 w-6" /></span>
                <p className="text-sm font-semibold">No transactions yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Your transaction history will appear here.</p>
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border p-3.5 hover:bg-secondary/40 transition-colors">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.amount >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {t.amount >= 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.amount >= 0 ? 'text-success' : 'text-foreground'}`}>
                    {t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal history */}
      <Card className="card-premium mt-6 overflow-hidden">
        <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary" /> Withdrawal history</CardTitle></CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3"><PiggyBank className="h-6 w-6" /></span>
              <p className="text-sm font-semibold">No withdrawals yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Your withdrawal requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Request ID</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{w.id.slice(0, 12)}</td>
                      <td className="px-4 py-3 font-semibold">₹{formatINR(w.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground uppercase">{w.method}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[w.status]}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request withdrawal</DialogTitle>
            <DialogDescription>Available balance: ₹{formatINR(balance)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={withdrawMethod} onValueChange={(v) => setWithdrawMethod(v as WithdrawalMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {kyc && (
              <div className="rounded-xl border border-border p-3 text-xs text-muted-foreground space-y-1">
                <p><span className="font-semibold text-foreground">Account holder:</span> {kyc.accountHolder}</p>
                <p><span className="font-semibold text-foreground">Bank:</span> {kyc.bankName}</p>
                {withdrawMethod === 'upi' && kyc.upiId && <p><span className="font-semibold text-foreground">UPI:</span> {kyc.upiId}</p>}
                {withdrawMethod === 'bank' && <p><span className="font-semibold text-foreground">A/C:</span> ****{kyc.accountNumber.slice(-4)} · IFSC: {kyc.ifsc}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
            <Button onClick={handleWithdraw} disabled={submitting} className="bg-brand-gradient font-semibold">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string; color: string }) {
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

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function withinDays(dateStr: string, days: number): boolean {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}
