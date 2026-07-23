import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { Payment } from '@/types';

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  users: number;
  activeUsers: number;
  newUsers: number;
  courseSales: number;
  affiliateSales: number;
  pendingPayouts: number;
  salesPartnerRevenue: number;
  courses: number;
  communityPosts: number;
  liveClasses: number;
  supportTickets: number;
  certificates: number;
  affiliates: number;
}

export interface RecentSignup {
  uid: string;
  name: string;
  email: string;
  membership: string;
  suspended: boolean;
  photoURL?: string;
  createdAt: string;
}

export interface PaymentRow {
  id: string;
  user: string;
  plan: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

const EMPTY_STATS: DashboardStats = {
  users: 0,
  courses: 0,
  certificates: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  activeUsers: 0,
  newUsers: 0,
  courseSales: 0,
  affiliateSales: 0,
  pendingPayouts: 0,
  salesPartnerRevenue: 0,
  communityPosts: 0,
  liveClasses: 0,
  supportTickets: 0,
  affiliates: 0,
};

async function countCollection(name: string): Promise<number> {
  if (!firebaseReady) return 0;
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, name));
  return snap.size;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (!firebaseReady) return EMPTY_STATS;
  const [users, courses, certificates, affiliates, communityPosts, liveClasses, supportTickets] = await Promise.all([
    countCollection('users'),
    countCollection('courses'),
    countCollection('certificates'),
    countCollection('affiliates'),
    countCollection('community_posts'),
    countCollection('live_classes'),
    countCollection('support_tickets'),
  ]);

  let totalRevenue = 0;
  let monthlyRevenue = 0;
  let courseSales = 0;
  let affiliateSales = 0;
  let pendingPayouts = 0;
  let salesPartnerRevenue = 0;
  let activeUsers = 0;
  let newUsers = 0;

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const recentStart = new Date();
  recentStart.setUTCDate(recentStart.getUTCDate() - 30);

  try {
    const db = getFirestoreDb();
    const [paymentSnap, userSnap, payoutSnap] = await Promise.all([
      getDocs(collection(db, 'payments')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'withdrawals')),
    ]);

    paymentSnap.forEach((d) => {
      const data = d.data() as { amount?: number; status?: string; type?: string; source?: string; date?: string; createdAt?: string };
      const amount = typeof data.amount === 'number' ? data.amount : 0;
      const status = (data.status || '').toLowerCase();
      if (status !== 'completed') return;
      totalRevenue += amount;
      const dateValue = data.date || data.createdAt;
      if (dateValue && new Date(dateValue) >= monthStart) monthlyRevenue += amount;
      if (data.type === 'course') courseSales += amount;
      if (data.source === 'affiliate') affiliateSales += amount;
      if (data.source === 'sales_partner') salesPartnerRevenue += amount;
    });

    userSnap.forEach((d) => {
      const data = d.data() as { suspended?: boolean; createdAt?: string };
      if (!data.suspended) activeUsers += 1;
      if (data.createdAt && new Date(data.createdAt) >= recentStart) newUsers += 1;
    });

    payoutSnap.forEach((d) => {
      const data = d.data() as { amount?: number; status?: string };
      const status = (data.status || '').toLowerCase();
      if (status === 'pending' && typeof data.amount === 'number') pendingPayouts += data.amount;
    });
  } catch {
    // optional reporting collections may not exist yet
  }

  return {
    totalRevenue,
    monthlyRevenue,
    users,
    activeUsers,
    newUsers,
    courseSales,
    affiliateSales,
    pendingPayouts,
    salesPartnerRevenue,
    courses,
    communityPosts,
    liveClasses,
    supportTickets,
    certificates,
    affiliates,
  };
}

export async function fetchRecentSignups(limit = 5): Promise<RecentSignup[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, 'users'));
  const all = snap.docs.map((d) => d.data() as RecentSignup & { createdAt?: string });
  all.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  return all.slice(0, limit);
}

export async function fetchRecentPayments(limit = 5): Promise<PaymentRow[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, 'payments'));
  const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRow, 'id'>) }));
  all.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });
  return all.slice(0, limit);
}

export async function fetchUserPayments(uid: string): Promise<Payment[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(query(collection(db, 'payments'), where('uid', '==', uid)));
  const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }));
  all.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return all;
}

export async function fetchAllPayments(): Promise<Payment[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, 'payments'));
  const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }));
  all.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return all;
}
