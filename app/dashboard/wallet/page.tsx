'use client';

import { useEffect, useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  IndianRupee,
  Loader2,
  PiggyBank,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Info,
  DollarSign,
  ChevronRight,
  Sliders,
  Receipt,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import {
  subscribeWallet,
  subscribeTransactions,
  subscribeWithdrawals,
  requestWithdrawal,
  fetchKyc,
  formatINR,
} from '@/services/wallet.service';
import {
  subscribeSystemSettings,
  DEFAULT_SYSTEM_SETTINGS,
} from '@/services/system-settings.service';
import { subscribePaymentMethods } from '@/services/payment-methods.service';
import type {
  WalletData,
  WalletTransaction,
  Withdrawal,
  KycInfo,
  SystemSettings,
  PaymentMethodConfig,
} from '@/types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function WalletPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [kyc, setKyc] = useState<KycInfo | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // Withdrawal Dialog State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedProofWithdrawal, setSelectedProofWithdrawal] = useState<Withdrawal | null>(null);
  const [isMicrotask, setIsMicrotask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [dynamicDetails, setDynamicDetails] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Subscribe to System Settings
    const unsubSettings = subscribeSystemSettings((s) => setSettings(s));

    // 2. Subscribe to Wallet real-time
    const unsubWallet = subscribeWallet(user.uid, (w) => setWallet(w));

    // 3. Subscribe to Transactions real-time
    const unsubTxns = subscribeTransactions(user.uid, (t) => setTransactions(t));

    // 4. Subscribe to Withdrawals real-time
    const unsubWithdrawals = subscribeWithdrawals(user.uid, (wd) => setWithdrawals(wd));

    // 5. Subscribe to Payment Methods real-time
    const unsubMethods = subscribePaymentMethods((methods) => {
      const enabledOnly = methods.filter((m) => m.enabled);
      setPaymentMethods(enabledOnly);
      if (enabledOnly.length > 0 && !selectedMethodId) {
        setSelectedMethodId(enabledOnly[0].id);
      }
    });

    // 6. Initial Fetch for KYC
    (async () => {
      setLoading(true);
      try {
        const k = await fetchKyc(user.uid);
        setKyc(k);
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      unsubSettings();
      unsubWallet();
      unsubTxns();
      unsubWithdrawals();
      unsubMethods();
    };
  }, [user?.uid, selectedMethodId]);

  // Selected Payment Method Object
  const currentMethod =
    paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];

  // Pre-fill dynamic details from KYC whenever method or KYC changes
  useEffect(() => {
    if (!currentMethod || !kyc) return;

    const initialDetails: Record<string, string> = { ...dynamicDetails };
    if (currentMethod.requiredFields) {
      for (const field of currentMethod.requiredFields) {
        if (!initialDetails[field.key]) {
          if (field.key === 'upiId' && kyc.upiId) initialDetails[field.key] = kyc.upiId;
          else if (field.key === 'accountNumber' && kyc.accountNumber)
            initialDetails[field.key] = kyc.accountNumber;
          else if (field.key === 'bankName' && kyc.bankName)
            initialDetails[field.key] = kyc.bankName;
          else if (field.key === 'ifsc' && kyc.ifsc) initialDetails[field.key] = kyc.ifsc;
          else if (field.key === 'accountHolder' && kyc.accountHolder)
            initialDetails[field.key] = kyc.accountHolder;
        }
      }
    }
    setDynamicDetails(initialDetails);
  }, [selectedMethodId, kyc, currentMethod]);

  async function handleWithdraw() {
    if (!user || !kyc) return;
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!currentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate dynamic fields
    if (currentMethod.requiredFields) {
      for (const f of currentMethod.requiredFields) {
        if (f.required && (!dynamicDetails[f.key] || !dynamicDetails[f.key].trim())) {
          toast.error(`Please fill in "${f.label}"`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      await requestWithdrawal(
        user.uid,
        user.name,
        user.email,
        amount,
        currentMethod,
        dynamicDetails,
        kyc,
        { isMicrotask }
      );
      toast.success('Withdrawal request submitted successfully!');
      setShowWithdraw(false);
      setWithdrawAmount('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to request withdrawal');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const balance = wallet?.balance ?? 0;
  const pendingBalance = wallet?.pendingBalance ?? 0;
  const lifetime = wallet?.lifetimeEarnings ?? 0;
  const pendingWithdrawals = wallet?.pendingWithdrawals ?? 0;
  const completedWithdrawals = wallet?.completedWithdrawals ?? 0;

  const minWithdrawal = isMicrotask
    ? settings.microtasks.minimumWithdraw
    : currentMethod?.minimumWithdraw || settings.withdrawals.minimumWithdraw;

  const maxWithdrawal =
    currentMethod?.maximumWithdraw || settings.withdrawals.maximumWithdraw;

  const remainingNeeded = Math.max(0, minWithdrawal - balance);

  // Fee calculation for user display
  const numAmount = Number(withdrawAmount) || 0;
  let estimatedFee = 0;
  if (currentMethod) {
    if (typeof currentMethod.withdrawFee === 'number' && currentMethod.withdrawFee >= 0) {
      estimatedFee =
        currentMethod.withdrawFeeType === 'percentage'
          ? Math.round((numAmount * currentMethod.withdrawFee) / 100)
          : currentMethod.withdrawFee;
    } else {
      estimatedFee =
        settings.withdrawals.withdrawalFeeType === 'percentage'
          ? Math.round((numAmount * settings.withdrawals.withdrawalFee) / 100)
          : settings.withdrawals.withdrawalFee;
    }
  }
  const estimatedPayout = Math.max(0, numAmount - estimatedFee);

  const todayTxns = transactions.filter((t) => isToday(t.date));
  const todayEarnings = todayTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const kycVerified = kyc?.status === 'verified';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <Wallet className="h-5 w-5" />
          </span>
          Unified Wallet
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track all earnings from course sales, referrals, microtasks, and rewards in one place.
        </p>
      </div>

      {!settings.walletEnabled && (
        <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-warning flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Wallet Withdrawals Paused</p>
            <p className="text-xs opacity-90">
              System withdrawals are temporarily disabled by platform administrator.
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Available Balance" value={`₹${formatINR(balance)}`} color="text-primary" />
        <StatCard icon={Clock} label="Pending Balance" value={`₹${formatINR(pendingBalance)}`} color="text-amber-500" />
        <StatCard icon={TrendingUp} label="Today's Earnings" value={`₹${formatINR(todayEarnings)}`} color="text-success" />
        <StatCard icon={IndianRupee} label="Lifetime Earnings" value={`₹${formatINR(lifetime)}`} color="text-violet-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance & Withdrawal Action Card */}
        <Card className="card-premium overflow-hidden">
          <div className="bg-slate-950 p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
                <Wallet className="h-5 w-5 text-white" />
              </span>
              <span className="text-xs font-mono uppercase bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
                Unified
              </span>
            </div>
            <p className="mt-6 font-display text-4xl font-bold">₹{formatINR(balance)}</p>
            <p className="mt-2 text-xs text-slate-400">Lifetime Earned: ₹{formatINR(lifetime)}</p>
          </div>

          <CardContent className="p-5 space-y-4">
            {/* Withdrawal Rules Overview */}
            <div className="rounded-xl bg-secondary/50 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Minimum Withdrawal</span>
                <span className="font-semibold text-foreground">₹{formatINR(minWithdrawal)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Microtask Minimum</span>
                <span className="font-semibold text-foreground">
                  ₹{formatINR(settings.microtasks.minimumWithdraw)}
                </span>
              </div>
              {remainingNeeded > 0 ? (
                <div className="mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  Earn ₹{formatINR(remainingNeeded)} more to unlock withdrawal
                </div>
              ) : (
                <div className="mt-2 text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Eligible for withdrawal
                </div>
              )}
            </div>

            <Button
              className="w-full bg-brand-gradient font-semibold"
              disabled={!settings.walletEnabled || balance < minWithdrawal}
              onClick={() => {
                if (!kycVerified) {
                  toast.error('Please complete KYC verification before requesting withdrawal');
                  return;
                }
                setShowWithdraw(true);
              }}
            >
              <PiggyBank className="mr-2 h-4 w-4" /> Request Withdrawal
            </Button>

            {/* KYC Status indicator */}
            <div className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> KYC Verification
              </span>
              {kycVerified ? (
                <Badge className="bg-success/10 text-success">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                </Badge>
              ) : kyc?.status === 'pending' ? (
                <Badge className="bg-warning/10 text-warning">
                  <Clock className="mr-1 h-3 w-3" /> Pending Review
                </Badge>
              ) : kyc?.status === 'rejected' ? (
                <Badge className="bg-destructive/10 text-destructive">
                  <XCircle className="mr-1 h-3 w-3" /> Rejected
                </Badge>
              ) : (
                <Button size="sm" variant="outline" className="text-xs h-7" asChild>
                  <a href="/dashboard/kyc">Verify KYC</a>
                </Button>
              )}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Pending Payouts</p>
                <p className="font-display text-sm font-bold">₹{formatINR(pendingWithdrawals)}</p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="font-display text-sm font-bold">₹{formatINR(completedWithdrawals)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <Badge variant="outline" className="text-xs">
              {transactions.length} Total
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
                  <Wallet className="h-6 w-6" />
                </span>
                <p className="text-sm font-semibold">No transactions found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  All earnings, bonuses, and withdrawals will record here.
                </p>
              </div>
            ) : (
              transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 rounded-xl border border-border p-3.5 hover:bg-secondary/40 transition-colors"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      t.amount >= 0
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {t.amount >= 0 ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString('en-IN')}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {t.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.amount >= 0 ? 'text-success' : 'text-foreground'
                    }`}
                  >
                    {t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Requests History Table */}
      <Card className="card-premium mt-6 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" /> Payout & Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
                <PiggyBank className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold">No withdrawal requests</p>
              <p className="mt-1 text-xs text-muted-foreground">
                When you request a payout, status updates will show here.
              </p>
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
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{w.id.slice(0, 12)}</td>
                      <td className="px-4 py-3 font-semibold font-mono text-foreground">
                        ₹{formatINR(w.amount)}
                        {w.fee ? <span className="block text-[10px] text-muted-foreground font-normal">Fee: ₹{formatINR(w.fee)}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">
                        {w.methodName || w.method}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            STATUS_STYLES[w.status] || 'bg-secondary text-foreground'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                        {new Date(w.requestedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedProofWithdrawal(w)}
                          className="h-8 text-xs font-medium"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-primary" /> View Proof
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User View Payment Proof & Receipt Modal */}
      <Dialog open={!!selectedProofWithdrawal} onOpenChange={(open) => !open && setSelectedProofWithdrawal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Withdrawal Receipt & Proof
            </DialogTitle>
            <DialogDescription>
              Complete statement and transfer details for request #{selectedProofWithdrawal?.id.slice(0, 10)}
            </DialogDescription>
          </DialogHeader>

          {selectedProofWithdrawal && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-secondary/30 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={`capitalize font-semibold text-xs ${STATUS_STYLES[selectedProofWithdrawal.status]}`}>
                    {selectedProofWithdrawal.status}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Requested Amount:</span>
                  <span className="font-mono font-bold text-foreground">₹{formatINR(selectedProofWithdrawal.amount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Withdrawal Fee:</span>
                  <span className="font-mono text-warning">₹{formatINR(selectedProofWithdrawal.fee || 0)}</span>
                </div>

                <div className="flex justify-between items-center border-t border-border pt-1.5 font-bold text-sm">
                  <span className="text-foreground">Final Amount Received:</span>
                  <span className="font-mono text-success">
                    ₹{formatINR(selectedProofWithdrawal.netAmount || selectedProofWithdrawal.amount - (selectedProofWithdrawal.fee || 0))}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-card border border-border rounded-xl space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold">{selectedProofWithdrawal.methodName || selectedProofWithdrawal.method}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request Date:</span>
                  <span>{new Date(selectedProofWithdrawal.requestedAt).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Date:</span>
                  <span>
                    {selectedProofWithdrawal.paidAt || selectedProofWithdrawal.processedAt
                      ? new Date(selectedProofWithdrawal.paidAt || selectedProofWithdrawal.processedAt!).toLocaleString('en-IN')
                      : '—'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-bold text-foreground">{selectedProofWithdrawal.transactionId || '—'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference / UTR #:</span>
                  <span className="font-bold text-success">{selectedProofWithdrawal.referenceNumber || '—'}</span>
                </div>
              </div>

              {(selectedProofWithdrawal.adminNote || selectedProofWithdrawal.paymentNotes) && (
                <div className="p-3 border border-border rounded-xl bg-muted/40 space-y-1">
                  <p className="font-semibold text-muted-foreground text-[10px] uppercase">Admin Notes / Remarks:</p>
                  <p className="text-foreground">{selectedProofWithdrawal.adminNote || selectedProofWithdrawal.paymentNotes}</p>
                </div>
              )}

              {selectedProofWithdrawal.paymentProofUrl && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <p className="font-semibold text-muted-foreground text-[10px] uppercase">Payment Proof Screenshot:</p>
                  <div className="p-2 border border-border rounded-xl bg-card overflow-hidden">
                    <img
                      src={selectedProofWithdrawal.paymentProofUrl}
                      alt="Transfer Receipt"
                      className="max-h-60 w-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedProofWithdrawal(null)}>
              Close Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dynamic Withdrawal Dialog Modal */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" /> Request Payout
            </DialogTitle>
            <DialogDescription>
              Available Balance: <span className="font-semibold text-foreground">₹{formatINR(balance)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Category selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Earnings Category</Label>
              <Select
                value={isMicrotask ? 'microtask' : 'general'}
                onValueChange={(v) => setIsMicrotask(v === 'microtask')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Standard Wallet Earnings</SelectItem>
                  <SelectItem value="microtask">Microtasks Payout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Payment Method</Label>
              {paymentMethods.length === 0 ? (
                <p className="text-muted-foreground py-2">No active payment methods available.</p>
              ) : (
                <Select value={selectedMethodId} onValueChange={(v) => setSelectedMethodId(v)}>
                  <SelectTrigger className="h-9 font-medium">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.processingTime || 'Instant'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {currentMethod && (
              <>
                {/* Method Info Banner */}
                <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>{currentMethod.name} Overview</span>
                    <span className="text-primary font-mono">{currentMethod.processingTime || 'Instant'}</span>
                  </div>
                  <p className="text-muted-foreground">{currentMethod.instructions}</p>
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Withdrawal Amount (₹)</Label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Min ₹${formatINR(minWithdrawal)} · Max ₹${formatINR(maxWithdrawal)}`}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                    <span>Min: ₹{formatINR(minWithdrawal)}</span>
                    <span>Max: ₹{formatINR(maxWithdrawal)}</span>
                  </div>
                </div>

                {/* Live Payout Fee Breakdown */}
                {numAmount > 0 && (
                  <div className="rounded-xl border border-border p-3 bg-secondary/30 space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Requested Amount:</span>
                      <span className="font-mono text-foreground">₹{formatINR(numAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Processing Fee:</span>
                      <span className="font-mono text-amber-500">
                        {estimatedFee > 0 ? `- ₹${formatINR(estimatedFee)}` : 'FREE (₹0)'}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-border pt-1 text-foreground">
                      <span>You Receive Approx:</span>
                      <span className="font-mono text-success text-sm">₹{formatINR(estimatedPayout)}</span>
                    </div>
                  </div>
                )}

                {/* Dynamic Form Inputs based on requiredFields */}
                {currentMethod.requiredFields && currentMethod.requiredFields.length > 0 && (
                  <div className="space-y-3 border-t border-border pt-3">
                    <p className="font-semibold text-foreground flex items-center gap-1 text-xs">
                      Required Account Information
                    </p>
                    {currentMethod.requiredFields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-[11px] font-medium text-foreground">
                          {field.label} {field.required ? '*' : '(Optional)'}
                        </Label>
                        <Input
                          type={field.type || 'text'}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          value={dynamicDetails[field.key] || ''}
                          className="h-8 text-xs"
                          onChange={(e) =>
                            setDynamicDetails({ ...dynamicDetails, [field.key]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                submitting ||
                !currentMethod ||
                !numAmount ||
                numAmount < minWithdrawal ||
                numAmount > maxWithdrawal ||
                numAmount > balance
              }
              className="bg-brand-gradient font-semibold"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="card-premium">
      <CardContent className="p-5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-3 font-display text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}
