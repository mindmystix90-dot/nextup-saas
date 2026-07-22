import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Wallet as WalletIcon, Plus, Minus, History } from 'lucide-react';
import { Card, StatCard, Badge, EmptyState, Spinner, Button, Input, Textarea, Select, Modal, Avatar } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { fetchAllWallets } from '@/services/admin.service';
import { adminCreditWallet, adminDebitWallet, fetchTransactions } from '@/services/wallet.service';

type WalletRow = {
  id: string; user_id: string; balance: number; lifetime_earnings: number;
  pending_withdrawals: number; completed_withdrawals: number; updated_at: string;
  profiles?: { email: string; name: string };
};

export default function AdminWalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'credit' | 'debit'>('credit');
  const [selected, setSelected] = useState<WalletRow | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [txns, setTxns] = useState<Record<string, any[]>>({});

  const load = async () => {
    try {
      const w = await fetchAllWallets();
      setWallets(w as WalletRow[]);
    } catch { toast.error('Failed to load wallets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (w: WalletRow, m: 'credit' | 'debit') => {
    setSelected(w); setMode(m); setAmount(''); setReason(''); setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (!reason.trim()) { toast.error('Reason is required'); return; }
    setSaving(true);
    const fn = mode === 'credit' ? adminCreditWallet : adminDebitWallet;
    const { error } = await fn(selected.user_id, amt, reason);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success(`Wallet ${mode}ed`);
    setShowModal(false); load();
  };

  const viewTxns = async (w: WalletRow) => {
    if (txns[w.user_id]) { setTxns({ ...txns, [w.user_id]: [] }); return; }
    const t = await fetchTransactions(w.user_id);
    setTxns({ ...txns, [w.user_id]: t });
  };

  if (loading) return <Spinner />;

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const totalEarnings = wallets.reduce((s, w) => s + Number(w.lifetime_earnings), 0);
  const totalPending = wallets.reduce((s, w) => s + Number(w.pending_withdrawals), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Wallets</h1>
        <p className="text-muted-foreground mt-1">Manage all user wallets.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={WalletIcon} label="Total Balance" value={formatCurrency(totalBalance)} color="text-green-600" />
        <StatCard icon={History} label="Lifetime Earnings" value={formatCurrency(totalEarnings)} color="text-blue-600" />
        <StatCard icon={Minus} label="Pending Withdrawals" value={formatCurrency(totalPending)} color="text-orange-600" />
      </div>

      <Card>
        {wallets.length === 0 ? (
          <EmptyState icon={WalletIcon} title="No wallets yet" description="User wallets will appear here." />
        ) : (
          <div className="space-y-3">
            {wallets.map((w) => (
              <div key={w.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Avatar name={w.profiles?.name || ''} size="sm" />
                    <div>
                      <p className="font-medium">{w.profiles?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{w.profiles?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="font-semibold text-green-600">{formatCurrency(w.balance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Earned</p>
                      <p className="font-semibold">{formatCurrency(w.lifetime_earnings)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="font-semibold text-orange-600">{formatCurrency(w.pending_withdrawals)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openModal(w, 'credit')}><Plus className="h-3 w-3" /></Button>
                      <Button variant="danger" onClick={() => openModal(w, 'debit')}><Minus className="h-3 w-3" /></Button>
                    </div>
                    <Button variant="outline" onClick={() => viewTxns(w)}>Txns</Button>
                  </div>
                </div>

                {txns[w.user_id] && txns[w.user_id].length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left border-b border-border">
                            <th className="pb-1 font-medium">Label</th>
                            <th className="pb-1 font-medium">Type</th>
                            <th className="pb-1 font-medium">Amount</th>
                            <th className="pb-1 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {txns[w.user_id].map((t) => (
                            <tr key={t.id}>
                              <td className="py-1.5">{t.label}</td>
                              <td className="py-1.5"><Badge variant="secondary">{t.type}</Badge></td>
                              <td className={`py-1.5 ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                              <td className="py-1.5 text-muted-foreground">{formatDateTime(t.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`${mode === 'credit' ? 'Credit' : 'Debit'} Wallet`}>
        {selected && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
              {selected.profiles?.name} · Current balance: {formatCurrency(selected.balance)}
            </div>
            <Input label="Amount (₹)" type="number" value={amount} onChange={setAmount} placeholder="Enter amount" />
            <Textarea label="Reason" value={reason} onChange={setReason} placeholder="Reason for adjustment" rows={2} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant={mode === 'credit' ? 'primary' : 'danger'} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Processing...' : `Confirm ${mode}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
