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
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { fetchSystemSettings } from '@/services/system-settings.service';
import { fetchWithdrawalSettings } from '@/services/withdrawal-settings.service';
import {
  validatePlatformReserve,
  recordFinancialMovement,
} from '@/services/platform-finance.service';
import { logAdminAction } from '@/services/audit-log.service';
import { createNotification } from '@/services/notifications.service';
import type {
  KycInfo,
  KycStatus,
  WalletData,
  WalletTransaction,
  Withdrawal,
  WithdrawalMethod,
  WithdrawalStatus,
  TransactionType,
  PaymentMethodConfig,
} from '@/types';

const WALLET_COLLECTION = 'wallets';
const TRANSACTIONS_COLLECTION = 'transactions';
const WITHDRAWALS_COLLECTION = 'withdrawals';
const WITHDRAWAL_REQUESTS_COLLECTION = 'withdrawal_requests';
const KYC_COLLECTION = 'kyc';

function emptyWallet(uid: string): WalletData {
  return { uid, balance: 0, pendingBalance: 0, lifetimeEarnings: 0, pendingWithdrawals: 0, completedWithdrawals: 0 };
}

export async function fetchWallet(uid: string): Promise<WalletData> {
  if (!firebaseReady) return emptyWallet(uid);
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, WALLET_COLLECTION, uid));
  if (snap.exists()) return { ...emptyWallet(uid), ...(snap.data() as WalletData) };
  return emptyWallet(uid);
}

export function subscribeWallet(uid: string, callback: (wallet: WalletData) => void) {
  if (!firebaseReady) { callback(emptyWallet(uid)); return () => {}; }
  const db = getFirestoreDb();
  return onSnapshot(doc(db, WALLET_COLLECTION, uid), (snap) => {
    if (snap.exists()) callback({ ...emptyWallet(uid), ...(snap.data() as WalletData) });
    else callback(emptyWallet(uid));
  });
}

export async function fetchTransactions(uid: string): Promise<WalletTransaction[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  try {
    const snap = await getDocs(
      query(collection(db, TRANSACTIONS_COLLECTION), where('uid', '==', uid))
    );
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WalletTransaction, 'id'>) }));
    return list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  } catch {
    return [];
  }
}

export function subscribeTransactions(uid: string, callback: (txns: WalletTransaction[]) => void) {
  if (!firebaseReady) { callback([]); return () => {}; }
  const db = getFirestoreDb();
  const q = query(collection(db, TRANSACTIONS_COLLECTION), where('uid', '==', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WalletTransaction, 'id'>) }));
    list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeTransactions error:', err);
    callback([]);
  });
}

export function subscribeAllTransactions(callback: (txns: WalletTransaction[]) => void): () => void {
  if (!firebaseReady) { callback([]); return () => {}; }
  const db = getFirestoreDb();
  return onSnapshot(collection(db, TRANSACTIONS_COLLECTION), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WalletTransaction, 'id'>) }));
    list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeAllTransactions error:', err);
    callback([]);
  });
}

export async function fetchAllTransactions(): Promise<WalletTransaction[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  try {
    const snap = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WalletTransaction, 'id'>) }));
    return list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  } catch {
    return [];
  }
}

export async function fetchWithdrawals(uid: string): Promise<Withdrawal[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  try {
    const snapRequests = await getDocs(
      query(collection(db, WITHDRAWAL_REQUESTS_COLLECTION), where('uid', '==', uid))
    );
    if (!snapRequests.empty) {
      const list = snapRequests.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
      return list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    }
  } catch { /* best-effort fallback */ }

  const snap = await getDocs(
    query(collection(db, WITHDRAWALS_COLLECTION), where('uid', '==', uid))
  );
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
  return list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
}

export function subscribeWithdrawals(uid: string, callback: (withdrawals: Withdrawal[]) => void): () => void {
  if (!firebaseReady) { callback([]); return () => {}; }
  const db = getFirestoreDb();
  const q = query(collection(db, WITHDRAWAL_REQUESTS_COLLECTION), where('uid', '==', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
    list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeWithdrawals error:', err);
    callback([]);
  });
}

export async function fetchAllWithdrawals(): Promise<Withdrawal[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  try {
    const snapRequests = await getDocs(
      collection(db, WITHDRAWAL_REQUESTS_COLLECTION)
    );
    if (!snapRequests.empty) {
      const list = snapRequests.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
      return list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    }
  } catch { /* best-effort fallback */ }

  const snap = await getDocs(collection(db, WITHDRAWALS_COLLECTION));
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
  return list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
}

