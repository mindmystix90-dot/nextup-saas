'use client';

import { useEffect, useState } from 'react';
import {
  User as UserIcon, CreditCard, BookOpen, Wallet, Receipt, Users as AffiliateIcon,
  ShieldCheck, ArrowDownCircle, ArrowUpCircle, Loader2, Plus, X, CheckCircle2, Lock,
  RotateCcw, Ban, KeyRound, Check, XCircle, Banknote, Calendar,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { authService, fetchProfile } from '@/services/auth.service';
import {
  fetchCourses, fetchUserPurchasedCourses, adminAssignPurchasedCourse, adminRemovePurchasedCourse,
  syncUserAccessibleCourses, fetchUserCourseAccess, fetchUserCourseProgress,
  adminResetCourseProgress, type Course,
} from '@/services/courses.service';
import {
  fetchWallet, adminCreditWallet, adminDebitWallet, fetchTransactions, fetchKyc, adminUpdateKyc,
  adminUpdateKycStatus, fetchWithdrawals,
} from '@/services/wallet.service';
import { fetchAffiliateStats, adminSetAffiliateEnabled, adminAdjustCommission, adminSetCommissionRate } from '@/services/affiliate.service';
import { fetchUserPayments } from '@/services/admin.service';
import type {
  Role, Membership, MembershipStatus, FirestoreProfile, CourseProgressRecord,
  WalletData, WalletTransaction, KycInfo, Withdrawal, Payment, AffiliateStats,
} from '@/types';

const ROLE_OPTIONS: Role[] = ['superadmin', 'admin', 'instructor', 'student', 'affiliate', 'user'];
const MEMBERSHIP_OPTIONS: Membership[] = ['starter', 'pro', 'lifetime'];

function membershipLabel(m: Membership): string { return m.charAt(0).toUpperCase() + m.slice(1); }
function initials(name: string): string {
  return (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}
function formatDate(iso?: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; }
}
function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

interface Props {
  user: FirestoreProfile;
  onClose: () => void;
  onSaved: () => void;
}

export function UserControlCenter({ user, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '', email: user.email || '', phone: user.phone || '',
    address: user.address || '', photoURL: user.photoURL || '',
    role: user.role || 'student' as Role, suspended: !!user.suspended,
  membership: user.membership || 'starter' as Membership,
  membershipStart: user.membershipStart || '',
    membershipExpiry: user.membershipExpiry || '',
    membershipStatus: user.membershipStatus || 'active' as MembershipStatus,
  });

  // Courses
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [accessibleIds, setAccessibleIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<CourseProgressRecord[]>([]);
  const [assignCourseId, setAssignCourseId] = useState('');

  // Wallet
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  // KYC
  const [kyc, setKyc] = useState<KycInfo | null>(null);
  const [kycForm, setKycForm] = useState({ accountHolder: '', bankName: '', accountNumber: '', ifsc: '', upiId: '', status: 'pending' as KycInfo['status'] });

  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);

  // Affiliate
  const [affiliate, setAffiliate] = useState<AffiliateStats | null>(null);
  const [commissionRate, setCommissionRate] = useState('');

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    (async () => {
      try { setAllCourses(await fetchCourses()); } catch { /* best-effort */ }
      try {
        const [p, a, prog] = await Promise.all([
          fetchUserPurchasedCourses(user.uid),
          fetchUserCourseAccess(user.uid),
          fetchUserCourseProgress(user.uid),
        ]);
        setPurchasedIds(p);
        setAccessibleIds(a);
        setProgress(prog);
        setCompletedIds(prog.filter((r) => r.status === 'completed').map((r) => r.courseId));
      } catch { /* best-effort */ }
      try { setWallet(await fetchWallet(user.uid)); } catch { /* best-effort */ }
      try { setTransactions(await fetchTransactions(user.uid)); } catch { /* best-effort */ }
      try {
        const k = await fetchKyc(user.uid);
        setKyc(k);
        if (k) setKycForm({
          accountHolder: k.accountHolder, bankName: k.bankName, accountNumber: k.accountNumber,
          ifsc: k.ifsc, upiId: k.upiId || '', status: k.status,
        });
      } catch { /* best-effort */ }
      try { setPayments(await fetchUserPayments(user.uid)); } catch { /* best-effort */ }
      try {
        const aff = await fetchAffiliateStats(user.uid);
        setAffiliate(aff);
        setCommissionRate(String(aff.commissionRate ?? 10));
      } catch { /* best-effort */ }
      try { setWithdrawals(await fetchWithdrawals(user.uid)); } catch { /* best-effort */ }
    })();
  }, [user.uid]);

  async function saveGeneral() {
    setSaving(true);
    try {
      await authService.adminUpdateUser(user.uid, {
        name: form.name, email: form.email, phone: form.phone, address: form.address,
        photoURL: form.photoURL, role: form.role, suspended: form.suspended,
      });
      toast.success('Profile updated');
      onSaved();
    } catch { toast.error('Failed to update profile'); } finally { setSaving(false); }
  }

  async function resetPassword() {
    if (!form.email) { toast.error('No email on file'); return; }
    try { await authService.adminResetPassword(form.email); toast.success('Password reset email sent'); }
    catch { toast.error('Failed to send reset email'); }
  }

  async function saveMembership() {
    setSaving(true);
    try {
      await authService.adminSetMembership(user.uid, form.membership, {
        start: form.membershipStart, expiry: form.membershipExpiry, status: form.membershipStatus,
      });
      const p = await fetchUserPurchasedCourses(user.uid);
      const a = await syncUserAccessibleCourses(user.uid, form.membership, p);
      setAccessibleIds(a);
      toast.success('Membership updated');
      onSaved();
    } catch { toast.error('Failed to update membership'); } finally { setSaving(false); }
  }

  async function extendMembership(days: number) {
    setSaving(true);
    try {
      await authService.adminExtendMembership(user.uid, form.membership, days);
      const prof = await fetchProfile(user.uid);
      if (prof) {
        setForm((f) => ({ ...f, membershipExpiry: prof.membershipExpiry || '', membershipStatus: prof.membershipStatus || 'active' }));
      }
      toast.success(`Membership extended by ${days} days`);
      onSaved();
    } catch { toast.error('Failed to extend membership'); } finally { setSaving(false); }
  }

  async function cancelMembership() {
    setSaving(true);
    try {
      await authService.adminCancelMembership(user.uid);
      setForm((f) => ({ ...f, membershipStatus: 'cancelled', membershipExpiry: new Date().toISOString() }));
      const p = await fetchUserPurchasedCourses(user.uid);
      const a = await syncUserAccessibleCourses(user.uid, 'starter', p);
      setAccessibleIds(a);
      toast.success('Membership cancelled');
      onSaved();
    } catch { toast.error('Failed to cancel membership'); } finally { setSaving(false); }
  }

  async function handleAssignCourse() {
    if (!assignCourseId) return;
    try {
      await adminAssignPurchasedCourse(user.uid, assignCourseId);
      const p = await fetchUserPurchasedCourses(user.uid);
      setPurchasedIds(p);
      const a = await syncUserAccessibleCourses(user.uid, form.membership, p);
      setAccessibleIds(a);
      setAssignCourseId('');
      toast.success('Course assigned');
    } catch { toast.error('Failed to assign course'); }
  }

  async function handleRemoveCourse(courseId: string) {
    try {
      await adminRemovePurchasedCourse(user.uid, courseId);
      const p = await fetchUserPurchasedCourses(user.uid);
      setPurchasedIds(p);
      const a = await syncUserAccessibleCourses(user.uid, form.membership, p);
      setAccessibleIds(a);
      toast.success('Course removed');
    } catch { toast.error('Failed to remove course'); }
  }

  async function handleResetProgress(courseId: string) {
    try {
      await adminResetCourseProgress(user.uid, courseId);
      setProgress((prev) => prev.filter((r) => r.courseId !== courseId));
      setCompletedIds((prev) => prev.filter((id) => id !== courseId));
      toast.success('Progress reset');
    } catch { toast.error('Failed to reset progress'); }
  }

  async function handleWalletAction(type: 'credit' | 'debit') {
    const amount = Number(walletAmount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      if (type === 'credit') await adminCreditWallet(user.uid, amount, walletReason || 'Admin credit');
      else await adminDebitWallet(user.uid, amount, walletReason || 'Admin debit');
      setWallet(await fetchWallet(user.uid));
      setTransactions(await fetchTransactions(user.uid));
      setWalletAmount(''); setWalletReason('');
      toast.success(`Wallet ${type === 'credit' ? 'credited' : 'debited'}`);
    } catch (e) { toast.error((e as Error).message || 'Wallet action failed'); } finally { setSaving(false); }
  }

  async function saveKyc() {
    setSaving(true);
    try {
      await adminUpdateKyc(user.uid, {
        accountHolder: kycForm.accountHolder, bankName: kycForm.bankName,
        accountNumber: kycForm.accountNumber, ifsc: kycForm.ifsc, upiId: kycForm.upiId,
        status: kycForm.status,
      });
      setKyc(await fetchKyc(user.uid));
      toast.success('KYC updated');
    } catch { toast.error('Failed to update KYC'); } finally { setSaving(false); }
  }

  async function approveKyc() {
    setSaving(true);
    try {
      await adminUpdateKycStatus(user.uid, 'verified');
      setKyc(await fetchKyc(user.uid));
      setKycForm((f) => ({ ...f, status: 'verified' }));
      toast.success('KYC approved');
    } catch { toast.error('Failed to approve KYC'); } finally { setSaving(false); }
  }

  async function rejectKyc() {
    setSaving(true);
    try {
      await adminUpdateKycStatus(user.uid, 'rejected');
      setKyc(await fetchKyc(user.uid));
      setKycForm((f) => ({ ...f, status: 'rejected' }));
      toast.success('KYC rejected');
    } catch { toast.error('Failed to reject KYC'); } finally { setSaving(false); }
  }

  async function toggleAffiliate(enabled: boolean) {
    setSaving(true);
    try {
      await adminSetAffiliateEnabled(user.uid, enabled);
      setAffiliate(await fetchAffiliateStats(user.uid));
      toast.success(`Affiliate ${enabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle affiliate'); } finally { setSaving(false); }
  }

  async function saveCommissionRate() {
    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0) { toast.error('Enter a valid rate'); return; }
    setSaving(true);
    try {
      await adminSetCommissionRate(user.uid, rate);
      setAffiliate(await fetchAffiliateStats(user.uid));
      toast.success('Commission rate updated');
    } catch { toast.error('Failed to update commission'); } finally { setSaving(false); }
  }

  const membershipCourses = accessibleIds.filter((id) => !purchasedIds.includes(id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Avatar className="h-14 w-14">
          {form.photoURL && <AvatarImage src={form.photoURL} alt={form.name} />}
          <AvatarFallback className="bg-brand-gradient text-white font-semibold">{initials(form.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg truncate">{form.name || 'Unnamed'}</p>
          <p className="text-sm text-muted-foreground truncate">{form.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={form.membership === 'lifetime' ? 'default' : 'secondary'} className="capitalize">{membershipLabel(form.membership)}</Badge>
          <Badge variant={form.suspended ? 'destructive' : 'outline'}>{form.suspended ? 'Suspended' : 'Active'}</Badge>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-9 h-auto p-1">
          <TabsTrigger value="general" className="text-xs gap-1"><UserIcon className="h-3.5 w-3.5" /> General</TabsTrigger>
          <TabsTrigger value="membership" className="text-xs gap-1"><CreditCard className="h-3.5 w-3.5" /> Membership</TabsTrigger>
          <TabsTrigger value="courses" className="text-xs gap-1"><BookOpen className="h-3.5 w-3.5" /> Courses</TabsTrigger>
          <TabsTrigger value="wallet" className="text-xs gap-1"><Wallet className="h-3.5 w-3.5" /> Wallet</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1"><Receipt className="h-3.5 w-3.5" /> Payments</TabsTrigger>
          <TabsTrigger value="affiliate" className="text-xs gap-1"><AffiliateIcon className="h-3.5 w-3.5" /> Affiliate</TabsTrigger>
          <TabsTrigger value="kyc" className="text-xs gap-1"><ShieldCheck className="h-3.5 w-3.5" /> KYC</TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs gap-1"><Banknote className="h-3.5 w-3.5" /> Withdrawals</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1"><KeyRound className="h-3.5 w-3.5" /> Security</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Profile photo URL</Label>
            <Input value={form.photoURL} onChange={(e) => setForm((f) => ({ ...f, photoURL: e.target.value }))} placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.suspended ? 'suspended' : 'active'} onValueChange={(v) => setForm((f) => ({ ...f, suspended: v === 'suspended' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={saveGeneral} disabled={saving} className="bg-brand-gradient font-semibold">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save profile
          </Button>
        </TabsContent>

        {/* MEMBERSHIP */}
        <TabsContent value="membership" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoTile label="Current membership" value={membershipLabel(form.membership)} />
            <InfoTile label="Status" value={form.membershipStatus || 'active'} className="capitalize" />
            <InfoTile label="Start date" value={formatDate(form.membershipStart)} />
            <InfoTile label="Expiry date" value={formatDate(form.membershipExpiry)} />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Membership level</Label>
              <Select value={form.membership} onValueChange={(v) => setForm((f) => ({ ...f, membership: v as Membership }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MEMBERSHIP_OPTIONS.map((m) => <SelectItem key={m} value={m} className="capitalize">{membershipLabel(m)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={form.membershipStatus} onValueChange={(v) => setForm((f) => ({ ...f, membershipStatus: v as MembershipStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Start date</Label>
              <Input type="date" value={form.membershipStart ? form.membershipStart.slice(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, membershipStart: e.target.value ? new Date(e.target.value).toISOString() : '' }))} />
            </div>
            <div className="space-y-2"><Label>Expiry date</Label>
              <Input type="date" value={form.membershipExpiry ? form.membershipExpiry.slice(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, membershipExpiry: e.target.value ? new Date(e.target.value).toISOString() : '' }))} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveMembership} disabled={saving} className="bg-brand-gradient font-semibold">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save membership
            </Button>
            <Button variant="outline" onClick={() => extendMembership(30)} disabled={saving}><Calendar className="mr-2 h-4 w-4" /> +30 days</Button>
            <Button variant="outline" onClick={() => extendMembership(365)} disabled={saving}><Calendar className="mr-2 h-4 w-4" /> +1 year</Button>
            <Button variant="destructive" onClick={cancelMembership} disabled={saving}><Ban className="mr-2 h-4 w-4" /> Cancel membership</Button>
          </div>
        </TabsContent>

        {/* COURSES */}
        <TabsContent value="courses" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoTile label="Purchased" value={String(purchasedIds.length)} />
            <InfoTile label="Membership" value={String(membershipCourses.length)} />
            <InfoTile label="Completed" value={String(completedIds.length)} />
            <InfoTile label="Accessible" value={String(accessibleIds.length)} />
          </div>
          <Separator />
          {/* Assign */}
          <div className="flex items-center gap-2">
            <Select value={assignCourseId} onValueChange={setAssignCourseId}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Assign a course…" /></SelectTrigger>
              <SelectContent>
                {allCourses.filter((c) => !purchasedIds.includes(c.id)).map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAssignCourse} disabled={!assignCourseId} className="bg-brand-gradient font-semibold"><Plus className="h-4 w-4" /> Assign</Button>
          </div>

          {/* Purchased courses */}
          <CourseSection title="Purchased courses" ids={purchasedIds} courses={allCourses} onRemove={handleRemoveCourse} badge="Purchased" />

          {/* Membership courses */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Membership courses ({membershipCourses.length})</p>
            {membershipCourses.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No membership-only courses.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {membershipCourses.map((id) => {
                  const c = allCourses.find((x) => x.id === id);
                  return <Badge key={id} variant="secondary" className="text-xs">{c?.title || id.slice(0, 12)}</Badge>;
                })}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress ({progress.length})</p>
            {progress.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No course progress recorded.</p>
            ) : (
              <div className="space-y-1.5">
                {progress.map((r) => (
                  <div key={r.courseId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{r.courseTitle || r.courseId.slice(0, 12)}</p>
                      <p className="text-xs text-muted-foreground">{r.progress}% · {r.completedLessons}/{r.totalLessons} lessons · {r.status}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleResetProgress(r.courseId)} className="text-destructive h-7">
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* WALLET */}
        <TabsContent value="wallet" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoTile label="Available balance" value={`₹${formatINR(wallet?.balance || 0)}`} />
            <InfoTile label="Pending" value={`₹${formatINR(wallet?.pendingWithdrawals || 0)}`} />
            <InfoTile label="Lifetime earnings" value={`₹${formatINR(wallet?.lifetimeEarnings || 0)}`} />
            <InfoTile label="Completed withdrawals" value={`₹${formatINR(wallet?.completedWithdrawals || 0)}`} />
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-2 items-end">
            <div className="space-y-2 col-span-1"><Label>Amount (₹)</Label><Input type="number" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} placeholder="0" /></div>
            <div className="space-y-2 col-span-2"><Label>Reason</Label><Input value={walletReason} onChange={(e) => setWalletReason(e.target.value)} placeholder="Adjustment reason…" /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleWalletAction('credit')} disabled={saving} className="bg-brand-gradient font-semibold"><ArrowDownCircle className="mr-2 h-4 w-4" /> Credit</Button>
            <Button onClick={() => handleWalletAction('debit')} disabled={saving} variant="outline"><ArrowUpCircle className="mr-2 h-4 w-4" /> Debit</Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transactions ({transactions.length})</p>
            {transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No transactions.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs">
                    <span className="flex-1 truncate">{t.label}</span>
                    <span className={t.amount >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>{t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}</span>
                    <Badge variant="outline" className="text-xs">{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No payment records.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.itemName}</p>
                    <p className="text-muted-foreground capitalize">{p.type} · {p.method} · {formatDate(p.date)}</p>
                  </div>
                  <span className="font-semibold">₹{formatINR(p.amount)}</span>
                  <Badge variant={p.status === 'completed' ? 'default' : 'outline'} className="capitalize">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AFFILIATE */}
        <TabsContent value="affiliate" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoTile label="Enabled" value={affiliate?.enabled ? 'Yes' : 'No'} />
            <InfoTile label="Referral code" value={affiliate?.referralCode || '—'} />
            <InfoTile label="Clicks" value={String(affiliate?.clicks || 0)} />
            <InfoTile label="Registrations" value={String(affiliate?.registrations || 0)} />
            <InfoTile label="Sales" value={String(affiliate?.sales || 0)} />
            <InfoTile label="Pending" value={`₹${formatINR(affiliate?.pendingCommission || 0)}`} />
            <InfoTile label="Paid" value={`₹${formatINR(affiliate?.paidCommission || 0)}`} />
            <InfoTile label="Rate" value={`${affiliate?.commissionRate ?? 10}%`} />
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <div className="space-y-2 w-32"><Label>Commission rate (%)</Label><Input type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} /></div>
            <Button onClick={saveCommissionRate} disabled={saving} className="bg-brand-gradient font-semibold self-end">Update rate</Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => toggleAffiliate(true)} disabled={saving || affiliate?.enabled} variant="outline"><Check className="mr-2 h-4 w-4" /> Enable</Button>
            <Button onClick={() => toggleAffiliate(false)} disabled={saving || !affiliate?.enabled} variant="outline"><X className="mr-2 h-4 w-4" /> Disable</Button>
          </div>
        </TabsContent>

        {/* KYC */}
        <TabsContent value="kyc" className="space-y-4 mt-4">
          <InfoTile label="Current status" value={kyc?.status || 'not submitted'} className="capitalize" />
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Account holder</Label><Input value={kycForm.accountHolder} onChange={(e) => setKycForm((f) => ({ ...f, accountHolder: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Bank name</Label><Input value={kycForm.bankName} onChange={(e) => setKycForm((f) => ({ ...f, bankName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Account number</Label><Input value={kycForm.accountNumber} onChange={(e) => setKycForm((f) => ({ ...f, accountNumber: e.target.value }))} /></div>
            <div className="space-y-2"><Label>IFSC</Label><Input value={kycForm.ifsc} onChange={(e) => setKycForm((f) => ({ ...f, ifsc: e.target.value }))} /></div>
            <div className="space-y-2"><Label>UPI ID</Label><Input value={kycForm.upiId} onChange={(e) => setKycForm((f) => ({ ...f, upiId: e.target.value }))} /></div>
            <div className="space-y-2"><Label>KYC status</Label>
              <Select value={kycForm.status} onValueChange={(v) => setKycForm((f) => ({ ...f, status: v as KycInfo['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveKyc} disabled={saving} className="bg-brand-gradient font-semibold">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save KYC</Button>
            <Button onClick={approveKyc} disabled={saving} variant="outline"><CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Approve</Button>
            <Button onClick={rejectKyc} disabled={saving} variant="outline"><XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject</Button>
          </div>
        </TabsContent>

        {/* WITHDRAWALS */}
        <TabsContent value="withdrawals" className="space-y-4 mt-4">
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No withdrawal requests.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center gap-3 rounded-lg border border-border p-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">₹{formatINR(w.amount)} · {w.method.toUpperCase()}</p>
                    <p className="text-muted-foreground">Requested {formatDate(w.requestedAt)} · Paid {formatDate(w.processedAt)}</p>
                  </div>
                  <Badge variant={w.status === 'paid' ? 'default' : 'outline'} className="capitalize">{w.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card className="card-premium">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Password reset</p></div>
              <p className="text-xs text-muted-foreground">Sends a password reset email to {form.email || 'the user'}.</p>
              <Button onClick={resetPassword} variant="outline" size="sm"><KeyRound className="mr-2 h-4 w-4" /> Send reset email</Button>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2"><Ban className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Account status</p></div>
              <p className="text-xs text-muted-foreground">{form.suspended ? 'Account is currently suspended.' : 'Account is active.'}</p>
              <Button onClick={() => { setForm((f) => ({ ...f, suspended: !f.suspended })); saveGeneral(); }} variant={form.suspended ? 'default' : 'destructive'} size="sm">
                {form.suspended ? 'Reactivate account' : 'Suspend account'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

function InfoTile({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${className || ''}`}>{value}</p>
    </div>
  );
}

function CourseSection({ title, ids, courses, onRemove, badge }: { title: string; ids: string[]; courses: Course[]; onRemove: (id: string) => void; badge: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title} ({ids.length})</p>
      {ids.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">None.</p>
      ) : (
        <div className="space-y-1.5">
          {ids.map((id) => {
            const c = courses.find((x) => x.id === id);
            return (
              <div key={id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span className="flex-1 text-xs font-medium truncate">{c?.title || id.slice(0, 12)}</span>
                <Badge variant="secondary" className="text-xs">{badge}</Badge>
                <button onClick={() => onRemove(id)} className="text-destructive hover:bg-destructive/10 rounded p-1"><X className="h-3.5 w-3.5" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
