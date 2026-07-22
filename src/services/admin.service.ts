import { supabase } from '@/lib/supabase';
import type { Profile, Role, Membership, Payment } from '@/types';
import { syncMembershipAccess } from './courses.service';

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return (data as Profile[] | null) ?? [];
}

export async function fetchProfileById(uid: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
  return data as Profile | null;
}

export async function adminUpdateProfile(uid: string, data: Partial<Profile>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({
    ...data, updated_at: new Date().toISOString(),
  }).eq('id', uid);
  return { error: error?.message ?? null };
}

export async function adminSetRole(uid: string, role: Role): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', uid);
  return { error: error?.message ?? null };
}

export async function adminSetMembership(
  uid: string, membership: Membership, options?: { start?: string; expiry?: string; status?: string },
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();
  const start = options?.start ?? now;
  let expiry = options?.expiry ?? null;
  if (membership === 'lifetime') {
    expiry = new Date(Date.now() + 100 * 365 * 86400 * 1000).toISOString();
  } else if (membership === 'pro' && !expiry) {
    expiry = new Date(Date.now() + 365 * 86400 * 1000).toISOString();
  } else if (membership === 'sales_partner' && !expiry) {
    expiry = new Date(Date.now() + 365 * 86400 * 1000).toISOString();
  }

  const { error } = await supabase.from('profiles').update({
    membership, membership_status: options?.status ?? 'active',
    membership_start: start, membership_expiry: expiry,
    updated_at: now,
  }).eq('id', uid);
  if (error) return { error: error.message };

  await syncMembershipAccess(uid, membership);

  await supabase.from('activity_log').insert({
    user_id: uid, action: 'membership_changed', description: `Membership set to ${membership}`,
  });

  await supabase.from('notifications').insert({
    user_id: uid, title: 'Membership Updated',
    message: `Your membership has been updated to ${membership}.`,
    type: 'info',
  });

  return { error: null };
}

export async function adminExtendMembership(uid: string, membership: Membership, days: number): Promise<{ error: string | null }> {
  const { data: profile } = await supabase.from('profiles').select('membership_expiry').eq('id', uid).maybeSingle();
  const p = profile as { membership_expiry: string | null } | null;
  const baseDate = p?.membership_expiry ? new Date(p.membership_expiry) : new Date();
  if (baseDate < new Date()) baseDate.setTime(Date.now());
  const newExpiry = new Date(baseDate.getTime() + days * 86400 * 1000).toISOString();

  const { error } = await supabase.from('profiles').update({
    membership_expiry: newExpiry, membership_status: 'active',
    updated_at: new Date().toISOString(),
  }).eq('id', uid);
  return { error: error?.message ?? null };
}

export async function adminCancelMembership(uid: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({
    membership_status: 'cancelled', membership_expiry: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', uid);
  if (error) return { error: error.message };

  await syncMembershipAccess(uid, 'starter');

  await supabase.from('notifications').insert({
    user_id: uid, title: 'Membership Cancelled',
    message: 'Your membership has been cancelled.',
    type: 'error',
  });

  return { error: null };
}

export async function adminSuspendUser(uid: string, suspended: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({ suspended, updated_at: new Date().toISOString() }).eq('id', uid);
  return { error: error?.message ?? null };
}

export async function fetchUserPayments(userId: string): Promise<Payment[]> {
  const { data } = await supabase.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data as Payment[] | null) ?? [];
}

export async function fetchAllPayments(): Promise<Payment[]> {
  const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
  return (data as Payment[] | null) ?? [];
}

export async function fetchAllWallets() {
  const { data } = await supabase
    .from('wallets').select('*, profiles!inner(email, name)').order('updated_at', { ascending: false });
  return data ?? [];
}

export async function fetchAllActivity() {
  const { data } = await supabase
    .from('activity_log').select('*, profiles!inner(email, name)').order('created_at', { ascending: false }).limit(50);
  return data ?? [];
}

// ===== Admin Analytics =====

export async function fetchAdminStats() {
  const [usersRes, coursesRes, paymentsRes, walletsRes, withdrawalsRes, kycRes, referralsRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('payments').select('amount, status'),
    supabase.from('wallets').select('balance, lifetime_earnings, pending_withdrawals, completed_withdrawals'),
    supabase.from('withdrawals').select('amount, status'),
    supabase.from('kyc').select('status'),
    supabase.from('referrals').select('commission, status'),
  ]);

  const totalUsers = usersRes.count ?? 0;
  const totalCourses = coursesRes.count ?? 0;

  const payments = (paymentsRes.data ?? []) as { amount: number; status: string }[];
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);

  const wallets = (walletsRes.data ?? []) as { balance: number; lifetime_earnings: number; pending_withdrawals: number; completed_withdrawals: number }[];
  const totalWalletBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const totalLifetimeEarnings = wallets.reduce((s, w) => s + Number(w.lifetime_earnings), 0);

  const withdrawals = (withdrawalsRes.data ?? []) as { amount: number; status: string }[];
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + Number(w.amount), 0);
  const completedWithdrawals = withdrawals.filter((w) => w.status === 'paid').reduce((s, w) => s + Number(w.amount), 0);

  const kycs = (kycRes.data ?? []) as { status: string }[];
  const pendingKyc = kycs.filter((k) => k.status === 'pending').length;

  const referrals = (referralsRes.data ?? []) as { commission: number; status: string }[];
  const pendingCommission = referrals.filter((r) => r.status !== 'purchased').reduce((s, r) => s + Number(r.commission), 0);

  return {
    totalUsers, totalCourses, totalRevenue, totalWalletBalance,
    totalLifetimeEarnings, pendingWithdrawals, completedWithdrawals,
    pendingKyc, pendingCommission,
  };
}

export async function fetchRecentActivity() {
  const { data } = await supabase
    .from('activity_log').select('*, profiles!inner(email, name)')
    .order('created_at', { ascending: false }).limit(10);
  return data ?? [];
}

export async function fetchRevenueChartData() {
  const { data: payments } = await supabase
    .from('payments').select('amount, status, created_at').eq('status', 'completed').order('created_at', { ascending: true });

  const byMonth: Record<string, number> = {};
  for (const p of (payments ?? []) as { amount: number; created_at: string }[]) {
    const month = new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    byMonth[month] = (byMonth[month] ?? 0) + Number(p.amount);
  }
  return Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue }));
}

export async function fetchUserGrowthData() {
  const { data } = await supabase.from('profiles').select('created_at').order('created_at', { ascending: true });
  const byMonth: Record<string, number> = {};
  let cumulative = 0;
  for (const p of (data ?? []) as { created_at: string }[]) {
    const month = new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    cumulative++;
    byMonth[month] = cumulative;
  }
  return Object.entries(byMonth).map(([month, users]) => ({ month, users }));
}
