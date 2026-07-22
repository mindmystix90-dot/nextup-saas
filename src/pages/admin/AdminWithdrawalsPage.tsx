import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownToLine, Check, X, IndianRupee } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Textarea, Select, Modal } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { fetchAllWithdrawals, adminUpdateWithdrawalStatus } from '@/services/wallet.service';
import type { Withdrawal, WithdrawalStatus } from '@/types';

export default function AdminWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState('all');
  const [actionWd, setActionWd] = useState<Withdrawal | null>(null);
  const [action, setAction] = useState<'approved' | 'rejected' | 'paid'>('approved');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setWithdrawals(await fetchAllWithdrawals()); }
    catch { toast.error('Failed to load withdrawals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAction = (w: Withdrawal, a: 'approved' | 'rejected' | 'paid') => {
    setActionWd(w); setAction(a); setNote(''); 
  };

  const handleAction = async () => {
    if (!actionWd) return;
    setSaving(true);
    const { error } = await adminUpdateWithdrawalStatus(actionWd.id, action, note);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success(`Withdrawal ${action}`);
    setActionWd(null); load();
  };

  const filtered = withdrawals.filter((w) => filter === 'all' || w.status === filter);
  const statusVariant = (s: WithdrawalStatus) =>
    s === 'paid' ? 'success' : s === 'pending' ? 'warning' : s === 'approved' ? 'default' : 'danger';

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Withdrawals</h1>
          <p className="text-muted-foreground mt-1">Review and process withdrawal requests.</p>
        </div>
        <Select value={filter} onChange={setFilter} options={[
          { value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'paid', label: 'Paid' }]} />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={ArrowDownToLine} title="No withdrawal requests" description="Withdrawal requests will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Details</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Requested</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((w) => (
                  <tr key={w.id}>
                    <td className="py-3">
                      <p className="font-medium">{w.user_name}</p>
                      <p className="text-xs text-muted-foreground">{w.user_email}</p>
                    </td>
                    <td className="py-3 font-semibold">{formatCurrency(w.amount)}</td>
                    <td className="py-3 uppercase">{w.method}</td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {w.method === 'upi' ? w.upi_id : `${w.bank_name} ${w.account_number?.slice(-4)}`}
                    </td>
                    <td className="py-3"><Badge variant={statusVariant(w.status)}>{w.status}</Badge></td>
                    <td className="py-3 text-muted-foreground">{formatDateTime(w.requested_at)}</td>
                    <td className="py-3 text-right space-x-1 whitespace-nowrap">
                      {w.status === 'pending' && (
                        <>
                          <Button variant="outline" onClick={() => openAction(w, 'approved')}><Check className="h-3 w-3" /></Button>
                          <Button variant="danger" onClick={() => openAction(w, 'rejected')}><X className="h-3 w-3" /></Button>
                        </>
                      )}
                      {w.status === 'approved' && (
                        <Button variant="primary" onClick={() => openAction(w, 'paid')}><IndianRupee className="h-3 w-3" /> Mark Paid</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!actionWd} onClose={() => setActionWd(null)} title={`${action} withdrawal`}>
        {actionWd && (
          <div className="space-y-4">
            <div className="text-sm bg-secondary/30 p-3 rounded-lg">
              <p><span className="text-muted-foreground">User:</span> {actionWd.user_name}</p>
              <p><span className="text-muted-foreground">Amount:</span> {formatCurrency(actionWd.amount)}</p>
              <p><span className="text-muted-foreground">Method:</span> {actionWd.method}</p>
            </div>
            <Textarea label="Admin Note" value={note} onChange={setNote} placeholder="Add a note for this action..." />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActionWd(null)}>Cancel</Button>
              <Button variant={action === 'rejected' ? 'danger' : 'primary'} onClick={handleAction} disabled={saving}>
                {saving ? 'Processing...' : `Confirm ${action}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
