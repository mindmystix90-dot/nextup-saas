import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { MembershipPackage } from '@/types';

const PACKAGES_COLLECTION = 'packages';

export const DEFAULT_PACKAGES: MembershipPackage[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    slug: 'starter',
    price: 499,
    description: 'Essential access to foundation courses, community, and basic microtasks.',
    features: [
      'Access to 10+ Foundation Courses',
      'Basic Microtask Access',
      '15% Affiliate Commission',
      'Community Chat Access',
      'Standard Support',
    ],
    affiliateCommissionPercent: 15,
    bonusReward: 50,
    displayOrder: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pro',
    name: 'Pro Accelerator',
    slug: 'pro',
    price: 1499,
    description: 'Advanced skill tracks, priority microtasks, and higher affiliate commission rates.',
    features: [
      'Access to ALL Premium Courses',
      'Priority High-Paying Microtasks',
      '20% Affiliate Commission',
      'Exclusive Mentorship Calls',
      'Priority Wallet Withdrawals',
    ],
    affiliateCommissionPercent: 20,
    bonusReward: 150,
    displayOrder: 2,
    salesBadge: 'Most Popular',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lifetime',
    name: 'Lifetime Mastery',
    slug: 'lifetime',
    price: 4999,
    description: 'One-time investment for permanent access to all current and future courses.',
    features: [
      'Lifetime Access to Everything',
      '25% Affiliate Commission',
      'Unlimited High-Ticket Offers',
      '1-on-1 Strategy Session',
      'Zero Withdrawal Fees',
    ],
    affiliateCommissionPercent: 25,
    bonusReward: 500,
    displayOrder: 3,
    salesBadge: 'Best Value',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'enterprise',
    name: 'Enterprise Agency',
    slug: 'enterprise',
    price: 9999,
    description: 'Full white-label training, dedicated account manager, and max affiliate payout rate.',
    features: [
      '30% Max Affiliate Commission',
      'White-Label Course Certificates',
      'Dedicated Partner Manager',
      'Custom API & Webhook Access',
      'VIP Instant Payouts',
    ],
    affiliateCommissionPercent: 30,
    bonusReward: 1000,
    displayOrder: 4,
    salesBadge: 'Agency Choice',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function fetchPackages(): Promise<MembershipPackage[]> {
  if (!firebaseReady) return DEFAULT_PACKAGES;
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, PACKAGES_COLLECTION), orderBy('displayOrder', 'asc')));
    if (snap.empty) {
      // Seed default packages
      for (const pkg of DEFAULT_PACKAGES) {
        await setDoc(doc(db, PACKAGES_COLLECTION, pkg.id), {
          ...pkg,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return DEFAULT_PACKAGES;
    }

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MembershipPackage, 'id'>),
    }));
  } catch (err) {
    console.warn('Failed to fetch packages from Firestore, fallback to defaults:', err);
    return DEFAULT_PACKAGES;
  }
}

export async function fetchPackageById(id: string): Promise<MembershipPackage | null> {
  if (!firebaseReady) return DEFAULT_PACKAGES.find((p) => p.id === id) || null;
  try {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, PACKAGES_COLLECTION, id));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<MembershipPackage, 'id'>) };
    }
    return DEFAULT_PACKAGES.find((p) => p.id === id) || null;
  } catch {
    return DEFAULT_PACKAGES.find((p) => p.id === id) || null;
  }
}

export async function savePackage(pkg: Partial<MembershipPackage> & { id: string; name: string }): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase database unavailable');
  const db = getFirestoreDb();
  const pkgRef = doc(db, PACKAGES_COLLECTION, pkg.id);
  const now = new Date().toISOString();

  const dataToSave: Partial<MembershipPackage> = {
    ...pkg,
    slug: pkg.slug || pkg.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    price: Number(pkg.price) || 0,
    affiliateCommissionPercent: Number(pkg.affiliateCommissionPercent) || 10,
    bonusReward: Number(pkg.bonusReward) || 0,
    displayOrder: Number(pkg.displayOrder) || 1,
    status: pkg.status || 'active',
    updatedAt: now,
  };

  const snap = await getDoc(pkgRef);
  if (!snap.exists()) {
    dataToSave.createdAt = now;
    await setDoc(pkgRef, dataToSave);
  } else {
    await updateDoc(pkgRef, dataToSave);
  }
}

export async function deletePackage(id: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase database unavailable');
  const db = getFirestoreDb();
  await deleteDoc(doc(db, PACKAGES_COLLECTION, id));
}

export async function togglePackageStatus(id: string, currentStatus: 'active' | 'disabled'): Promise<'active' | 'disabled'> {
  if (!firebaseReady) throw new Error('Firebase database unavailable');
  const db = getFirestoreDb();
  const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
  await updateDoc(doc(db, PACKAGES_COLLECTION, id), {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
  return newStatus;
}

export function subscribePackages(callback: (packages: MembershipPackage[]) => void): () => void {
  if (!firebaseReady) {
    callback(DEFAULT_PACKAGES);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, PACKAGES_COLLECTION), orderBy('displayOrder', 'asc'));
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(DEFAULT_PACKAGES);
    } else {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MembershipPackage, 'id'>) })));
    }
  }, (err) => {
    console.warn('subscribePackages error:', err);
    callback(DEFAULT_PACKAGES);
  });
}
