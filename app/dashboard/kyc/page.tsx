'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, Clock, XCircle, Landmark } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { fetchKyc, submitKyc } from '@/services/wallet.service';
import type { KycInfo } from '@/types';

export default function KycPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kyc, setKyc] = useState<KycInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ accountHolder: '', bankName: '', accountNumber: '', ifsc: '', upiId: '' });

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const k = await fetchKyc(user.uid);
        setKyc(k);
        if (k) {
          setForm({
            accountHolder: k.accountHolder, bankName: k.bankName,
            accountNumber: k.accountNumber, ifsc: k.ifsc, upiId: k.upiId || '',
          });
        } else {
          setForm((f) => ({ ...f, accountHolder: user.name || '' }));
        }
      } catch { /* best-effort */ } finally { setLoading(false); }
    })();
  }, [user?.uid]);

  async function handleSubmit() {
    if (!user) return;
    if (!form.accountHolder.trim() || !form.bankName.trim() || !form.accountNumber.trim() || !form.ifsc.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await submitKyc(user.uid, form);
      toast.success('KYC submitted for review');
      const k = await fetchKyc(user.uid);
      setKyc(k);
    } catch {
      toast.error('Failed to submit KYC');
    } finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const status = kyc?.status || 'pending';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary"><ShieldCheck className="h-5 w-5" /></span>
          KYC Verification
        </h1>
        <p className="mt-2 text-muted-foreground">Verify your bank details to enable withdrawals.</p>
      </div>

      {/* Status banner */}
      <Card className="card-premium mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status === 'verified' ? (
                <><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success"><CheckCircle2 className="h-5 w-5" /></span>
                <div><p className="font-semibold text-sm">KYC Verified</p><p className="text-xs text-muted-foreground">You can request withdrawals.</p></div></>
              ) : status === 'pending' && kyc ? (
                <><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning"><Clock className="h-5 w-5" /></span>
                <div><p className="font-semibold text-sm">Pending Review</p><p className="text-xs text-muted-foreground">Your KYC is being reviewed.</p></div></>
              ) : status === 'rejected' ? (
                <><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><XCircle className="h-5 w-5" /></span>
                <div><p className="font-semibold text-sm">KYC Rejected</p><p className="text-xs text-muted-foreground">{kyc?.rejectionReason || 'Please resubmit with correct details.'}</p></div></>
              ) : (
                <><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><Landmark className="h-5 w-5" /></span>
                <div><p className="font-semibold text-sm">Not Submitted</p><p className="text-xs text-muted-foreground">Submit your bank details below.</p></div></>
              )}
            </div>
            <Badge className={
              status === 'verified' ? 'bg-success/10 text-success' :
              status === 'pending' ? 'bg-warning/10 text-warning' :
              status === 'rejected' ? 'bg-destructive/10 text-destructive' :
              'bg-secondary text-muted-foreground'
            }>
              {status === 'verified' ? 'Verified' : status === 'pending' ? 'Pending' : status === 'rejected' ? 'Rejected' : 'Not Submitted'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KYC form */}
      <Card className="card-premium max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Bank details</CardTitle>
          <CardDescription>Only bank details are required. Your name, phone, and address are already on your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Holder Name *</Label>
              <Input value={form.accountHolder} onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))} placeholder="As per bank records" />
            </div>
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Input value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} placeholder="e.g. HDFC Bank" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Number *</Label>
              <Input value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} placeholder="Bank account number" />
            </div>
            <div className="space-y-2">
              <Label>IFSC Code *</Label>
              <Input value={form.ifsc} onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value }))} placeholder="e.g. HDFC0001234" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>UPI ID (optional)</Label>
            <Input value={form.upiId} onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))} placeholder="e.g. name@okhdfc" />
          </div>
          <Button onClick={handleSubmit} disabled={submitting || status === 'verified'} className="bg-brand-gradient font-semibold">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {kyc ? 'Resubmit KYC' : 'Submit KYC'}
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
