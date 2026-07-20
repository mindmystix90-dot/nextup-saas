import { collection, getDocs } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

export interface DashboardStats {
  users: number;
  courses: number;
  certificates: number;
  revenue: number;
  visitors: number;
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
  revenue: 0,
  visitors: 0,
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
  const [users, courses, certificates, affiliates] = await Promise.all([
    countCollection('users'),
    countCollection('courses'),
    countCollection('certificates'),
    countCollection('affiliates'),
  ]);
  let revenue = 0;
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, 'payments'));
    snap.forEach((d) => {
      const data = d.data() as { amount?: number; status?: string };
      if (data.status === 'Completed' && typeof data.amount === 'number') revenue += data.amount;
    });
  } catch {
    // payments collection may not exist yet
  }
  return { users, courses, certificates, revenue, visitors: 0, affiliates };
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
