import { collection, getDocs, onSnapshot, query, where, orderBy, limit as limitQuery } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { Payment } from '@/types';

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

export function subscribeDashboardStats(callback: (stats: DashboardStats) => void): () => void {
  if (!firebaseReady) {
    callback(EMPTY_STATS);
    return () => {};
  }

  const db = getFirestoreDb();
  let usersCount = 0;
  let coursesCount = 0;
  let certsCount = 0;
  let affiliatesCount = 0;
  let revenue = 0;

  const emit = () => callback({ users: usersCount, courses: coursesCount, certificates: certsCount, revenue, visitors: 0, affiliates: affiliatesCount });

  const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
    usersCount = snap.size;
    emit();
  });
  const unsubCourses = onSnapshot(collection(db, 'courses'), (snap) => {
    coursesCount = snap.size;
    emit();
  }, () => {});
  const unsubCerts = onSnapshot(collection(db, 'certificates'), (snap) => {
    certsCount = snap.size;
    emit();
  }, () => {});
  const unsubAffiliates = onSnapshot(collection(db, 'affiliates'), (snap) => {
    affiliatesCount = snap.size;
    emit();
  }, () => {});
  const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
    let rev = 0;
    snap.forEach((d) => {
      const data = d.data() as { amount?: number; status?: string };
      if (data.status === 'Completed' && typeof data.amount === 'number') rev += data.amount;
    });
    revenue = rev;
    emit();
  }, () => {});

  return () => {
    unsubUsers();
    unsubCourses();
    unsubCerts();
    unsubAffiliates();
    unsubPayments();
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

export function subscribeRecentSignups(limit = 5, callback: (signups: RecentSignup[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, 'users'), (snap) => {
    const all = snap.docs.map((d) => d.data() as RecentSignup & { createdAt?: string });
    all.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    callback(all.slice(0, limit));
  }, (err) => {
    console.warn('subscribeRecentSignups error:', err);
    callback([]);
  });
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

export function subscribeRecentPayments(limit = 5, callback: (payments: PaymentRow[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, 'payments'), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRow, 'id'>) }));
    all.sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return tb - ta;
    });
    callback(all.slice(0, limit));
  }, (err) => {
    console.warn('subscribeRecentPayments error:', err);
    callback([]);
  });
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

export function subscribeAllPayments(callback: (payments: Payment[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, 'payments'), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }));
    all.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    callback(all);
  }, (err) => {
    console.warn('subscribeAllPayments error:', err);
    callback([]);
  });
}
