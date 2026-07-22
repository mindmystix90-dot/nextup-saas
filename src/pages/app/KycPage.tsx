import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, Spinner, Button, Input } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { fetchKyc, submitKyc } from '@/services/wallet.service';
import type { Kyc } from '@/types';

export default function KycPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kyc, setKyc] = useState<Kyc | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const k = await fetchKyc(user.id);
        setKyc(k);
        if (k) {
          setAccountHolder(k.account_holder ?? '');
          setBankName(k.bank_name ?? '');
          setAccountNumber(k.account_number ?? '');
          setIfsc(k.ifsc ?? '');
          setUpiId(k.upi_id ?? '');
        }
      } catch {
        toast.error('Failed to load KYC details');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!accountHolder || !bankName || !accountNumber || !ifsc) {
      toast.error('Please fill all bank details');
      return;
    }
    setSubmitting(true);
    const res = await submitKyc(user.id, accountHolder, bankName, accountNumber, ifsc, upiId);
    setSubmitting(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success('KYC submitted for review!');
    const k = await fetchKyc(user.id);
    setKyc(k);
  };

  if (loading) return <Spinner />;

  const status = kyc?.status ?? 'none';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">KYC Verification</h1>
        <p className="text-muted-foreground mt-1">Verify your bank details to enable withdrawals.</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`p-3 rounded-xl ${status === 'verified' ? 'bg-green-500/10' : status === 'pending' ? 'bg-orange-500/10' : status === 'rejected' ? 'bg-red-500/10' : 'bg-secondary/50'}`}>
            {status === 'verified' ? <CheckCircle2 className="h-6 w-6 text-green-600" />
              : status === 'pending' ? <Clock className="h-6 w-6 text-orange-600" />
              : status === 'rejected' ? <XCircle className="h-6 w-6 text-red-600" />
              : <ShieldCheck className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold font-display">
              {status === 'verified' ? 'KYC Verified' : status === 'pending' ? 'KYC Under Review' : status === 'rejected' ? 'KYC Rejected' : 'Not Submitted'}
            </p>
            {kyc?.submitted_at && (
              <p className="text-sm text-muted-foreground">Submitted {formatDateTime(kyc.submitted_at)}</p>
            )}
          </div>
          <Badge variant={status === 'verified' ? 'success' : status === 'pending' ? 'warning' : status === 'rejected' ? 'danger' : 'outline'}>
            {status === 'none' ? 'Pending' : status}
          </Badge>
        </div>

        {status === 'rejected' && kyc?.rejection_reason && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm font-medium text-red-600">Rejection Reason</p>
            <p className="text-sm text-muted-foreground mt-1">{kyc.rejection_reason}</p>
          </div>
        )}

        {status === 'verified' && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm font-medium text-green-600">All set!</p>
            <p className="text-sm text-muted-foreground mt-1">Your KYC is verified. You can now request withdrawals from your wallet.</p>
          </div>
        )}
      </Card>

      {status !== 'verified' && (
        <Card>
          <h2 className="font-semibold font-display mb-4">
            {status === 'rejected' ? 'Resubmit KYC' : 'Submit KYC Details'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Account Holder Name" value={accountHolder} onChange={setAccountHolder} placeholder="Name as per bank account" required />
            <Input label="Bank Name" value={bankName} onChange={setBankName} placeholder="e.g. HDFC Bank" required />
            <Input label="Account Number" value={accountNumber} onChange={setAccountNumber} placeholder="Bank account number" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="IFSC Code" value={ifsc} onChange={setIfsc} placeholder="e.g. HDFC0001234" required />
              <Input label="UPI ID (optional)" value={upiId} onChange={setUpiId} placeholder="e.g. name@upi" />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : status === 'rejected' ? 'Resubmit KYC' : 'Submit for Review'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
