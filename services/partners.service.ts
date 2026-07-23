import {
  collection, deleteDoc, doc, getDocs, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { SalesPartner } from '@/types';

const PARTNERS_COLLECTION = 'sales_partners';

const DEMO_PARTNERS: SalesPartner[] = [
  {
    id: 'SP-101',
    companyName: 'EdTech Nexus India',
    contactPerson: 'Vikramaditya Roy',
    email: 'vikram@edtechnexus.in',
    phone: '+91 98112 34567',
    tier: 'Platinum',
    commissionRate: 35,
    totalSales: 450000,
    totalCommission: 157500,
    status: 'Active',
    createdAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'SP-102',
    companyName: 'SkillUp Enterprise Solutions',
    contactPerson: 'Meenakshi Sundaram',
    email: 'meenakshi@skillup.co.in',
    phone: '+91 97223 88990',
    tier: 'Gold',
    commissionRate: 25,
    totalSales: 220000,
    totalCommission: 55000,
    status: 'Active',
    createdAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'SP-103',
    companyName: 'Digital Learning Guild',
    contactPerson: 'Siddharth Saxena',
    email: 'sid@dlguild.org',
    phone: '+91 99887 11223',
    tier: 'Silver',
    commissionRate: 20,
    totalSales: 85000,
    totalCommission: 17000,
    status: 'Pending',
    createdAt: '2026-06-20T00:00:00Z',
  },
];

export async function fetchSalesPartners(): Promise<SalesPartner[]> {
  if (!firebaseReady) return DEMO_PARTNERS;
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, PARTNERS_COLLECTION));
    if (snap.empty) return DEMO_PARTNERS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SalesPartner, 'id'>) }));
  } catch {
    return DEMO_PARTNERS;
  }
}

export async function createSalesPartner(input: Omit<SalesPartner, 'id' | 'createdAt' | 'totalSales' | 'totalCommission'>): Promise<SalesPartner> {
  const newPartner: SalesPartner = {
    id: `SP-${Date.now().toString().slice(-4)}`,
    ...input,
    totalSales: 0,
    totalCommission: 0,
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      const ref = doc(collection(db, PARTNERS_COLLECTION));
      await setDoc(ref, {
        ...newPartner,
        createdAt: serverTimestamp(),
      });
      newPartner.id = ref.id;
    } catch (e) {
      console.warn('Firestore sales partner fallback creation:', e);
    }
  }

  return newPartner;
}

export async function updateSalesPartner(id: string, updates: Partial<SalesPartner>): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await updateDoc(doc(db, PARTNERS_COLLECTION, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore sales partner update failed:', e);
  }
}

export async function deleteSalesPartner(id: string): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, PARTNERS_COLLECTION, id));
  } catch (e) {
    console.warn('Firestore sales partner delete failed:', e);
  }
}
