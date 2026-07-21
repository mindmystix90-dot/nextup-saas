'use client';

import { useCallback, useEffect, useState } from 'react';
import { Wallet, Loader2, Check, X, IndianRupee, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import {
  fetchAllWithdrawals, adminProcessWithdrawal, fetchAllTransactions, formatINR,
} from '@/services/wallet.service';
import type { Withdrawal, WalletTransaction } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-blue-500/10 text-blue-500',
  paid: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function AdminWalletPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [wd, txns] = await Promise.all([fetchAllWithdrawals(), fetchAllTransactions()]);
      setWithdrawals(wd);
      setTransactions(txns);
    } catch { toast.error('Failed to load wallet data'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function process(id: string, action: 'approve' | 'reject' | 'mark_paid') {
    setProcessing(id);
    try {
      await adminProcessWithdrawal(id, action);
      toast.success(`Withdrawal ${action === 'mark_paid' ? 'marked paid' : action + 'd'}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process withdrawal');
    } finally { setProcessing(null); }
  }

  const pending = withdrawals.filter((w) => w.status === 'pending');
  const approved = withdrawals.filter((w) => w.status === 'approved');
  const paid = withdrawals.filter((w) => w.status === 'paid');
  const totalVolume = paid.reduce((s, w) => s + w.amount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Wallet & Withdrawals" subtitle="Review and process withdrawal requests." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending requests" value={String(pending.length)} color="text-warning" />
        <StatCard icon={Check} label="Approved" value={String(approved.length)} color="text-blue-500" />
        <StatCard icon={IndianRupee} label="Total paid out" value={`₹${formatINR(totalVolume)}`} color="text-success" />
        <StatCard icon={TrendingUp} label="Total transactions" value={String(transactions.length)} color="text-primary" />
      </div>

      <Card className="card-premium">
        <CardHeader><CardTitle className="text-lg">Withdrawal requests</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : withdrawals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No withdrawal requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Details</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{w.userName}</p>
                        <p className="text-xs text-muted-foreground">{w.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{formatINR(w.amount)}</td>
                      <td className="px-4 py-3 uppercase text-muted-foreground">{w.method}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {w.method === 'upi' ? w.upiId : `${w.bankName} · ****${w.accountNumber?.slice(-4)}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[w.status]}`}>{w.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {w.status === 'pending' && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10" disabled={processing === w.id} onClick={() => process(w.id, 'approve')}>
                              {processing === w.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" disabled={processing === w.id} onClick={() => process(w.id, 'reject')}>
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                        {w.status === 'approved' && (
                          <Button size="sm" className="bg-brand-gradient font-semibold" disabled={processing === w.id} onClick={() => process(w.id, 'mark_paid')}>
                            {processing === w.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <IndianRupee className="h-3.5 w-3.5" />} Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader><CardTitle className="text-lg">All transactions</CardTitle></CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">User ID</th>
                    <th className="px-4 py-3 font-semibold">Label</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 20).map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{t.uid.slice(0, 12)}…</td>
                      <td className="px-4 py-3">{t.label}</td>
                      <td className={`px-4 py-3 font-semibold ${t.amount >= 0 ? 'text-success' : 'text-foreground'}`}>{t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{t.type}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline">{t.status}</Badge></td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
