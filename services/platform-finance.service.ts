import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { PlatformFinance } from '@/types';

const PLATFORM_FINANCE_COLLECTION = 'platform_finance';
const OVERVIEW_DOC = 'overview';

export const DEFAULT_PLATFORM_FINANCE: PlatformFinance = {
  currentPlatformBalance: 500000, // ₹5,00,000 initial platform reserve
  pendingWithdrawalAmount: 0,
  reservedBalance: 500000,
  totalPaidOut: 0,
  totalWithdrawalFees: 0,
  platformProfit: 125000,
  affiliateProfit: 35000,
  microtaskProfit: 15000,
  monthlyProfit: 85000,
  dailyProfit: 1250,
};

let cachedFinance: PlatformFinance | null = null;

export async function fetchPlatformFinance(): Promise<PlatformFinance> {
  if (cachedFinance) return cachedFinance;
  if (!firebaseReady) return DEFAULT_PLATFORM_FINANCE;

  try {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, PLATFORM_FINANCE_COLLECTION, OVERVIEW_DOC));
    if (snap.exists()) {
      cachedFinance = { ...DEFAULT_PLATFORM_FINANCE, ...snap.data() };
    } else {
      cachedFinance = DEFAULT_PLATFORM_FINANCE;
      await setDoc(doc(db, PLATFORM_FINANCE_COLLECTION, OVERVIEW_DOC), {
        ...DEFAULT_PLATFORM_FINANCE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return cachedFinance;
  } catch {
    return DEFAULT_PLATFORM_FINANCE;
  }
}

export function subscribePlatformFinance(
  callback: (finance: PlatformFinance) => void
): () => void {
  if (!firebaseReady) {
    callback(DEFAULT_PLATFORM_FINANCE);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(
    doc(db, PLATFORM_FINANCE_COLLECTION, OVERVIEW_DOC),
    (snap) => {
      if (snap.exists()) {
        const data = { ...DEFAULT_PLATFORM_FINANCE, ...snap.data() };
        cachedFinance = data;
        callback(data);
      } else {
        callback(DEFAULT_PLATFORM_FINANCE);
      }
    },
    () => callback(DEFAULT_PLATFORM_FINANCE)
  );
}

export async function validatePlatformReserve(amount: number): Promise<boolean> {
  const finance = await fetchPlatformFinance();
  const availableReserve = finance.reservedBalance || finance.currentPlatformBalance;

  if (availableReserve < amount) {
    throw new Error(
      `Insufficient Platform Reserve! Required: ₹${amount}, Available Reserve: ₹${availableReserve}. Approval blocked.`
    );
  }
  return true;
}

export async function recordFinancialMovement(params: {
  action: 'request' | 'approve' | 'pay' | 'reject';
  amount: number;
  fee?: number;
}): Promise<void> {
  if (!firebaseReady) return;

  const db = getFirestoreDb();
  const current = await fetchPlatformFinance();

  let pending = current.pendingWithdrawalAmount;
  let balance = current.currentPlatformBalance;
  let reserve = current.reservedBalance;
  let paid = current.totalPaidOut;
  let totalFees = current.totalWithdrawalFees;

  const fee = params.fee || 0;

  if (params.action === 'request') {
    pending += params.amount;
  } else if (params.action === 'approve') {
    // Validate reserve
    if (reserve < params.amount && balance < params.amount) {
      throw new Error(`Insufficient Platform Reserve balance to approve payout.`);
    }
  } else if (params.action === 'pay') {
    pending = Math.max(0, pending - params.amount);
    balance = Math.max(0, balance - params.amount);
    reserve = Math.max(0, reserve - params.amount);
    paid += params.amount;
    totalFees += fee;
  } else if (params.action === 'reject') {
    pending = Math.max(0, pending - params.amount);
  }

  const updated: PlatformFinance = {
    ...current,
    currentPlatformBalance: balance,
    pendingWithdrawalAmount: pending,
    reservedBalance: reserve,
    totalPaidOut: paid,
    totalWithdrawalFees: totalFees,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(
    doc(db, PLATFORM_FINANCE_COLLECTION, OVERVIEW_DOC),
    {
      ...updated,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  cachedFinance = updated;
}

export async function updatePlatformFinance(
  newValues: Partial<PlatformFinance>
): Promise<void> {
  if (!firebaseReady) return;

  const current = await fetchPlatformFinance();
  const updated: PlatformFinance = {
    ...current,
    ...newValues,
    updatedAt: new Date().toISOString(),
  };

  const db = getFirestoreDb();
  await setDoc(
    doc(db, PLATFORM_FINANCE_COLLECTION, OVERVIEW_DOC),
    {
      ...updated,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  cachedFinance = updated;
}
