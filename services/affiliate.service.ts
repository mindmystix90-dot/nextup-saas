import {
  collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, serverTimestamp, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { fetchSystemSettings } from '@/services/system-settings.service';
import { recordWalletTransaction } from '@/services/wallet.service';
import type { AffiliateStats, Referral } from '@/types';

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

export async function findOrCreateAffiliateByCode(
  referralCode: string
): Promise<{ ref: ReturnType<typeof doc>; id: string; data: AffiliateStats } | null> {
  if (!firebaseReady || !referralCode) return null;
  const db = getFirestoreDb();
  const cleanCode = referralCode.trim().toUpperCase();

  // 1. Search in affiliates collection by referralCode
  const q = query(collection(db, AFFILIATE_COLLECTION), where('referralCode', '==', cleanCode));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return { ref: docSnap.ref, id: docSnap.id, data: docSnap.data() as AffiliateStats };
  }

  // 2. Fallback: Search users collection if code matches NEXTUP- short prefix
  if (cleanCode.startsWith('NEXTUP-')) {
    const shortUid = cleanCode.replace('NEXTUP-', '').toLowerCase();
    const usersSnap = await getDocs(collection(db, 'users'));
    const matchedUser = usersSnap.docs.find((d) => d.id.toLowerCase().startsWith(shortUid));
    if (matchedUser) {
      const referrerUid = matchedUser.id;
      const stats = await fetchAffiliateStats(referrerUid);
      const affRef = doc(db, AFFILIATE_COLLECTION, referrerUid);
      return { ref: affRef, id: referrerUid, data: stats };
    }
  }

  return null;
}

