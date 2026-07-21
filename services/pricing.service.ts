import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { PricingPlan } from '@/types';

const PLANS_COLLECTION = 'pricing_plans';

export type PricingPlanInput = Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>;

export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(query(collection(db, PLANS_COLLECTION), orderBy('sort_order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PricingPlan, 'id'>) }));
}

export async function fetchActivePricingPlans(): Promise<PricingPlan[]> {
  const all = await fetchPricingPlans();
  return all.filter((p) => p.active);
}

export async function createPricingPlan(input: PricingPlanInput): Promise<PricingPlan> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const ref = doc(collection(db, PLANS_COLLECTION));
  const data = { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await setDoc(ref, data);
  return { id: ref.id, ...input };
}

export async function updatePricingPlan(id: string, updates: Partial<PricingPlanInput>): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await updateDoc(doc(db, PLANS_COLLECTION, id), { ...updates, updatedAt: serverTimestamp() });
}

export async function deletePricingPlan(id: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await deleteDoc(doc(db, PLANS_COLLECTION, id));
}
