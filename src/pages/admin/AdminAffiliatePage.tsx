import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users2, Pencil, IndianRupee } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Input, Modal } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  fetchAllAffiliateStats, adminSetCommissionRate, adminMarkCommissionPaid,
} from '@/services/affiliate.service';
import type { AffiliateStats } from '@/types';

type AffiliateRow = AffiliateStats & { user_email: string; user_name: string };

export default function AdminAffiliatePage() {
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [editRate, setEditRate] = useState<AffiliateRow | null>(null);
  const [rate, setRate] = useState('');
  const [payUser, setPayUser] = useState<AffiliateRow | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setAffiliates(await fetchAllAffiliateStats()); }
    catch { toast.error('Failed to load affiliate data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveRate = async () => {
    if (!editRate) return;
    setSaving(true);
    const { error } = await adminSetCommissionRate(editRate.user_id, Number(rate));
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Commission rate updated');
    setEditRate(null); load();
  };

  const markPaid = async () => {
    if (!payUser) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    const { error } = await adminMarkCommissionPaid(payUser.user_id, amt);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Commission marked as paid');
    setPayUser(null); setPayAmount(''); load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Affiliate Program</h1>
        <p className="text-muted-foreground mt-1">Manage affiliate partners and commissions.</p>
      </div>

      <Card>
        {affiliates.length === 0 ? (
          <EmptyState icon={Users2} title="No affiliates yet" description="Affiliate partners will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">Partner</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">Clicks</th>
                  <th className="pb-2 font-medium">Registrations</th>
                  <th className="pb-2 font-medium">Sales</th>
                  <th className="pb-2 font-medium">Pending</th>
                  <th className="pb-2 font-medium">Paid</th>
                  <th className="pb-2 font-medium">Rate</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {affiliates.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3">
                      <p className="font-medium">{a.user_name}</p>
                      <p className="text-xs text-muted-foreground">{a.user_email}</p>
                    </td>
                    <td className="py-3"><Badge variant="outline">{a.referral_code}</Badge></td>
                    <td className="py-3">{a.clicks}</td>
                    <td className="py-3">{a.registrations}</td>
                    <td className="py-3">{a.sales}</td>
                    <td className="py-3 font-semibold text-orange-600">{formatCurrency(a.pending_commission)}</td>
                    <td className="py-3 font-semibold text-green-600">{formatCurrency(a.paid_commission)}</td>
                    <td className="py-3">{a.commission_rate}%</td>
                    <td className="py-3 text-right space-x-1 whitespace-nowrap">
                      <Button variant="outline" onClick={() => { setEditRate(a); setRate(String(a.commission_rate)); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {a.pending_commission > 0 && (
                        <Button variant="primary" onClick={() => { setPayUser(a); setPayAmount(String(a.pending_commission)); }}>
                          <IndianRupee className="h-3 w-3" /> Pay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!editRate} onClose={() => setEditRate(null)} title="Set Commission Rate">
        {editRate && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{editRate.user_name}</p>
            <Input label="Commission Rate (%)" type="number" value={rate} onChange={setRate} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditRate(null)}>Cancel</Button>
              <Button onClick={saveRate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!payUser} onClose={() => setPayUser(null)} title="Mark Commission Paid">
        {payUser && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{payUser.user_name}</p>
            <p className="text-sm">Pending: {formatCurrency(payUser.pending_commission)}</p>
            <Input label="Amount to Pay (₹)" type="number" value={payAmount} onChange={setPayAmount} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPayUser(null)}>Cancel</Button>
              <Button onClick={markPaid} disabled={saving}>{saving ? 'Processing...' : 'Confirm Payment'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
