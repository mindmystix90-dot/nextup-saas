import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type {
  KycInfo,
  KycStatus,
  WalletData,
  WalletTransaction,
  Withdrawal,
  WithdrawalMethod,
  WithdrawalStatus,
  TransactionType,
} from '@/types';

const WALLET_COLLECTION = 'wallet';
const TRANSACTIONS_COLLECTION = 'transactions';
const WITHDRAWALS_COLLECTION = 'withdrawals';
const KYC_COLLECTION = 'kyc';

function emptyWallet(uid: string): WalletData {
  return { uid, balance: 0, lifetimeEarnings: 0, pendingWithdrawals: 0, completedWithdrawals: 0 };
}

export async function fetchWallet(uid: string): Promise<WalletData> {
  if (!firebaseReady) return emptyWallet(uid);
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, WALLET_COLLECTION, uid));
  if (snap.exists()) return { ...emptyWallet(uid), ...(snap.data() as WalletData) };
  const fresh = emptyWallet(uid);
  await setDoc(doc(db, WALLET_COLLECTION, uid), fresh);
  return fresh;
}

export async function fetchTransactions(uid: string): Promise<WalletTransaction[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, TRANSACTIONS_COLLECTION), where('uid', '==', uid), orderBy('date', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WalletTransaction, 'id'>) }));
}

export async function fetchAllTransactions(): Promise<WalletTransaction[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(query(collection(db, TRANSACTIONS_COLLECTION), orderBy('date', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WalletTransaction, 'id'>) }));
}

export async function fetchWithdrawals(uid: string): Promise<Withdrawal[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, WITHDRAWALS_COLLECTION), where('uid', '==', uid), orderBy('requestedAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
}

export async function fetchAllWithdrawals(): Promise<Withdrawal[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(query(collection(db, WITHDRAWALS_COLLECTION), orderBy('requestedAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
}

export async function requestWithdrawal(
  uid: string,
  userName: string,
  userEmail: string,
  amount: number,
  method: WithdrawalMethod,
  kyc: KycInfo | null
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  if (!kyc || kyc.status !== 'verified') throw new Error('KYC must be verified to withdraw.');
  if (amount <= 0) throw new Error('Amount must be greater than zero.');

  const db = getFirestoreDb();
  const wallet = await fetchWallet(uid);
  if (amount > wallet.balance) throw new Error('Insufficient balance.');

  const ref = doc(collection(db, WITHDRAWALS_COLLECTION));
  const withdrawal: Omit<Withdrawal, 'id'> = {
    uid, userName, userEmail, amount, method, status: 'pending',
    requestedAt: new Date().toISOString(),
    upiId: kyc.upiId, bankName: kyc.bankName,
    accountNumber: kyc.accountNumber, ifsc: kyc.ifsc, accountHolder: kyc.accountHolder,
  };
  await setDoc(ref, withdrawal);
  await updateDoc(doc(db, WALLET_COLLECTION, uid), {
    balance: wallet.balance - amount,
    pendingWithdrawals: wallet.pendingWithdrawals + amount,
    updatedAt: serverTimestamp(),
  });
  await addTransaction(uid, 'withdrawal', `Withdrawal request (${method.toUpperCase()})`, -amount, 'pending', method);
}

export async function adminProcessWithdrawal(
  withdrawalId: string,
  action: 'approve' | 'reject' | 'mark_paid',
  adminNote?: string
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const wSnap = await getDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId));
  if (!wSnap.exists()) throw new Error('Withdrawal not found.');
  const w = { id: wSnap.id, ...(wSnap.data() as Omit<Withdrawal, 'id'>) };

  const statusMap: Record<typeof action, WithdrawalStatus> = {
    approve: 'approved', reject: 'rejected', mark_paid: 'paid',
  };
  await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), {
    status: statusMap[action], processedAt: new Date().toISOString(), adminNote: adminNote || '',
  });

  const wallet = await fetchWallet(w.uid);
  if (action === 'reject') {
    await updateDoc(doc(db, WALLET_COLLECTION, w.uid), {
      balance: wallet.balance + w.amount,
      pendingWithdrawals: Math.max(0, wallet.pendingWithdrawals - w.amount),
      updatedAt: serverTimestamp(),
    });
  } else if (action === 'mark_paid') {
    await updateDoc(doc(db, WALLET_COLLECTION, w.uid), {
      pendingWithdrawals: Math.max(0, wallet.pendingWithdrawals - w.amount),
      completedWithdrawals: wallet.completedWithdrawals + w.amount,
      updatedAt: serverTimestamp(),
    });
    await addTransaction(w.uid, 'withdrawal', `Withdrawal paid (${w.method.toUpperCase()})`, -w.amount, 'completed', w.method);
  }
}

export async function adminCreditWallet(uid: string, amount: number, reason: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  if (amount <= 0) throw new Error('Amount must be greater than zero.');
  const db = getFirestoreDb();
  const wallet = await fetchWallet(uid);
  await updateDoc(doc(db, WALLET_COLLECTION, uid), {
    balance: wallet.balance + amount,
    lifetimeEarnings: wallet.lifetimeEarnings + amount,
    updatedAt: serverTimestamp(),
  });
  await addTransaction(uid, 'credit', reason || 'Admin credit', amount, 'completed', 'admin');
}

export async function adminDebitWallet(uid: string, amount: number, reason: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  if (amount <= 0) throw new Error('Amount must be greater than zero.');
  const db = getFirestoreDb();
  const wallet = await fetchWallet(uid);
  if (amount > wallet.balance) throw new Error('Insufficient user balance.');
  await updateDoc(doc(db, WALLET_COLLECTION, uid), {
    balance: wallet.balance - amount,
    updatedAt: serverTimestamp(),
  });
  await addTransaction(uid, 'debit', reason || 'Admin debit', -amount, 'completed', 'admin');
}

export async function fetchKyc(uid: string): Promise<KycInfo | null> {
  if (!firebaseReady) return null;
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, KYC_COLLECTION, uid));
  return snap.exists() ? (snap.data() as KycInfo) : null;
}

export async function submitKyc(uid: string, data: {
  accountHolder: string; bankName: string; accountNumber: string; ifsc: string; upiId?: string;
}): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const kyc: KycInfo = {
    uid, accountHolder: data.accountHolder, bankName: data.bankName,
    accountNumber: data.accountNumber, ifsc: data.ifsc, upiId: data.upiId || '',
    status: 'pending', submittedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, KYC_COLLECTION, uid), kyc);
}

export async function adminUpdateKycStatus(uid: string, status: KycStatus, rejectionReason?: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await updateDoc(doc(db, KYC_COLLECTION, uid), {
    status, reviewedAt: new Date().toISOString(), rejectionReason: rejectionReason || '',
  });
}

export async function adminUpdateKyc(
  uid: string,
  data: { accountHolder: string; bankName: string; accountNumber: string; ifsc: string; upiId?: string; status?: KycStatus }
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await setDoc(
    doc(db, KYC_COLLECTION, uid),
    {
      uid,
      accountHolder: data.accountHolder,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifsc: data.ifsc,
      upiId: data.upiId || '',
      status: data.status || 'pending',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function fetchAllKyc(): Promise<KycInfo[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, KYC_COLLECTION));
  return snap.docs.map((d) => d.data() as KycInfo);
}

async function addTransaction(
  uid: string, type: TransactionType, label: string, amount: number,
  status: 'completed' | 'pending' | 'failed', method?: string
): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  const ref = doc(collection(db, TRANSACTIONS_COLLECTION));
  await setDoc(ref, {
    uid, type, label, amount, status, method: method || '', date: new Date().toISOString(),
  });
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}
