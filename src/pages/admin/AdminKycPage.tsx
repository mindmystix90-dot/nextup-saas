import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Check, X } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Textarea, Select, Modal } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { fetchAllKyc, adminUpdateKycStatus } from '@/services/wallet.service';
import type { Kyc } from '@/types';

type KycRow = Kyc & { user_email: string; user_name: string };

export default function AdminKycPage() {
  const [loading, setLoading] = useState(true);
  const [kycs, setKycs] = useState<KycRow[]>([]);
  const [filter, setFilter] = useState('all');
  const [actionKyc, setActionKyc] = useState<KycRow | null>(null);
  const [action, setAction] = useState<'verified' | 'rejected'>('verified');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setKycs(await fetchAllKyc()); }
    catch { toast.error('Failed to load KYC submissions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAction = (k: KycRow, a: 'verified' | 'rejected') => {
    setActionKyc(k); setAction(a); setReason('');
  };

  const handleAction = async () => {
    if (!actionKyc) return;
    setSaving(true);
    const { error } = await adminUpdateKycStatus(actionKyc.user_id, action, reason);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success(`KYC ${action}`);
    setActionKyc(null); load();
  };

  const filtered = kycs.filter((k) => filter === 'all' || k.status === filter);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">KYC Verification</h1>
          <p className="text-muted-foreground mt-1">Review bank and UPI details for withdrawals.</p>
        </div>
        <Select value={filter} onChange={setFilter} options={[
          { value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' },
          { value: 'verified', label: 'Verified' }, { value: 'rejected', label: 'Rejected' }]} />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No KYC submissions" description="KYC submissions will appear here." />
        ) : (
          <div className="space-y-3">
            {filtered.map((k) => (
              <div key={k.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{k.user_name}</p>
                      <Badge variant={k.status === 'verified' ? 'success' : k.status === 'pending' ? 'warning' : 'danger'}>
                        {k.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{k.user_email}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
                      <p><span className="text-muted-foreground">Account Holder:</span> {k.account_holder}</p>
                      <p><span className="text-muted-foreground">Bank:</span> {k.bank_name}</p>
                      <p><span className="text-muted-foreground">Account No:</span> {k.account_number}</p>
                      <p><span className="text-muted-foreground">IFSC:</span> {k.ifsc}</p>
                      <p><span className="text-muted-foreground">UPI:</span> {k.upi_id || '—'}</p>
                      <p><span className="text-muted-foreground">Submitted:</span> {formatDateTime(k.submitted_at)}</p>
                    </div>
                    {k.rejection_reason && (
                      <p className="text-red-600 text-xs mt-1">Rejection: {k.rejection_reason}</p>
                    )}
                  </div>
                  {k.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" onClick={() => openAction(k, 'verified')}><Check className="h-3 w-3 mr-1" /> Approve</Button>
                      <Button variant="danger" onClick={() => openAction(k, 'rejected')}><X className="h-3 w-3 mr-1" /> Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!actionKyc} onClose={() => setActionKyc(null)} title={action === 'verified' ? 'Approve KYC' : 'Reject KYC'}>
        {actionKyc && (
          <div className="space-y-4">
            <div className="text-sm bg-secondary/30 p-3 rounded-lg">
              <p><span className="text-muted-foreground">User:</span> {actionKyc.user_name}</p>
              <p><span className="text-muted-foreground">Bank:</span> {actionKyc.bank_name}</p>
            </div>
            {action === 'rejected' && (
              <Textarea label="Rejection Reason" value={reason} onChange={setReason} placeholder="Explain why this KYC is rejected..." />
            )}
            {action === 'verified' && (
              <p className="text-sm text-muted-foreground">The user will be notified and can then withdraw funds.</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActionKyc(null)}>Cancel</Button>
              <Button variant={action === 'rejected' ? 'danger' : 'primary'} onClick={handleAction} disabled={saving}>
                {saving ? 'Processing...' : `Confirm ${action === 'verified' ? 'Approval' : 'Rejection'}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