export async function fetchAffiliateStats(uid: string): Promise<AffiliateStats> {
  if (!firebaseReady) return emptyStats(uid);
  const db = getFirestoreDb();
  const docRef = doc(db, AFFILIATE_COLLECTION, uid);
  const snap = await getDoc(docRef);

  let walletBalance = 0;
  try {
    const wSnap = await getDoc(doc(db, 'wallets', uid));
    if (wSnap.exists()) {
      walletBalance = wSnap.data().balance || 0;
    }
  } catch { /* best-effort */ }

  if (snap.exists()) {
    const data = snap.data() as AffiliateStats;
    return {
      ...emptyStats(uid),
      ...data,
      availableBalance: walletBalance || data.availableBalance || 0,
      referralCode: data.referralCode || generateCode(uid),
    };
  }
  const fresh: AffiliateStats = {
    ...emptyStats(uid),
    availableBalance: walletBalance,
    referralCode: generateCode(uid),
  };
  await setDoc(docRef, fresh);
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
    const target = await findOrCreateAffiliateByCode(referralCode);
    if (target) {
      const currentClicks = target.data.clicks || 0;
      await updateDoc(target.ref, {
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
    const settings = await fetchSystemSettings();
    if (!settings.affiliate.enabled) return;

    const db = getFirestoreDb();
    const cleanCode = referralCode.trim().toUpperCase();
    const target = await findOrCreateAffiliateByCode(cleanCode);

    if (target) {
      const { ref: affRef, id: referrerUid, data: affData } = target;

      // Prevent self-referral
      if (referrerUid === newUser.uid) return;

      const currentRegs = affData.registrations || 0;

      // 1. Update affiliate stats
      await updateDoc(affRef, {
        registrations: currentRegs + 1,
        updatedAt: new Date().toISOString(),
      });

      // 2. Write referral record
      const refDoc = doc(collection(db, REFERRALS_COLLECTION));
      const refData: Referral = {
        id: refDoc.id,
        referrerUid,
        referredUid: newUser.uid,
        referredName: newUser.name || newUser.email.split('@')[0],
        referredEmail: newUser.email,
        status: 'registered',
        commission: 0,
        date: new Date().toISOString(),
      };
      await setDoc(refDoc, { ...refData, createdAt: serverTimestamp() });

      // 3. Save referredBy on user profile
      await setDoc(
        doc(db, 'users', newUser.uid),
        { referredByCode: cleanCode, referredByUid: referrerUid },
        { merge: true }
      );

      // 4. Reward referrer with dynamic signup referral bonus from System Settings
      const signupRewardAmount = settings.rewards.referralSignupBonus;
      if (signupRewardAmount > 0) {
        await recordWalletTransaction({
          uid: referrerUid,
          type: 'referral',
          label: `Referral Signup Bonus for ${newUser.name || newUser.email}`,
          amount: signupRewardAmount,
          method: 'referral',
          status: 'completed',
        });

        // Send in-app notification to referrer
        const notifDoc = doc(collection(db, 'notifications'));
        await setDoc(notifDoc, {
          id: notifDoc.id,
          title: 'New Referral Signup! 🎉',
          message: `${newUser.name || newUser.email} signed up using your referral code! You earned ₹${signupRewardAmount} referral bonus.`,
          targetRole: 'student',
          targetUid: referrerUid,
          type: 'success',
          createdAt: new Date().toISOString(),
        });
      }

      // Clear referral code from client storage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('nextup_ref_code');
          document.cookie = 'nextup_ref_code=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch { /* best-effort */ }
      }
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
    const settings = await fetchSystemSettings();
    if (!settings.affiliate.enabled) return null;

    const db = getFirestoreDb();
    let referrerUid = referrerUidOrCode;
    let affRef: any = doc(db, AFFILIATE_COLLECTION, referrerUidOrCode);
    let affSnap = await getDoc(affRef);

    if (!affSnap.exists()) {
      const target = await findOrCreateAffiliateByCode(referrerUidOrCode);
      if (target) {
        affRef = target.ref;
        referrerUid = target.id;
        affSnap = await getDoc(affRef);
      } else {
        return null;
      }
    }

    const data = affSnap.data() as AffiliateStats;
    const rate = data.commissionRate || settings.affiliate.commissionPercent || settings.rewards.affiliatePurchasePercent || 10;
    const commissionAmount = Math.round((saleAmount * rate) / 100);

    // Update Affiliate Stats
    await updateDoc(affRef, {
      sales: (data.sales || 0) + 1,
      pendingCommission: (data.pendingCommission || 0) + commissionAmount,
      availableBalance: (data.availableBalance || 0) + commissionAmount,
      updatedAt: new Date().toISOString(),
    });

    if (commissionAmount > 0) {
      await recordWalletTransaction({
        uid: referrerUid,
        type: 'referral_commission',
        label: `Affiliate Commission (${rate}%) for Order #${orderId}`,
        amount: commissionAmount,
        method: 'affiliate',
        referenceId: orderId,
        status: 'completed',
      });

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
    }

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

// ===== REALTIME SUBSCRIPTIONS =====

export function subscribeAffiliateStats(uid: string, callback: (stats: AffiliateStats) => void): () => void {
  if (!firebaseReady) {
    callback(emptyStats(uid));
    return () => {};
  }

  const db = getFirestoreDb();
  const docRef = doc(db, AFFILIATE_COLLECTION, uid);
  return onSnapshot(docRef, async (snap) => {
    let walletBalance = 0;
    try {
      const wSnap = await getDoc(doc(db, 'wallets', uid));
      if (wSnap.exists()) {
        walletBalance = wSnap.data().balance || 0;
      }
    } catch { /* best-effort */ }

    if (snap.exists()) {
      const data = snap.data() as AffiliateStats;
      callback({
        ...emptyStats(uid),
        ...data,
        availableBalance: walletBalance || data.availableBalance || 0,
        referralCode: data.referralCode || generateCode(uid),
      });
    } else {
      callback({
        ...emptyStats(uid),
        referralCode: generateCode(uid),
        availableBalance: walletBalance,
      });
    }
  }, (err) => {
    console.warn('subscribeAffiliateStats error:', err);
    callback(emptyStats(uid));
  });
}

export function subscribeReferrals(uid: string, callback: (referrals: Referral[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, REFERRALS_COLLECTION), where('referrerUid', '==', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Referral, 'id'>) }));
    list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeReferrals error:', err);
    callback([]);
  });
}

export function subscribeAllAffiliateStats(callback: (stats: AffiliateStats[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, AFFILIATE_COLLECTION), (snap) => {
    const list = snap.docs.map((d) => ({ ...emptyStats(d.id), ...(d.data() as AffiliateStats) }));
    callback(list);
  }, (err) => {
    console.warn('subscribeAllAffiliateStats error:', err);
    callback([]);
  });
}

export function subscribeAllReferrals(callback: (referrals: Referral[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, REFERRALS_COLLECTION), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Referral, 'id'>) }));
    list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeAllReferrals error:', err);
    callback([]);
  });
}

export function subscribeAffiliateLeaderboard(callback: (stats: AffiliateStats[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, AFFILIATE_COLLECTION), orderBy('sales', 'desc'), limit(10));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ ...emptyStats(d.id), ...(d.data() as AffiliateStats) }));
    callback(list);
  }, (err) => {
    console.warn('subscribeAffiliateLeaderboard error:', err);
    callback([]);
  });
}
