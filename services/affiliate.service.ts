import {
  collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, serverTimestamp, orderBy, limit,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { AffiliateStats, Referral, WalletTransaction } from '@/types';

const AFFILIATE_COLLECTION = 'affiliates';
const REFERRALS_COLLECTION = 'referrals';
const APPLICATIONS_COLLECTION = 'affiliate_applications';

export interface AffiliateApplication {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  website?: string;
  promotionMethods: string;
  monthlyReach?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

function emptyStats(uid: string): AffiliateStats {
  return {
    uid,
    referralCode: '',
    referralLink: '',
    enabled: true,
    clicks: 0,
    registrations: 0,
    sales: 0,
    pendingCommission: 0,
    paidCommission: 0,
    availableBalance: 0,
    commissionRate: 10,
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
  try {
    const snap = await getDocs(
      query(collection(db, REFERRALS_COLLECTION), where('referrerUid', '==', uid))
    );
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Referral, 'id'>) }));
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export async function fetchAllAffiliateStats(): Promise<AffiliateStats[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, AFFILIATE_COLLECTION));
  return snap.docs.map((d) => ({ ...emptyStats(d.id), ...(d.data() as AffiliateStats) }));
}

export async function recordAffiliateClick(referralCode: string): Promise<void> {
  if (!firebaseReady || !referralCode) return;
  try {
    const db = getFirestoreDb();
    const q = query(collection(db, AFFILIATE_COLLECTION), where('referralCode', '==', referralCode.toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const affDoc = snap.docs[0];
      const currentClicks = affDoc.data().clicks || 0;
      await updateDoc(affDoc.ref, {
        clicks: currentClicks + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn('Failed to record affiliate click:', e);
  }
}

export async function recordAffiliateRegistration(
  referralCode: string,
  newUser: { uid: string; name: string; email: string }
): Promise<void> {
  if (!firebaseReady || !referralCode) return;
  try {
    const db = getFirestoreDb();
    const q = query(collection(db, AFFILIATE_COLLECTION), where('referralCode', '==', referralCode.toUpperCase()));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const affDoc = snap.docs[0];
      const referrerUid = affDoc.id;
      const currentRegs = affDoc.data().registrations || 0;

      // Update affiliate stats
      await updateDoc(affDoc.ref, {
        registrations: currentRegs + 1,
        updatedAt: new Date().toISOString(),
      });

      // Write referral record
      const refDoc = doc(collection(db, REFERRALS_COLLECTION));
      const refData: Referral = {
        id: refDoc.id,
        referrerUid,
        referredUid: newUser.uid,
        referredName: newUser.name,
        referredEmail: newUser.email,
        status: 'registered',
        commission: 0,
        date: new Date().toISOString(),
      };
      await setDoc(refDoc, { ...refData, createdAt: serverTimestamp() });

      // Save referredBy on user profile
      await setDoc(
        doc(db, 'users', newUser.uid),
        { referredByCode: referralCode.toUpperCase(), referredByUid: referrerUid },
        { merge: true }
      );
    }
  } catch (e) {
    console.warn('Failed to record affiliate registration:', e);
  }
}

export async function recordAffiliatePurchase(
  referrerUidOrCode: string,
  saleAmount: number,
  orderId: string
): Promise<{ commissionAmount: number; referrerUid: string } | null> {
  if (!firebaseReady || !referrerUidOrCode) return null;
  try {
    const db = getFirestoreDb();
    let affDoc = await getDoc(doc(db, AFFILIATE_COLLECTION, referrerUidOrCode));
    let referrerUid = referrerUidOrCode;

    if (!affDoc.exists()) {
      // Search by code
      const q = query(collection(db, AFFILIATE_COLLECTION), where('referralCode', '==', referrerUidOrCode.toUpperCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        affDoc = snap.docs[0];
        referrerUid = affDoc.id;
      } else {
        return null;
      }
    }

    const data = affDoc.data() as AffiliateStats;
    const rate = data.commissionRate || 10;
    const commissionAmount = Math.round((saleAmount * rate) / 100);

    // Update Affiliate Stats
    await updateDoc(affDoc.ref, {
      sales: (data.sales || 0) + 1,
      pendingCommission: (data.pendingCommission || 0) + commissionAmount,
      availableBalance: (data.availableBalance || 0) + commissionAmount,
      updatedAt: new Date().toISOString(),
    });

    // Update Wallet
    const walletRef = doc(db, 'wallets', referrerUid);
    const walletSnap = await getDoc(walletRef);
    if (walletSnap.exists()) {
      const wData = walletSnap.data();
      await updateDoc(walletRef, {
        balance: (wData.balance || 0) + commissionAmount,
        pendingCommission: (wData.pendingCommission || 0) + commissionAmount,
        lifetimeEarnings: (wData.lifetimeEarnings || 0) + commissionAmount,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(walletRef, {
        uid: referrerUid,
        balance: commissionAmount,
        pendingCommission: commissionAmount,
        paidOut: 0,
        lifetimeEarnings: commissionAmount,
        updatedAt: new Date().toISOString(),
      });
    }

    // Add Wallet Transaction
    const txnDoc = doc(collection(db, 'transactions'));
    const txn: WalletTransaction = {
      id: txnDoc.id,
      uid: referrerUid,
      type: 'referral_commission',
      amount: commissionAmount,
      status: 'completed',
      label: `Affiliate Commission (${rate}%) for Order #${orderId}`,
      date: new Date().toISOString().split('T')[0],
      referenceId: orderId,
    };
    await setDoc(txnDoc, { ...txn, createdAt: serverTimestamp() });

    // Notify affiliate user
    const notifDoc = doc(collection(db, 'notifications'));
    await setDoc(notifDoc, {
      id: notifDoc.id,
      title: 'Affiliate Commission Earned! 💰',
      message: `You earned ₹${commissionAmount.toLocaleString('en-IN')} commission from a referred order (${orderId}).`,
      targetRole: 'student',
      targetUid: referrerUid,
      type: 'success',
      createdAt: new Date().toISOString(),
    });

    return { commissionAmount, referrerUid };
  } catch (e) {
    console.error('Failed to record affiliate purchase:', e);
    return null;
  }
}

export async function fetchAffiliateLeaderboard(): Promise<AffiliateStats[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, AFFILIATE_COLLECTION), orderBy('sales', 'desc'), limit(10))
    );
    return snap.docs.map((d) => ({ ...emptyStats(d.id), ...(d.data() as AffiliateStats) }));
  } catch {
    return [];
  }
}

export async function applyForAffiliateProgram(
  uid: string,
  userName: string,
  userEmail: string,
  details: { website?: string; promotionMethods: string; monthlyReach?: string }
): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  const appDoc = doc(collection(db, APPLICATIONS_COLLECTION));
  const application: AffiliateApplication = {
    id: appDoc.id,
    uid,
    userName,
    userEmail,
    ...details,
    status: 'pending',
    appliedAt: new Date().toISOString(),
  };
  await setDoc(appDoc, { ...application, createdAt: serverTimestamp() });
}

export async function adminSetAffiliateEnabled(uid: string, enabled: boolean): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const ref = doc(db, AFFILIATE_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...emptyStats(uid), referralCode: generateCode(uid), enabled, updatedAt: new Date().toISOString() });
  } else {
    await updateDoc(ref, { enabled, updatedAt: new Date().toISOString() });
  }
}

export async function adminAdjustCommission(uid: string, pending: number, paid: number): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await updateDoc(doc(db, AFFILIATE_COLLECTION, uid), {
    pendingCommission: pending, paidCommission: paid, updatedAt: new Date().toISOString(),
  });
}

export async function adminSetCommissionRate(uid: string, rate: number): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await updateDoc(doc(db, AFFILIATE_COLLECTION, uid), {
    commissionRate: rate, updatedAt: new Date().toISOString(),
  });
}
