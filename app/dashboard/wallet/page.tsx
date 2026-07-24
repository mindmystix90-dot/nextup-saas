'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
  Receipt,
  Eye,
  Calendar,
  BarChart3,
  Search,
  Filter,
  ArrowRight,
  Award,
  Users,
  Briefcase,
  History,
  Activity,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { subscribeSubmissionsForUser } from '@/services/microtasks.service';
import { subscribeAffiliateStats } from '@/services/affiliate.service';
import type {
  WalletData,
  WalletTransaction,
  Withdrawal,
  KycInfo,
  SystemSettings,
  PaymentMethodConfig,
  MicrotaskSubmission,
  AffiliateStats,
} from '@/types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-success/10 text-success border-success/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

function parseTxnDate(t: WalletTransaction): Date {
  if ((t as any).createdAt) {
    const ca = (t as any).createdAt;
    if (typeof ca === 'object' && ca !== null && 'seconds' in ca) {
      return new Date(ca.seconds * 1000);
    }
    const parsed = new Date(ca);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (t.timestamp) {
    const parsed = new Date(t.timestamp);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (t.date) {
    if (typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
      const [y, m, d] = t.date.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(t.date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function getDaysAgo(d: Date): number {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.max(0, Math.floor((todayStart - targetStart) / (1000 * 60 * 60 * 24)));
}

export default function WalletPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Realtime Data States
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [submissions, setSubmissions] = useState<MicrotaskSubmission[]>([]);
  const [affiliate, setAffiliate] = useState<AffiliateStats | null>(null);
  const [kyc, setKyc] = useState<KycInfo | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // UI Interactive States
  const [chartTimeframe, setChartTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'growth'>('daily');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'credits' | 'debits' | 'withdrawals' | 'affiliate' | 'microtasks' | 'bonuses' | 'refunds'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Withdrawal Dialog State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedProofWithdrawal, setSelectedProofWithdrawal] = useState<Withdrawal | null>(null);
  const [isMicrotask, setIsMicrotask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [dynamicDetails, setDynamicDetails] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    // 1. Subscribe to System Settings
    const unsubSettings = subscribeSystemSettings((s) => setSettings(s));

    // 2. Subscribe to Wallet real-time
    const unsubWallet = subscribeWallet(user.uid, (w) => {
      setWallet(w);
      setLoading(false);
    });

    // 3. Subscribe to Transactions real-time
    const unsubTxns = subscribeTransactions(user.uid, (t) => {
      setTransactions(t);
      setLoading(false);
    });

    // 4. Subscribe to Withdrawals real-time
    const unsubWithdrawals = subscribeWithdrawals(user.uid, (wd) => setWithdrawals(wd));

    // 5. Subscribe to Microtask Submissions real-time
    const unsubSubmissions = subscribeSubmissionsForUser(user.uid, (subs) => setSubmissions(subs));

    // 6. Subscribe to Affiliate Stats real-time
    const unsubAffiliate = subscribeAffiliateStats(user.uid, (aff) => setAffiliate(aff));

    // 7. Subscribe to Payment Methods real-time
    const unsubMethods = subscribePaymentMethods((methods) => {
      const enabledOnly = methods.filter((m) => m.enabled);
      setPaymentMethods(enabledOnly);
      if (enabledOnly.length > 0 && !selectedMethodId) {
        setSelectedMethodId(enabledOnly[0].id);
      }
    });

    // 8. Fetch KYC details
    (async () => {
      try {
        const k = await fetchKyc(user.uid);
        setKyc(k);
      } catch {
        /* best-effort */
      }
    })();

    return () => {
      unsubSettings();
      unsubWallet();
      unsubTxns();
      unsubWithdrawals();
      unsubSubmissions();
      unsubAffiliate();
      unsubMethods();
    };
  }, [user?.uid, selectedMethodId]);

  // Selected Payment Method Object
  const currentMethod =
    paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];

  // Pre-fill dynamic details from KYC whenever method or KYC changes
  useEffect(() => {
    if (!currentMethod || !kyc) return;

    setDynamicDetails((prev) => {
      const initialDetails: Record<string, string> = { ...prev };
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
      return initialDetails;
    });
  }, [selectedMethodId, kyc, currentMethod]);

  // ===== COMPUTED REALTIME STATS (ZERO DEMO DATA) =====
  const balance = wallet?.balance ?? 0;

  // Completed incoming earning transactions
  const earningTransactions = useMemo(() => {
    return transactions.filter((t) => t.amount > 0 && t.status !== 'failed');
  }, [transactions]);

  // Today's Earnings
  const todayEarnings = useMemo(() => {
    return earningTransactions
      .filter((t) => getDaysAgo(parseTxnDate(t)) === 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [earningTransactions]);

  // Last 7 Days Earnings
  const last7DaysEarnings = useMemo(() => {
    return earningTransactions
      .filter((t) => getDaysAgo(parseTxnDate(t)) <= 6)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [earningTransactions]);

  // Last 28 Days Earnings
  const last28DaysEarnings = useMemo(() => {
    return earningTransactions
      .filter((t) => getDaysAgo(parseTxnDate(t)) <= 27)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [earningTransactions]);

  // Lifetime Earnings
  const lifetimeEarnings = useMemo(() => {
    const totalFromTxns = earningTransactions.reduce((sum, t) => sum + t.amount, 0);
    return Math.max(wallet?.lifetimeEarnings ?? 0, totalFromTxns);
  }, [earningTransactions, wallet?.lifetimeEarnings]);

  // Pending Earnings (Pending microtasks + pending affiliate commissions + pending bonus)
  const pendingEarnings = useMemo(() => {
    const pendingSubs = submissions
      .filter((s) => s.status === 'submitted' || s.status === 'pending_provider')
      .reduce((sum, s) => sum + (s.reward || 0), 0);
    const pendingAff = affiliate?.pendingCommission ?? 0;
    const pendingTxns = transactions
      .filter((t) => t.status === 'pending' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return pendingSubs + pendingAff + pendingTxns + (wallet?.pendingBalance ?? 0);
  }, [submissions, affiliate?.pendingCommission, transactions, wallet?.pendingBalance]);

  // Total Withdrawn
  const completedWithdrawals = useMemo(() => {
    const fromWithdrawalsReqs = withdrawals
      .filter((w) => w.status === 'paid' || w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);
    return Math.max(wallet?.completedWithdrawals ?? 0, fromWithdrawalsReqs);
  }, [withdrawals, wallet?.completedWithdrawals]);

  // Pending Withdrawals
  const pendingWithdrawalsAmount = useMemo(() => {
    const fromReqs = withdrawals
      .filter((w) => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);
    return Math.max(wallet?.pendingWithdrawals ?? 0, fromReqs);
  }, [withdrawals, wallet?.pendingWithdrawals]);

  // Analytics Metrics
  const highestReward = useMemo(() => {
    if (earningTransactions.length === 0) return 0;
    return Math.max(...earningTransactions.map((t) => t.amount));
  }, [earningTransactions]);

  const completedTasksCount = useMemo(() => {
    return earningTransactions.filter(
      (t) => t.type === 'microtask' || t.label.toLowerCase().includes('microtask') || t.label.toLowerCase().includes('task')
    ).length;
  }, [earningTransactions]);

  const affiliateSalesCount = useMemo(() => {
    return earningTransactions.filter(
      (t) => t.type === 'referral' || t.type === 'referral_commission' || t.label.toLowerCase().includes('affiliate') || t.label.toLowerCase().includes('referral')
    ).length;
  }, [earningTransactions]);

  const avgDailyEarnings = useMemo(() => {
    return Math.round(last28DaysEarnings / 28);
  }, [last28DaysEarnings]);

  // ===== EARNINGS TIMELINE GROUPS =====
  const timelineGroups = useMemo(() => {
    const groups: {
      today: WalletTransaction[];
      yesterday: WalletTransaction[];
      last7Days: WalletTransaction[];
      last28Days: WalletTransaction[];
      older: WalletTransaction[];
    } = {
      today: [],
      yesterday: [],
      last7Days: [],
      last28Days: [],
      older: [],
    };

    const sorted = [...transactions].sort((a, b) => parseTxnDate(b).getTime() - parseTxnDate(a).getTime());

    for (const t of sorted) {
      const days = getDaysAgo(parseTxnDate(t));
      if (days === 0) groups.today.push(t);
      else if (days === 1) groups.yesterday.push(t);
      else if (days <= 6) groups.last7Days.push(t);
      else if (days <= 27) groups.last28Days.push(t);
      else groups.older.push(t);
    }

    return groups;
  }, [transactions]);

  // ===== FILTERED TRANSACTIONS HISTORY =====
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter type
      if (historyFilter === 'credits' && t.amount <= 0) return false;
      if (historyFilter === 'debits' && t.amount >= 0) return false;
      if (historyFilter === 'withdrawals' && t.type !== 'withdrawal') return false;
      if (historyFilter === 'affiliate' && t.type !== 'referral' && t.type !== 'referral_commission') return false;
      if (historyFilter === 'microtasks' && t.type !== 'microtask') return false;
      if (historyFilter === 'bonuses' && t.type !== 'bonus' && t.type !== 'daily_reward') return false;
      if (historyFilter === 'refunds' && t.type !== 'refund') return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLabel = t.label.toLowerCase().includes(q);
        const matchesAmount = String(t.amount).includes(q);
        const matchesRef = (t.referenceId || '').toLowerCase().includes(q);
        const matchesId = (t.id || '').toLowerCase().includes(q);
        const matchesType = (t.type || '').toLowerCase().includes(q);
        const matchesDate = (t.date || '').includes(q);
        const matchesStatus = (t.status || '').toLowerCase().includes(q);
        return matchesLabel || matchesAmount || matchesRef || matchesId || matchesType || matchesDate || matchesStatus;
      }

      return true;
    });
  }, [transactions, historyFilter, searchQuery]);

  // ===== CHART DATA GENERATION =====
  const chartData = useMemo(() => {
    if (earningTransactions.length === 0) return [];

    if (chartTimeframe === 'daily') {
      // Past 7 Days
      const daysMap = new Map<string, { label: string; earnings: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-IN', { weekday: 'short' });
        daysMap.set(dateStr, { label: dayLabel, earnings: 0 });
      }

      for (const t of earningTransactions) {
        const dStr = parseTxnDate(t).toISOString().split('T')[0];
        if (daysMap.has(dStr)) {
          daysMap.get(dStr)!.earnings += t.amount;
        }
      }

      return Array.from(daysMap.values());
    }

    if (chartTimeframe === 'weekly') {
      // Past 4 Weeks
      const weeks = [
        { label: '3 Wks Ago', start: 21, end: 27, earnings: 0 },
        { label: '2 Wks Ago', start: 14, end: 20, earnings: 0 },
        { label: 'Last Week', start: 7, end: 13, earnings: 0 },
        { label: 'This Week', start: 0, end: 6, earnings: 0 },
      ];

      for (const t of earningTransactions) {
        const days = getDaysAgo(parseTxnDate(t));
        const w = weeks.find((item) => days >= item.start && days <= item.end);
        if (w) w.earnings += t.amount;
      }

      return weeks.map((w) => ({ label: w.label, earnings: w.earnings }));
    }

    if (chartTimeframe === 'monthly') {
      // Past 6 Months
      const monthsMap = new Map<string, { label: string; earnings: number }>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const mLabel = d.toLocaleDateString('en-IN', { month: 'short' });
        monthsMap.set(mKey, { label: mLabel, earnings: 0 });
      }

      for (const t of earningTransactions) {
        const pDate = parseTxnDate(t);
        const mKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthsMap.has(mKey)) {
          monthsMap.get(mKey)!.earnings += t.amount;
        }
      }

      return Array.from(monthsMap.values());
    }

    if (chartTimeframe === 'growth') {
      // Cumulative balance growth over time
      const sorted = [...transactions]
        .sort((a, b) => parseTxnDate(a).getTime() - parseTxnDate(b).getTime());

      let current = 0;
      const dataPoints: { label: string; balance: number }[] = [];

      for (const t of sorted) {
        current += t.amount;
        const label = parseTxnDate(t).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        dataPoints.push({ label, balance: Math.max(0, current) });
      }

      return dataPoints.slice(-15); // Return up to last 15 points
    }

    return [];
  }, [earningTransactions, transactions, chartTimeframe]);

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
  const kycVerified = kyc?.status === 'verified';
  const hasNoEarnings = earningTransactions.length === 0 && balance === 0;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary shadow-sm">
              <Wallet className="h-5 w-5" />
            </span>
            Unified Earnings Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time tracking of microtasks, course sales, affiliate commissions, bonuses, and payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-brand-gradient font-semibold shadow-md hover:opacity-95"
            disabled={!settings.walletEnabled || balance < minWithdrawal}
            onClick={() => {
              if (!kycVerified) {
                toast.error('Please complete KYC verification before requesting withdrawal');
                return;
              }
              setShowWithdraw(true);
            }}
          >
            <PiggyBank className="mr-2 h-4 w-4" /> Request Payout
          </Button>
        </div>
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

      {/* NEW USER EMPTY STATE CALLOUT */}
      {hasNoEarnings && (
        <Card className="card-premium mb-6 border-primary/20 bg-gradient-to-r from-primary/5 via-card to-emerald-500/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">Start Your Earnings Journey!</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You haven&apos;t earned anything yet. Complete your first task or invite friends to start earning real payouts instantly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-medium text-xs h-9">
                <Link href="/dashboard/microtasks">
                  <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Complete Microtasks
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-xs h-9">
                <Link href="/dashboard/affiliate">
                  <Users className="mr-1.5 h-3.5 w-3.5 text-primary" /> Invite Friends
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* REALTIME WALLET SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <StatCard icon={Wallet} label="Current Wallet" value={`₹${formatINR(balance)}`} color="text-primary" bg="bg-primary/10" subtitle="Available Balance" />
        <StatCard icon={TrendingUp} label="Today's Earnings" value={`₹${formatINR(todayEarnings)}`} color="text-emerald-500" bg="bg-emerald-500/10" subtitle="Resets Daily" />
        <StatCard icon={Calendar} label="Last 7 Days" value={`₹${formatINR(last7DaysEarnings)}`} color="text-blue-500" bg="bg-blue-500/10" subtitle="Past 7 Days" />
        <StatCard icon={BarChart3} label="Last 28 Days" value={`₹${formatINR(last28DaysEarnings)}`} color="text-indigo-500" bg="bg-indigo-500/10" subtitle="Past 28 Days" />
        <StatCard icon={IndianRupee} label="Lifetime" value={`₹${formatINR(lifetimeEarnings)}`} color="text-violet-500" bg="bg-violet-500/10" subtitle="Total Earned" />
        <StatCard icon={Clock} label="Pending" value={`₹${formatINR(pendingEarnings)}`} color="text-amber-500" bg="bg-amber-500/10" subtitle="In Review" />
        <StatCard icon={PiggyBank} label="Total Withdrawn" value={`₹${formatINR(completedWithdrawals)}`} color="text-rose-500" bg="bg-rose-500/10" subtitle="Paid Out" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Balance & Withdrawal Action Card */}
        <Card className="card-premium overflow-hidden">
          <div className="bg-slate-950 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-md">
                <Wallet className="h-5 w-5 text-white" />
              </span>
              <span className="text-xs font-mono uppercase bg-white/10 px-2.5 py-1 rounded-full text-slate-300 backdrop-blur-sm">
                Unified Wallet
              </span>
            </div>
            <p className="mt-6 font-display text-4xl font-bold tracking-tight">₹{formatINR(balance)}</p>
            <p className="mt-2 text-xs text-slate-400">Lifetime Earned: ₹{formatINR(lifetimeEarnings)}</p>
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
                  <Link href="/dashboard/kyc">Verify KYC</Link>
                </Button>
              )}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Pending Payouts</p>
                <p className="font-display text-sm font-bold">₹{formatINR(pendingWithdrawalsAmount)}</p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="font-display text-sm font-bold">₹{formatINR(completedWithdrawals)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ANALYTICS METRICS GRID */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Earnings Analytics & Highlights
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Performance breakdown derived strictly from your real-time transaction records.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Realtime
            </Badge>
          </CardHeader>

          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricBlock label="Today's Earnings" value={`₹${formatINR(todayEarnings)}`} icon={TrendingUp} color="text-emerald-500" />
            <MetricBlock label="Weekly Earnings" value={`₹${formatINR(last7DaysEarnings)}`} icon={Calendar} color="text-blue-500" />
            <MetricBlock label="Monthly Earnings" value={`₹${formatINR(last28DaysEarnings)}`} icon={BarChart3} color="text-indigo-500" />
            <MetricBlock label="Lifetime Earnings" value={`₹${formatINR(lifetimeEarnings)}`} icon={IndianRupee} color="text-violet-500" />
            <MetricBlock label="Avg. Daily (28d)" value={`₹${formatINR(avgDailyEarnings)}`} icon={Activity} color="text-teal-500" />
            <MetricBlock label="Highest Reward" value={`₹${formatINR(highestReward)}`} icon={Award} color="text-amber-500" />
            <MetricBlock label="Total Transactions" value={String(transactions.length)} icon={History} color="text-slate-500" />
            <MetricBlock label="Completed Tasks" value={String(completedTasksCount)} icon={Briefcase} color="text-sky-500" />
            <MetricBlock label="Affiliate Sales" value={String(affiliateSalesCount)} icon={Users} color="text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* EARNINGS CHARTS SECTION */}
      <Card className="card-premium mb-6">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Visual Earnings Growth
            </CardTitle>
            <CardDescription className="text-xs">
              Interactive financial chart calculated directly from Firestore transactions.
            </CardDescription>
          </div>

          <Tabs value={chartTimeframe} onValueChange={(v) => setChartTimeframe(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 h-8 text-xs">
              <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
              <TabsTrigger value="growth" className="text-xs">Growth</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {earningTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl bg-secondary/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
                <BarChart3 className="h-6 w-6" />
              </span>
              <p className="text-base font-bold text-foreground">No earnings yet.</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Complete microtasks, refer students, or earn package bonuses to see your earnings charts populate in real time.
              </p>
            </div>
          ) : !mounted ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartTimeframe === 'growth' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      formatter={(val: number) => [`₹${formatINR(val)}`, 'Wallet Balance']}
                      contentStyle={{ borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGrad)" />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      formatter={(val: number) => [`₹${formatINR(val)}`, 'Earnings']}
                      contentStyle={{ borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                    <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EARNINGS TIMELINE SECTION */}
      <Card className="card-premium mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Earnings Timeline
          </CardTitle>
          <CardDescription className="text-xs">
            Chronological real-time feed of incoming rewards automatically grouped by date.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
                <Clock className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold">No timeline activity</p>
              <p className="mt-1 text-xs text-muted-foreground">
                When you earn rewards or request payouts, your chronological timeline will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <TimelineSection title="Today" items={timelineGroups.today} timeBadge="Today" />
              <TimelineSection title="Yesterday" items={timelineGroups.yesterday} timeBadge="Yesterday" />
              <TimelineSection title="Last 7 Days" items={timelineGroups.last7Days} calculateDaysAgo />
              <TimelineSection title="Last 28 Days" items={timelineGroups.last28Days} calculateDaysAgo />
              <TimelineSection title="Older" items={timelineGroups.older} calculateDaysAgo />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ALL TRANSACTIONS HISTORY & SEARCH */}
      <Card className="card-premium mb-6">
        <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Full Transaction Audit History
            </CardTitle>
            <CardDescription className="text-xs">
              Search and filter every credit, debit, referral commission, and task payout.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search amount, ref ID, status..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-border text-xs scrollbar-none">
            <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1 shrink-0" />
            <FilterChip active={historyFilter === 'all'} onClick={() => setHistoryFilter('all')} label="All" />
            <FilterChip active={historyFilter === 'credits'} onClick={() => setHistoryFilter('credits')} label="Credits (+)" />
            <FilterChip active={historyFilter === 'debits'} onClick={() => setHistoryFilter('debits')} label="Debits (-)" />
            <FilterChip active={historyFilter === 'withdrawals'} onClick={() => setHistoryFilter('withdrawals')} label="Withdrawals" />
            <FilterChip active={historyFilter === 'affiliate'} onClick={() => setHistoryFilter('affiliate')} label="Affiliate" />
            <FilterChip active={historyFilter === 'microtasks'} onClick={() => setHistoryFilter('microtasks')} label="Microtasks" />
            <FilterChip active={historyFilter === 'bonuses'} onClick={() => setHistoryFilter('bonuses')} label="Bonuses" />
            <FilterChip active={historyFilter === 'refunds'} onClick={() => setHistoryFilter('refunds')} label="Refunds" />
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-semibold text-muted-foreground">No matching transactions found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter options.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((t) => (
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono px-1.5 py-0.2 shrink-0 ${
                          STATUS_STYLES[t.status] || ''
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{parseTxnDate(t).toLocaleString('en-IN')}</span>
                      {t.referenceId && <span className="font-mono text-[11px]">Ref: {t.referenceId}</span>}
                      <span className="font-mono uppercase bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                        {t.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold font-mono ${
                      t.amount >= 0 ? 'text-success' : 'text-foreground'
                    }`}
                  >
                    {t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PAYOUT & WITHDRAWAL REQUESTS HISTORY TABLE */}
      <Card className="card-premium overflow-hidden">
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
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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

// ===== HELPER COMPONENTS =====

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  subtitle,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  color: string;
  bg: string;
  subtitle?: string;
}) {
  return (
    <Card className="card-premium relative overflow-hidden">
      <CardContent className="p-3.5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg} ${color}`}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3">
          <p className="text-[11px] text-muted-foreground font-medium truncate">{label}</p>
          <p className="font-display text-lg font-bold tracking-tight text-foreground truncate mt-0.5">{value}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground opacity-80 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBlock({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3 bg-card hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground font-medium truncate">{label}</span>
      </div>
      <p className="font-display text-lg font-bold mt-1.5 text-foreground">{value}</p>
    </div>
  );
}

function TimelineSection({
  title,
  items,
  timeBadge,
  calculateDaysAgo,
}: {
  title: string;
  items: WalletTransaction[];
  timeBadge?: string;
  calculateDaysAgo?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 font-bold text-xs px-2.5 py-0.5">
          {title}
        </Badge>
        <span className="text-xs text-muted-foreground font-mono">({items.length} records)</span>
      </div>

      <div className="relative pl-4 border-l-2 border-primary/20 space-y-2.5 ml-2">
        {items.map((t) => {
          const daysAgo = getDaysAgo(parseTxnDate(t));
          const badgeText = timeBadge || (daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} Days Ago`);

          return (
            <div key={t.id} className="relative flex items-center justify-between gap-4 rounded-xl border border-border p-3 bg-card hover:bg-secondary/40 transition-colors">
              <span className="absolute -left-[23px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">{t.label}</span>
                  <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.2 rounded text-muted-foreground">
                    {badgeText}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {parseTxnDate(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-primary/5 text-primary px-1.5 rounded">
                    {t.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-sm font-bold font-mono ${t.amount >= 0 ? 'text-success' : 'text-foreground'}`}>
                  {t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize font-mono">{t.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full font-medium transition-all shrink-0 ${
        active
          ? 'bg-primary text-white shadow-xs'
          : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
    </button>
  );
}
