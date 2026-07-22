import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TrendingUp, IndianRupee, Wallet, Award, History } from 'lucide-react';
import { Card, StatCard, Badge, EmptyState, Spinner } from '@/components/ui';
import { formatCurrency, formatDate, getWeekStart } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { fetchSalesRecords } from '@/services/sales.service';
import { fetchWallet, fetchTransactions } from '@/services/wallet.service';
import type { SalesRecord, Transaction, Wallet as WalletT } from '@/types';

export default function SalesEarningsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [wallet, setWallet] = useState<WalletT | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [s, w, t] = await Promise.all([
          fetchSalesRecords(user.id),
          fetchWallet(user.id),
          fetchTransactions(user.id),
        ]);
        setSales(s); setWallet(w); setTxns(t);
      } catch { toast.error('Failed to load earnings'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <Spinner />;

  const weekStart = getWeekStart();
  const weeklySales = sales.filter((s) => s.week_start >= weekStart);
  const weeklyEarnings = weeklySales.filter((s) => s.verified).reduce((sum, s) => sum + Number(s.commission), 0);
  const totalEarnings = sales.filter((s) => s.verified).reduce((sum, s) => sum + Number(s.commission), 0);
  const pendingCommission = sales.filter((s) => !s.verified).reduce((sum, s) => sum + Number(s.commission), 0);
  const commissionTxns = txns.filter((t) => t.type === 'sales_commission');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Earnings</h1>
        <p className="text-muted-foreground mt-1">Track your sales commissions and wallet.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="This Week" value={formatCurrency(weeklyEarnings)} color="text-green-600" />
        <StatCard icon={TrendingUp} label="Total Earnings" value={formatCurrency(totalEarnings)} color="text-blue-600" />
        <StatCard icon={Award} label="Pending Commission" value={formatCurrency(pendingCommission)} color="text-orange-600" />
        <StatCard icon={Wallet} label="Wallet Balance" value={formatCurrency(wallet?.balance ?? 0)} color="text-purple-600" />
      </div>

      <Card>
        <h2 className="font-semibold font-display mb-4">Sales Records</h2>
        {sales.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No sales records" description="Your closed sales will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">Lead</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Commission</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3">{s.lead_name}</td>
                    <td className="py-3">{formatCurrency(s.amount)}</td>
                    <td className="py-3 font-semibold text-green-600">{formatCurrency(s.commission)}</td>
                    <td className="py-3"><Badge variant={s.verified ? 'success' : 'warning'}>{s.status}</Badge></td>
                    <td className="py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold font-display mb-4">Commission History</h2>
        {commissionTxns.length === 0 ? (
          <EmptyState icon={History} title="No commission history" description="Your commission payouts will appear here." />
        ) : (
          <div className="space-y-2">
            {commissionTxns.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p>
                </div>
                <p className="font-semibold text-green-600">+{formatCurrency(t.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