export function subscribeAllWithdrawals(callback: (withdrawals: Withdrawal[]) => void): () => void {
  if (!firebaseReady) { callback([]); return () => {}; }
  const db = getFirestoreDb();
  return onSnapshot(collection(db, WITHDRAWAL_REQUESTS_COLLECTION), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Withdrawal, 'id'>) }));
    list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeAllWithdrawals error:', err);
    callback([]);
  });
}

/**
 * Core function for modifying wallet balance with mandatory transaction log
 */
export async function recordWalletTransaction(params: {
  uid: string;
  type: TransactionType;
  label: string;
  amount: number; // positive for additions, negative for deductions/withdrawals
  method?: string;
  referenceId?: string;
  status?: 'completed' | 'pending' | 'failed';
}): Promise<WalletTransaction> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();

  const currentWallet = await fetchWallet(params.uid);
  const status = params.status || 'completed';
  const newBalance = currentWallet.balance + params.amount;
  if (newBalance < 0 && params.type !== 'penalty') {
    throw new Error('Insufficient wallet balance.');
  }

  const isEarning = params.amount > 0 && ['referral', 'referral_commission', 'purchase', 'microtask', 'daily_reward', 'admin_credit', 'bonus', 'cashback', 'credit'].includes(params.type);
  const newLifetime = isEarning ? currentWallet.lifetimeEarnings + params.amount : currentWallet.lifetimeEarnings;

  // 1. Update/Set wallet balance safely with merge
  await setDoc(doc(db, WALLET_COLLECTION, params.uid), {
    uid: params.uid,
    balance: Math.max(0, newBalance),
    pendingBalance: currentWallet.pendingBalance || 0,
    lifetimeEarnings: newLifetime,
    pendingWithdrawals: currentWallet.pendingWithdrawals || 0,
    completedWithdrawals: currentWallet.completedWithdrawals || 0,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // 2. Also update affiliates collection availableBalance for consistency if it exists
  try {
    const affRef = doc(db, 'affiliates', params.uid);
    const affSnap = await getDoc(affRef);
    if (affSnap.exists()) {
      await setDoc(affRef, { availableBalance: Math.max(0, newBalance), updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch { /* best-effort */ }

  // 3. Create wallet transaction record
  const txnDoc = doc(collection(db, TRANSACTIONS_COLLECTION));
  const txn: WalletTransaction = {
    id: txnDoc.id,
    uid: params.uid,
    type: params.type,
    label: params.label,
    amount: params.amount,
    status,
    method: params.method || '',
    referenceId: params.referenceId || '',
    date: new Date().toISOString().split('T')[0],
  };

  await setDoc(txnDoc, { ...txn, createdAt: serverTimestamp() });
  return txn;
}

export async function requestWithdrawal(
  uid: string,
  userName: string,
  userEmail: string,
  amount: number,
  methodOrConfig: WithdrawalMethod | PaymentMethodConfig,
  paymentDetails: Record<string, string> = {},
  kyc: KycInfo | null = null,
  options?: { isMicrotask?: boolean }
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');

  // Fetch Global Withdrawal Settings
  const globalSettings = await fetchWithdrawalSettings();
  const sysSettings = await fetchSystemSettings();

  if (!sysSettings.walletEnabled || !globalSettings.withdrawalsEnabled || globalSettings.maintenanceMode) {
    throw new Error(globalSettings.adminMessage || 'Wallet withdrawals are currently disabled for maintenance.');
  }

  if (globalSettings.requireKYC && (!kyc || kyc.status !== 'verified')) {
    throw new Error('KYC verification is required before requesting a withdrawal.');
  }

  // Weekend check
  if (!globalSettings.allowWeekendWithdrawals) {
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      throw new Error('Withdrawals are disabled on weekends as per platform settings.');
    }
  }

  if (!amount || amount <= 0) {
    throw new Error('Please enter a valid withdrawal amount greater than zero.');
  }

  // Determine method config
  let methodConfig: Partial<PaymentMethodConfig> = {};
  if (typeof methodOrConfig === 'object' && methodOrConfig !== null) {
    methodConfig = methodOrConfig;
  } else {
    methodConfig = {
      id: String(methodOrConfig),
      name: String(methodOrConfig).toUpperCase(),
    };
  }

  const methodId = methodConfig.id || 'general';
  const methodName = methodConfig.name || methodId.toUpperCase();

  // Validate Required Fields for payment method
  if (methodConfig.requiredFields && methodConfig.requiredFields.length > 0) {
    for (const field of methodConfig.requiredFields) {
      if (field.required && (!paymentDetails[field.key] || !paymentDetails[field.key].trim())) {
        throw new Error(`Please provide "${field.label}" to proceed with ${methodName} withdrawal.`);
      }
    }
  }

  // 1. Minimum Withdrawal Limit
  const minLimit = Math.max(
    methodConfig.minimumWithdraw || 0,
    globalSettings.globalMinimumWithdrawal || 500
  );

  if (amount < minLimit) {
    const remaining = minLimit - amount;
    throw new Error(
      `Minimum withdrawal amount for ${methodName} is ₹${formatINR(minLimit)}. You need ₹${formatINR(remaining)} more.`
    );
  }

  // 2. Maximum Withdrawal Limit
  const maxLimit = Math.min(
    methodConfig.maximumWithdraw || Infinity,
    globalSettings.globalMaximumWithdrawal || 50000
  );

  if (amount > maxLimit) {
    throw new Error(`Maximum withdrawal amount per request for ${methodName} is ₹${formatINR(maxLimit)}.`);
  }

  // 3. Pending Withdrawals Count & Cooldown Check
  const userWithdrawals = await fetchWithdrawals(uid);
  const pendingRequests = userWithdrawals.filter((w) => w.status === 'pending');

  if (pendingRequests.length >= (globalSettings.maximumPendingWithdrawals || 3)) {
    throw new Error(
      `You have reached the maximum allowed limit of ${globalSettings.maximumPendingWithdrawals} pending withdrawal requests.`
    );
  }

  if (userWithdrawals.length > 0 && globalSettings.withdrawalCooldownHours > 0) {
    const latestReq = userWithdrawals.reduce((latest, current) =>
      new Date(current.requestedAt).getTime() > new Date(latest.requestedAt).getTime() ? current : latest
    );
    const hoursSince = (Date.now() - new Date(latestReq.requestedAt).getTime()) / (1000 * 3600);
    if (hoursSince < globalSettings.withdrawalCooldownHours) {
      const hoursRemaining = Math.ceil(globalSettings.withdrawalCooldownHours - hoursSince);
      throw new Error(
        `Withdrawal cooldown active. Please wait ${hoursRemaining} hour(s) before submitting another request.`
      );
    }
  }

  // Daily & Weekly Limits Check
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTotal = userWithdrawals
    .filter((w) => w.requestedAt.startsWith(todayStr) && w.status !== 'rejected')
    .reduce((sum, w) => sum + w.amount, 0);

  if (todayTotal + amount > globalSettings.dailyWithdrawalLimit) {
    throw new Error(
      `Daily withdrawal limit of ₹${formatINR(globalSettings.dailyWithdrawalLimit)} exceeded. Remaining today: ₹${formatINR(Math.max(0, globalSettings.dailyWithdrawalLimit - todayTotal))}.`
    );
  }

  // 4. Check Wallet Available Balance
  const wallet = await fetchWallet(uid);
  if (amount > wallet.balance) {
    throw new Error(`Insufficient available balance. Your current balance is ₹${formatINR(wallet.balance)}.`);
  }

  // 5. Calculate Fee
  let fee = 0;
  if (typeof methodConfig.withdrawFee === 'number' && methodConfig.withdrawFee >= 0) {
    fee = methodConfig.withdrawFeeType === 'percentage'
      ? Math.round((amount * methodConfig.withdrawFee) / 100)
      : methodConfig.withdrawFee;
  } else {
    fee = sysSettings.withdrawals.withdrawalFeeType === 'percentage'
      ? Math.round((amount * sysSettings.withdrawals.withdrawalFee) / 100)
      : sysSettings.withdrawals.withdrawalFee;
  }

  const netAmount = Math.max(0, amount - fee);
  const autoApprove = globalSettings.autoApprove || sysSettings.withdrawals.autoApprove;
  const initStatus: WithdrawalStatus = autoApprove ? 'approved' : 'pending';

  const db = getFirestoreDb();
  const reqRef = doc(collection(db, WITHDRAWAL_REQUESTS_COLLECTION));

  const withdrawal: Omit<Withdrawal, 'id'> = {
    uid,
    userName,
    userEmail,
    amount,
    fee,
    netAmount,
    method: methodId,
    methodName,
    status: initStatus,
    requestedAt: new Date().toISOString(),
    paymentDetails,
    upiId: paymentDetails['upiId'] || paymentDetails['paytmNumber'] || paymentDetails['gpayNumber'] || paymentDetails['phonepeNumber'] || (kyc ? kyc.upiId : '') || '',
    bankName: paymentDetails['bankName'] || (kyc ? kyc.bankName : '') || '',
    accountNumber: paymentDetails['accountNumber'] || (kyc ? kyc.accountNumber : '') || '',
    ifsc: paymentDetails['ifsc'] || (kyc ? kyc.ifsc : '') || '',
    accountHolder: paymentDetails['accountHolder'] || (kyc ? kyc.accountHolder : '') || '',
    ...(fee > 0 ? { adminNote: `Processing Fee applied: ₹${formatINR(fee)}` } : {}),
  };

  // Write to withdrawal_requests and legacy withdrawals collections for complete compatibility
  await setDoc(reqRef, { ...withdrawal, id: reqRef.id });
  await setDoc(doc(db, WITHDRAWALS_COLLECTION, reqRef.id), { ...withdrawal, id: reqRef.id });

  // Update wallet
  await updateDoc(doc(db, WALLET_COLLECTION, uid), {
    balance: wallet.balance - amount,
    pendingWithdrawals: wallet.pendingWithdrawals + amount,
    updatedAt: serverTimestamp(),
  });

  await recordWalletTransaction({
    uid,
    type: 'withdrawal',
    label: `Withdrawal request via ${methodName}${fee > 0 ? ` [Fee ₹${fee}]` : ''}`,
    amount: -amount,
    status: autoApprove ? 'completed' : 'pending',
    method: methodId,
    referenceId: reqRef.id,
  });

  // Track financial movement
  await recordFinancialMovement({ action: 'request', amount });

  // Send Notification to User
  await createNotification({
    uid,
    title: 'Withdrawal Requested',
    message: `Your withdrawal request of ₹${formatINR(amount)} via ${methodName} has been submitted successfully.`,
    type: 'info',
  });
}

export async function adminProcessWithdrawal(
  withdrawalId: string,
  action: 'approve' | 'reject' | 'mark_paid',
  adminNote?: string,
  adminInfo?: { uid: string; name: string },
  proofDetails?: {
    transactionId?: string;
    referenceNumber?: string;
    paymentNotes?: string;
    paymentProofUrl?: string;
  }
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();

  let wSnap = await getDoc(doc(db, WITHDRAWAL_REQUESTS_COLLECTION, withdrawalId));
  if (!wSnap.exists()) {
    wSnap = await getDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId));
  }
  if (!wSnap.exists()) throw new Error('Withdrawal request not found.');

  const w = { id: wSnap.id, ...(wSnap.data() as Omit<Withdrawal, 'id'>) };

  // IDEMPOTENCY & SECURITY CHECKS
  if (action === 'approve') {
    if (w.status === 'approved' || w.status === 'paid') {
      throw new Error(`Withdrawal request #${withdrawalId} is already approved or paid.`);
    }
    if (w.status === 'rejected') {
      throw new Error(`Cannot approve a previously rejected withdrawal.`);
    }

    // Validate platform financial reserve
    await validatePlatformReserve(w.amount);
  }

  if (action === 'reject') {
    if (w.status === 'rejected') {
      throw new Error(`Withdrawal request #${withdrawalId} has already been rejected and refunded.`);
    }
    if (w.status === 'paid') {
      throw new Error(`Cannot reject a withdrawal that has already been paid out.`);
    }
  }

  if (action === 'mark_paid') {
    if (w.status === 'paid') {
      throw new Error(`Withdrawal request #${withdrawalId} is already marked as paid.`);
    }
    if (w.status === 'rejected') {
      throw new Error(`Cannot mark a rejected withdrawal as paid.`);
    }
  }

  const statusMap: Record<typeof action, WithdrawalStatus> = {
    approve: 'approved',
    reject: 'rejected',
    mark_paid: 'paid',
  };

  const now = new Date().toISOString();
  const updateData: Record<string, any> = {
    status: statusMap[action],
    processedAt: now,
    ...(action === 'mark_paid' ? { paidAt: now } : {}),
    ...(adminNote ? { adminNote } : {}),
    ...(proofDetails?.transactionId ? { transactionId: proofDetails.transactionId } : {}),
    ...(proofDetails?.referenceNumber ? { referenceNumber: proofDetails.referenceNumber } : {}),
    ...(proofDetails?.paymentNotes ? { paymentNotes: proofDetails.paymentNotes } : {}),
    ...(proofDetails?.paymentProofUrl ? { paymentProofUrl: proofDetails.paymentProofUrl, paymentProofUploadedAt: now } : {}),
  };

  // Update in both collections
  try {
    await updateDoc(doc(db, WITHDRAWAL_REQUESTS_COLLECTION, withdrawalId), updateData);
  } catch { /* best-effort */ }

  try {
    await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), updateData);
  } catch { /* best-effort */ }

  const wallet = await fetchWallet(w.uid);

  if (action === 'approve') {
    await recordFinancialMovement({ action: 'approve', amount: w.amount });

    await createNotification({
      uid: w.uid,
      title: 'Withdrawal Approved',
      message: `Your withdrawal request of ₹${formatINR(w.amount)} has been approved and queued for payout.`,
      type: 'success',
    });

    if (adminInfo) {
      await logAdminAction({
        adminUid: adminInfo.uid,
        adminName: adminInfo.name,
        action: 'Withdrawal Approved',
        targetCollection: WITHDRAWAL_REQUESTS_COLLECTION,
        targetDocument: withdrawalId,
        oldValues: { status: w.status },
        newValues: updateData,
      });
    }
  } else if (action === 'reject') {
    await updateDoc(doc(db, WALLET_COLLECTION, w.uid), {
      balance: wallet.balance + w.amount,
      pendingWithdrawals: Math.max(0, wallet.pendingWithdrawals - w.amount),
      updatedAt: serverTimestamp(),
    });

    await recordWalletTransaction({
      uid: w.uid,
      type: 'refund',
      label: `Refund for rejected withdrawal (${w.id.slice(0, 8)})`,
      amount: w.amount,
      status: 'completed',
      method: 'system',
      referenceId: w.id,
    });

    await recordFinancialMovement({ action: 'reject', amount: w.amount });

    await createNotification({
      uid: w.uid,
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request of ₹${formatINR(w.amount)} was rejected.${adminNote ? ` Reason: ${adminNote}` : ''} Balance refunded.`,
      type: 'warning',
    });

    if (adminInfo) {
      await logAdminAction({
        adminUid: adminInfo.uid,
        adminName: adminInfo.name,
        action: 'Withdrawal Rejected',
        targetCollection: WITHDRAWAL_REQUESTS_COLLECTION,
        targetDocument: withdrawalId,
        oldValues: { status: w.status },
        newValues: updateData,
      });
    }
  } else if (action === 'mark_paid') {
    await updateDoc(doc(db, WALLET_COLLECTION, w.uid), {
      pendingWithdrawals: Math.max(0, wallet.pendingWithdrawals - w.amount),
      completedWithdrawals: wallet.completedWithdrawals + w.amount,
      updatedAt: serverTimestamp(),
    });

    await recordFinancialMovement({ action: 'pay', amount: w.amount, fee: w.fee || 0 });

    await createNotification({
      uid: w.uid,
      title: 'Withdrawal Paid',
      message: `Your withdrawal of ₹${formatINR(w.amount)} has been paid out successfully! ${proofDetails?.referenceNumber ? `(Ref: ${proofDetails.referenceNumber})` : ''}`,
      type: 'success',
    });

    if (adminInfo) {
      await logAdminAction({
        adminUid: adminInfo.uid,
        adminName: adminInfo.name,
        action: 'Withdrawal Paid',
        targetCollection: WITHDRAWAL_REQUESTS_COLLECTION,
        targetDocument: withdrawalId,
        oldValues: { status: w.status },
        newValues: updateData,
      });
    }
  }
}

export async function adminCreditWallet(
  uid: string,
  amount: number,
  reason: string,
  adminInfo?: { uid: string; name: string }
): Promise<void> {
  if (amount <= 0) throw new Error('Amount must be greater than zero.');
  await recordWalletTransaction({
    uid,
    type: 'admin_credit',
    label: reason || 'Admin Credit',
    amount,
    method: 'admin',
    status: 'completed',
  });

  if (adminInfo) {
    await logAdminAction({
      adminUid: adminInfo.uid,
      adminName: adminInfo.name,
      action: 'Wallet Credited',
      targetCollection: 'wallets',
      targetDocument: uid,
      newValues: { amount, reason },
    });
  }
}

export async function adminDebitWallet(
  uid: string,
  amount: number,
  reason: string,
  adminInfo?: { uid: string; name: string }
): Promise<void> {
  if (amount <= 0) throw new Error('Amount must be greater than zero.');
  await recordWalletTransaction({
    uid,
    type: 'penalty',
    label: reason || 'Admin Debit',
    amount: -amount,
    method: 'admin',
    status: 'completed',
  });

  if (adminInfo) {
    await logAdminAction({
      adminUid: adminInfo.uid,
      adminName: adminInfo.name,
      action: 'Wallet Debited',
      targetCollection: 'wallets',
      targetDocument: uid,
      newValues: { amount, reason },
    });
  }
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

export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}
