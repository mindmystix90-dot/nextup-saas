import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Wallet, ArrowDownToLine, History, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, StatCard, Badge, EmptyState, Spinner, Button, Input, Select } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  fetchWallet, fetchTransactions, fetchWithdrawals, requestWithdrawal, fetchKyc,
} from '@/services/wallet.service';
import type { Wallet as WalletT, Transaction, Withdrawal, Kyc, WithdrawalMethod } from '@/types';

export default function WalletPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletT | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [kyc, setKyc] = useState<Kyc | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod>('upi');
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    if (!user) return;
    try {
      const [w, tx, wd, k] = await Promise.all([
        fetchWallet(user.id), fetchTransactions(user.id),
        fetchWithdrawals(user.id), fetchKyc(user.id),
      ]);
      setWallet(w); setTransactions(tx); setWithdrawals(wd); setKyc(k);
    } catch {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const kycVerified = kyc?.status === 'verified';

  const handleWithdraw = async () => {
    if (!user || !profile || !kyc) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    const res = await requestWithdrawal(user.id, profile.name, profile.email, amt, method, kyc);
    setSubmitting(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success('Withdrawal requested!');
    setShowWithdraw(false); setAmount('');
    loadAll();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your balance, transactions, and withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Available Balance" value={formatCurrency(wallet?.balance ?? 0)} color="text-green-600" />
        <StatCard icon={ArrowDownToLine} label="Pending Withdrawals" value={formatCurrency(wallet?.pending_withdrawals ?? 0)} color="text-orange-600" />
        <StatCard icon={History} label="Lifetime Earnings" value={formatCurrency(wallet?.lifetime_earnings ?? 0)} color="text-blue-600" />
      </div>

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold font-display">Withdraw Funds</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {kycVerified ? 'Your KYC is verified. You can request withdrawals.' : 'KYC verification required to withdraw.'}
            </p>
          </div>
          {kycVerified ? (
            <Button onClick={() => setShowWithdraw(true)}>
              <ArrowDownToLine className="h-4 w-4 mr-2" /> Request Withdrawal
            </Button>
          ) : (
            <Badge variant="warning"><ShieldCheck className="h-3 w-3 inline mr-1" />KYC Pending</Badge>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold font-display mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <EmptyState icon={History} title="No transactions yet" description="Your transaction history will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3">{tx.label}</td>
                    <td className="py-3"><Badge variant="secondary">{tx.type}</Badge></td>
                    <td className={`py-3 font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3">
                      <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDateTime(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold font-display mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <EmptyState icon={ArrowDownToLine} title="No withdrawals yet" description="Your withdrawal requests will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {withdrawals.map((wd) => (
                  <tr key={wd.id}>
                    <td className="py-3 font-semibold">{formatCurrency(wd.amount)}</td>
                    <td className="py-3 uppercase">{wd.method}</td>
                    <td className="py-3">
                      <Badge variant={wd.status === 'paid' ? 'success' : wd.status === 'pending' ? 'warning' : wd.status === 'approved' ? 'default' : 'danger'}>
                        {wd.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDateTime(wd.requested_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showWithdraw && kyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowWithdraw(false)}>
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold font-display">Request Withdrawal</h2>
            <Input label="Amount (₹)" type="number" value={amount} onChange={setAmount} placeholder="Enter amount" />
            <Select
              label="Method"
              value={method}
              onChange={(v) => setMethod(v as WithdrawalMethod)}
              options={[
                { value: 'upi', label: 'UPI' },
                { value: 'bank', label: 'Bank Transfer' },
              ]}
            />
            <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {method === 'upi' ? `UPI: ${kyc.upi_id || '—'}` : `Bank: ${kyc.bank_name}, ${kyc.account_number}`}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
              <Button onClick={handleWithdraw} disabled={submitting}>{submitting ? 'Processing...' : 'Confirm'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
