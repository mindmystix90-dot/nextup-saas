'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Loader2,
  Check,
  X,
  IndianRupee,
  Clock,
  TrendingUp,
  Filter,
  Sliders,
  Eye,
  FileText,
  User,
  AlertCircle,
  MessageSquare,
  Search,
  Upload,
  ShieldCheck,
  BarChart2,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  fetchAllWithdrawals,
  adminProcessWithdrawal,
  fetchAllTransactions,
  subscribeAllWithdrawals,
  subscribeAllTransactions,
  formatINR,
} from '@/services/wallet.service';
import { fetchPlatformFinance, subscribePlatformFinance } from '@/services/platform-finance.service';
import { useAuth } from '@/hooks/use-auth';
import type { Withdrawal, WalletTransaction, PlatformFinance } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

type StatusFilter = 'all' | 'pending' | 'approved' | 'paid' | 'rejected' | 'failed';

export default function AdminWalletPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [finance, setFinance] = useState<PlatformFinance | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Details & Payment Proof Modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [txIdInput, setTxIdInput] = useState('');
  const [refNumInput, setRefNumInput] = useState('');
  const [paymentNotesInput, setPaymentNotesInput] = useState('');
  const [proofUrlInput, setProofUrlInput] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubWithdrawals = subscribeAllWithdrawals((wd) => {
      setWithdrawals(wd);
      setLoading(false);
    });
    const unsubTxns = subscribeAllTransactions((txns) => {
      setTransactions(txns);
    });
    const unsubFin = subscribePlatformFinance(setFinance);

    return () => {
      unsubWithdrawals();
      unsubTxns();
      unsubFin();
    };
  }, []);

  async function process(id: string, action: 'approve' | 'reject' | 'mark_paid', note?: string) {
    setProcessing(id);
    try {
      await adminProcessWithdrawal(
        id,
        action,
        note || adminNoteInput,
        {
          uid: user?.uid || 'admin',
          name: user?.name || user?.email || 'Admin',
        },
        action === 'mark_paid'
          ? {
              transactionId: txIdInput,
              referenceNumber: refNumInput,
              paymentNotes: paymentNotesInput || adminNoteInput,
              paymentProofUrl: proofUrlInput,
            }
          : undefined
      );

      toast.success(
        `Withdrawal ${
          action === 'mark_paid' ? 'marked paid' : action === 'approve' ? 'approved' : 'rejected'
        } successfully!`
      );
      setSelectedWithdrawal(null);
      resetModalFields();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process withdrawal');
    } finally {
      setProcessing(null);
    }
  }

  function resetModalFields() {
    setAdminNoteInput('');
    setTxIdInput('');
    setRefNumInput('');
    setPaymentNotesInput('');
    setProofUrlInput('');
  }

  // Handle Image File Upload to base64
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('File size exceeds 3MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setProofUrlInput(String(evt.target.result));
          toast.success('Screenshot uploaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Filter withdrawals by status and search query
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.userName?.toLowerCase().includes(q);
      const matchEmail = w.userEmail?.toLowerCase().includes(q);
      const matchMethod = (w.methodName || w.method)?.toLowerCase().includes(q);
      const matchId = w.id.toLowerCase().includes(q);
      return matchName || matchEmail || matchMethod || matchId;
    }
    return true;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const approvedCount = withdrawals.filter((w) => w.status === 'approved').length;
  const paidCount = withdrawals.filter((w) => w.status === 'paid').length;
  const rejectedCount = withdrawals.filter((w) => w.status === 'rejected').length;
  const failedCount = withdrawals.filter((w) => w.status === 'failed').length;

  const todayWithdrawals = withdrawals.filter((w) => w.requestedAt.startsWith(todayStr));
  const todayCount = todayWithdrawals.length;
  const paidToday = withdrawals
    .filter((w) => w.status === 'paid' && (w.paidAt || w.processedAt || '').startsWith(todayStr))
    .reduce((s, w) => s + w.amount, 0);

  const totalFeesCollected = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((s, w) => s + (w.fee || 0), 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enterprise Wallet & Finance"
        subtitle="Manage global withdrawal policies, inspect payout requests, upload payment proofs, and monitor platform reserves."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/wallet/withdrawal-settings">
              <Button size="sm" variant="outline" className="font-semibold">
                <Settings className="h-4 w-4 mr-1.5 text-primary" /> Withdrawal Settings
              </Button>
            </Link>

            <Link href="/admin/wallet/audit-logs">
              <Button size="sm" variant="outline" className="font-semibold">
                <ShieldCheck className="h-4 w-4 mr-1.5 text-blue-500" /> Audit Logs
              </Button>
            </Link>

            <Link href="/admin/wallet/reports">
              <Button size="sm" variant="outline" className="font-semibold">
                <BarChart2 className="h-4 w-4 mr-1.5 text-success" /> Reports
              </Button>
            </Link>

            <Link href="/admin/wallet/payment-methods">
              <Button size="sm" className="bg-brand-gradient font-semibold text-white">
                <Sliders className="h-4 w-4 mr-1.5" /> Payment Methods
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards Grid (8 Cards as requested) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending Requests" value={String(pendingCount)} color="text-warning" />
        <StatCard icon={TrendingUp} label="Today's Requests" value={String(todayCount)} color="text-primary" />
        <StatCard
          icon={IndianRupee}
          label="Platform Balance"
          value={`₹${formatINR(finance?.currentPlatformBalance || 0)}`}
          color="text-success"
        />
        <StatCard
          icon={Wallet}
          label="Reserved Balance"
          value={`₹${formatINR(finance?.reservedBalance || 0)}`}
          color="text-blue-500"
        />
        <StatCard icon={Check} label="Paid Today" value={`₹${formatINR(paidToday)}`} color="text-success" />
        <StatCard icon={IndianRupee} label="Fees Collected" value={`₹${formatINR(totalFeesCollected)}`} color="text-primary" />
        <StatCard
          icon={TrendingUp}
          label="Profit Today"
          value={`₹${formatINR(finance?.dailyProfit || 0)}`}
          color="text-success"
        />
        <StatCard icon={X} label="Failed / Rejected" value={String(rejectedCount + failedCount)} color="text-destructive" />
      </div>

      {/* Withdrawal Requests Section */}
      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Withdrawal Requests
              </CardTitle>
              <CardDescription>
                Filter by status, inspect dynamic user payment details, upload payment receipts, and process payouts.
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user, email, method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
            {(
              [
                { key: 'all', label: 'All', count: withdrawals.length },
                { key: 'pending', label: 'Pending', count: pendingCount },
                { key: 'approved', label: 'Approved', count: approvedCount },
                { key: 'paid', label: 'Paid', count: paidCount },
                { key: 'rejected', label: 'Rejected', count: rejectedCount },
                { key: 'failed', label: 'Failed', count: failedCount },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                variant={statusFilter === tab.key ? 'default' : 'ghost'}
                onClick={() => setStatusFilter(tab.key)}
                className={`h-8 text-xs font-medium rounded-lg ${
                  statusFilter === tab.key ? 'bg-brand-gradient text-white shadow-sm' : ''
                }`}
              >
                {tab.label}{' '}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                    statusFilter === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-1">
              <p className="font-medium">No withdrawal requests found matching criteria.</p>
              <p className="text-xs">Try selecting a different filter tab or clearing search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">User Details</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Submitted Info</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{w.userName || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{w.userEmail}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">UID: {w.uid.slice(0, 10)}…</p>
                      </td>

                      <td className="px-4 py-3 font-semibold font-mono text-foreground">
                        ₹{formatINR(w.amount)}
                        {w.fee ? (
                          <span className="block text-[10px] text-muted-foreground">Fee: ₹{formatINR(w.fee)}</span>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-semibold capitalize text-xs">
                          {w.methodName || w.method}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-xs space-y-0.5">
                        {w.upiId && <p><span className="text-muted-foreground">UPI:</span> <span className="font-mono">{w.upiId}</span></p>}
                        {w.bankName && <p><span className="text-muted-foreground">Bank:</span> {w.bankName}</p>}
                        {w.accountNumber && <p><span className="text-muted-foreground">Acc:</span> <span className="font-mono">{w.accountNumber}</span></p>}
                        {w.referenceNumber && <p className="text-success font-mono font-semibold">Ref: {w.referenceNumber}</p>}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`capitalize font-medium text-xs ${STATUS_STYLES[w.status] || ''}`}>
                          {w.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {new Date(w.requestedAt).toLocaleDateString('en-IN')}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedWithdrawal(w);
                              setAdminNoteInput(w.adminNote || '');
                              setTxIdInput(w.transactionId || '');
                              setRefNumInput(w.referenceNumber || '');
                              setPaymentNotesInput(w.paymentNotes || '');
                              setProofUrlInput(w.paymentProofUrl || '');
                            }}
                            className="h-8 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View / Process
                          </Button>

                          {w.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-success hover:text-success border-success/30 hover:bg-success/10"
                                disabled={processing === w.id}
                                onClick={() => process(w.id, 'approve')}
                              >
                                {processing === w.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                                disabled={processing === w.id}
                                onClick={() => process(w.id, 'reject')}
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}

                          {w.status === 'approved' && (
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-brand-gradient text-white"
                              disabled={processing === w.id}
                              onClick={() => {
                                setSelectedWithdrawal(w);
                                setAdminNoteInput(w.adminNote || '');
                                setTxIdInput(w.transactionId || '');
                                setRefNumInput(w.referenceNumber || '');
                              }}
                            >
                              <Upload className="h-3.5 w-3.5 mr-1" /> Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Action & Payment Proof Modal */}
      <Dialog
        open={!!selectedWithdrawal}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWithdrawal(null);
            resetModalFields();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Withdrawal Details & Payment Proof
            </DialogTitle>
            <DialogDescription>
              Review request parameters, enter reference numbers, upload proof screenshots, and perform administrative actions.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-6 text-sm">
              {/* User Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-secondary/30 rounded-xl">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">User Name</p>
                  <p className="font-semibold">{selectedWithdrawal.userName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Amount</p>
                  <p className="font-mono font-bold text-base text-primary">₹{formatINR(selectedWithdrawal.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
                  <Badge variant="outline" className={`capitalize text-xs ${STATUS_STYLES[selectedWithdrawal.status]}`}>
                    {selectedWithdrawal.status}
                  </Badge>
                </div>
              </div>

              {/* Payment Proof Form Section */}
              <div className="space-y-4 border-t border-border pt-4">
                <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                  <Upload className="h-4 w-4 text-primary" /> Payment Proof & Reference Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Transaction ID</Label>
                    <Input
                      placeholder="e.g. TXN-982341823"
                      value={txIdInput}
                      onChange={(e) => setTxIdInput(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Reference Number (UTR / Bank Ref)</Label>
                    <Input
                      placeholder="e.g. UTR4928104812"
                      value={refNumInput}
                      onChange={(e) => setRefNumInput(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Screenshot / Receipt URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Paste image URL or upload file..."
                      value={proofUrlInput}
                      onChange={(e) => setProofUrlInput(e.target.value)}
                      className="h-9 text-xs font-mono flex-1"
                    />
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" className="h-9 text-xs">
                        <ImageIcon className="h-3.5 w-3.5 mr-1" /> Upload
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {proofUrlInput && (
                  <div className="p-2 border border-border rounded-xl bg-muted/40 max-w-sm">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">Attached Proof Preview:</p>
                    <img src={proofUrlInput} alt="Payment Proof" className="max-h-48 w-full object-contain rounded-lg" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs">Admin Notes / Payment Notes</Label>
                  <Textarea
                    rows={2}
                    placeholder="Enter notes visible to user..."
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-4">
            {selectedWithdrawal?.status === 'pending' && (
              <div className="flex items-center justify-between w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={!!processing}
                  onClick={() => process(selectedWithdrawal.id, 'reject')}
                >
                  Reject & Refund
                </Button>
                <Button
                  size="sm"
                  className="bg-brand-gradient text-white"
                  disabled={!!processing}
                  onClick={() => process(selectedWithdrawal.id, 'approve')}
                >
                  Approve Request
                </Button>
              </div>
            )}

            {(selectedWithdrawal?.status === 'approved' || selectedWithdrawal?.status === 'pending') && (
              <Button
                className="bg-brand-gradient text-white font-semibold"
                size="sm"
                disabled={!!processing}
                onClick={() => process(selectedWithdrawal.id, 'mark_paid')}
              >
                Mark Paid & Save Proof
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
      <CardContent className="p-4">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ${color}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="mt-2.5 font-display text-xl font-bold">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
