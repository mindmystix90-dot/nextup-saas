import {
  collection, deleteDoc, doc, getDocs, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { Coupon } from '@/types';

const COUPONS_COLLECTION = 'coupons';

export async function fetchCoupons(): Promise<Coupon[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, COUPONS_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Coupon, 'id'>) }));
  } catch {
    return [];
  }
}

export async function createCoupon(input: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>): Promise<Coupon> {
  const newCoupon: Coupon = {
    id: `C-${Date.now().toString().slice(-4)}`,
    ...input,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      const ref = doc(collection(db, COUPONS_COLLECTION));
      await setDoc(ref, {
        ...newCoupon,
        createdAt: serverTimestamp(),
      });
      newCoupon.id = ref.id;
    } catch (e) {
      console.warn('Firestore fallback for coupon creation:', e);
    }
  }

  return newCoupon;
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await updateDoc(doc(db, COUPONS_COLLECTION, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore update failed for coupon:', e);
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, COUPONS_COLLECTION, id));
  } catch (e) {
    console.warn('Firestore delete failed for coupon:', e);
  }
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const coupons = await fetchCoupons();
  const normalized = code.trim().toUpperCase();
  
  // Default mock fallback coupons if none in Firestore
  if (coupons.length === 0) {
    if (normalized === 'NEXTUP20' || normalized === 'SAVE20') {
      return {
        id: 'c-default-20',
        code: normalized,
        discountType: 'percentage',
        discountValue: 20,
        validUntil: '2028-12-31',
        usageLimit: 100,
        usedCount: 5,
        active: true,
        createdAt: new Date().toISOString(),
      };
    }
  }

  const found = coupons.find(
    (c) => c.code.toUpperCase() === normalized && c.active === true
  );

  return found || null;
}


