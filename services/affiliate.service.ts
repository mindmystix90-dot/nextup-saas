import {
  collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { AffiliateStats, Referral } from '@/types';

const AFFILIATE_COLLECTION = 'affiliates';
const REFERRALS_COLLECTION = 'referrals';

function emptyStats(uid: string): AffiliateStats {
  return {
    uid, referralCode: '', clicks: 0, registrations: 0, sales: 0,
    pendingCommission: 0, paidCommission: 0, availableBalance: 0,
  };
}

function generateCode(uid: string): string {
  return 'NEXTUP-' + uid.slice(0, 8).toUpperCase();
}

export async function fetchAffiliateStats(uid: string): Promise<AffiliateStats> {
  if (!firebaseReady) return emptyStats(uid);
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, AFFILIATE_COLLECTION, uid));
  if (snap.exists()) {
    const data = snap.data() as AffiliateStats;
    return { ...emptyStats(uid), ...data, referralCode: data.referralCode || generateCode(uid) };
  }
  const fresh: AffiliateStats = { ...emptyStats(uid), referralCode: generateCode(uid) };
  await setDoc(doc(db, AFFILIATE_COLLECTION, uid), fresh);
  return fresh;
}

export async function fetchReferrals(uid: string): Promise<Referral[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, REFERRALS_COLLECTION), where('referrerUid', '==', uid), orderBy('date', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Referral, 'id'>) }));
}

export async function fetchAllAffiliateStats(): Promise<AffiliateStats[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, AFFILIATE_COLLECTION));
  return snap.docs.map((d) => d.data() as AffiliateStats);
}
