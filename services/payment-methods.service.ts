import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { PaymentMethodConfig } from '@/types';

const COLLECTION_NAME = 'payment_methods';

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'upi',
    name: 'UPI Transfer',
    enabled: true,
    minimumWithdraw: 100,
    maximumWithdraw: 50000,
    withdrawFee: 0,
    withdrawFeeType: 'fixed',
    processingTime: 'Instant - 2 Hours',
    instructions: 'Enter your valid VPA/UPI ID (e.g. user@upi). Payment will be credited directly.',
    requiredFields: [
      { key: 'upiId', label: 'UPI ID / VPA', placeholder: 'e.g. username@upi or 9876543210@paytm', required: true, type: 'text' },
    ],
    displayOrder: 1,
  },
  {
    id: 'bank',
    name: 'Bank Transfer (NEFT / IMPS)',
    enabled: true,
    minimumWithdraw: 500,
    maximumWithdraw: 200000,
    withdrawFee: 10,
    withdrawFeeType: 'fixed',
    processingTime: '1 - 24 Hours',
    instructions: 'Provide exact bank details matching your account holder name.',
    requiredFields: [
      { key: 'accountHolder', label: 'Account Holder Name', placeholder: 'Full Name as per bank', required: true, type: 'text' },
      { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. State Bank of India, HDFC', required: true, type: 'text' },
      { key: 'accountNumber', label: 'Account Number', placeholder: 'e.g. 123456789012', required: true, type: 'text' },
      { key: 'ifsc', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234', required: true, type: 'text' },
    ],
    displayOrder: 2,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    enabled: true,
    minimumWithdraw: 1000,
    maximumWithdraw: 100000,
    withdrawFee: 2.5,
    withdrawFeeType: 'percentage',
    processingTime: '2 - 12 Hours',
    instructions: 'Payout will be sent to your verified PayPal email address in USD conversion equivalent.',
    requiredFields: [
      { key: 'paypalEmail', label: 'PayPal Email Address', placeholder: 'your-email@example.com', required: true, type: 'email' },
    ],
    displayOrder: 3,
  },
  {
    id: 'paytm',
    name: 'Paytm Wallet / UPI',
    enabled: true,
    minimumWithdraw: 100,
    maximumWithdraw: 25000,
    withdrawFee: 0,
    withdrawFeeType: 'fixed',
    processingTime: 'Instant',
    instructions: 'Enter registered Paytm mobile number or Paytm UPI ID.',
    requiredFields: [
      { key: 'paytmNumber', label: 'Paytm Number / UPI', placeholder: '9876543210 or 9876543210@paytm', required: true, type: 'text' },
    ],
    displayOrder: 4,
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    enabled: true,
    minimumWithdraw: 100,
    maximumWithdraw: 50000,
    withdrawFee: 0,
    withdrawFeeType: 'fixed',
    processingTime: 'Instant',
    instructions: 'Enter PhonePe registered mobile or UPI handle.',
    requiredFields: [
      { key: 'phonepeNumber', label: 'PhonePe Mobile or UPI', placeholder: '9876543210@ybl', required: true, type: 'text' },
    ],
    displayOrder: 5,
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    enabled: true,
    minimumWithdraw: 100,
    maximumWithdraw: 50000,
    withdrawFee: 0,
    withdrawFeeType: 'fixed',
    processingTime: 'Instant',
    instructions: 'Enter Google Pay registered mobile or UPI ID.',
    requiredFields: [
      { key: 'gpayNumber', label: 'GPay Mobile or UPI ID', placeholder: '9876543210@okicici', required: true, type: 'text' },
    ],
    displayOrder: 6,
  },
  {
    id: 'binance_pay',
    name: 'Binance Pay',
    enabled: true,
    minimumWithdraw: 500,
    maximumWithdraw: 500000,
    withdrawFee: 0,
    withdrawFeeType: 'fixed',
    processingTime: '1 - 6 Hours',
    instructions: 'Provide your Binance Pay ID (Pay ID, Email, or Phone). Zero gas fees.',
    requiredFields: [
      { key: 'binanceId', label: 'Binance Pay ID / Email', placeholder: '123456789 or binance-email@domain.com', required: true, type: 'text' },
    ],
    displayOrder: 7,
  },
  {
    id: 'usdt_trc20',
    name: 'USDT (TRC20)',
    enabled: true,
    minimumWithdraw: 1000,
    maximumWithdraw: 500000,
    withdrawFee: 1,
    withdrawFeeType: 'fixed',
    processingTime: '15 - 60 Mins',
    instructions: 'Ensure destination supports TRON network TRC20 token transfers.',
    requiredFields: [
      { key: 'walletAddress', label: 'USDT TRC20 Address', placeholder: 'T...', required: true, type: 'text' },
      { key: 'network', label: 'Network', placeholder: 'TRON (TRC20)', required: true, type: 'text' },
    ],
    displayOrder: 8,
  },
  {
    id: 'usdt_bep20',
    name: 'USDT (BEP20)',
    enabled: true,
    minimumWithdraw: 1000,
    maximumWithdraw: 500000,
    withdrawFee: 0.5,
    withdrawFeeType: 'fixed',
    processingTime: '15 - 60 Mins',
    instructions: 'Ensure destination supports BNB Smart Chain (BEP20) network.',
    requiredFields: [
      { key: 'walletAddress', label: 'USDT BEP20 Address', placeholder: '0x...', required: true, type: 'text' },
      { key: 'network', label: 'Network', placeholder: 'BNB Smart Chain (BEP20)', required: true, type: 'text' },
    ],
    displayOrder: 9,
  },
  {
    id: 'manual',
    name: 'Manual Payment',
    enabled: false,
    minimumWithdraw: 100,
    maximumWithdraw: 100000,
    withdrawFee: 0,
    withdrawFeeType: 'fixed',
    processingTime: 'Manual Review',
    instructions: 'Provide custom payment routing or gift card payout details.',
    requiredFields: [
      { key: 'accountNote', label: 'Custom Account Details / Note', placeholder: 'Specify instructions or custom account ID', required: true, type: 'text' },
    ],
    displayOrder: 10,
  },
];

/**
 * Seed default payment methods if collection is empty
 */
async function seedDefaultMethodsIfNeeded(db: ReturnType<typeof getFirestoreDb>) {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      for (const m of DEFAULT_PAYMENT_METHODS) {
        await setDoc(doc(db, COLLECTION_NAME, m.id), {
          ...m,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch {
    /* best-effort */
  }
}

/**
 * Fetch all payment methods from Firestore
 */
export async function fetchPaymentMethods(): Promise<PaymentMethodConfig[]> {
  if (!firebaseReady) return DEFAULT_PAYMENT_METHODS;
  const db = getFirestoreDb();
  await seedDefaultMethodsIfNeeded(db);

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('displayOrder', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) return DEFAULT_PAYMENT_METHODS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentMethodConfig, 'id'>) }));
  } catch {
    return DEFAULT_PAYMENT_METHODS;
  }
}

/**
 * Real-time subscription to payment methods
 */
export function subscribePaymentMethods(callback: (methods: PaymentMethodConfig[]) => void) {
  if (!firebaseReady) {
    callback(DEFAULT_PAYMENT_METHODS);
    return () => {};
  }

  const db = getFirestoreDb();
  seedDefaultMethodsIfNeeded(db);

  const q = query(collection(db, COLLECTION_NAME), orderBy('displayOrder', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        callback(DEFAULT_PAYMENT_METHODS);
      } else {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentMethodConfig, 'id'>) }));
        callback(items);
      }
    },
    () => {
      callback(DEFAULT_PAYMENT_METHODS);
    }
  );
}

/**
 * Create or update a payment method
 */
export async function savePaymentMethod(config: PaymentMethodConfig): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not ready');
  const db = getFirestoreDb();

  const methodId = config.id.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'custom_method';
  const ref = doc(db, COLLECTION_NAME, methodId);

  const payload: PaymentMethodConfig = {
    ...config,
    id: methodId,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(ref, payload, { merge: true });
}

/**
 * Enable/Disable a payment method
 */
export async function togglePaymentMethodStatus(id: string, enabled: boolean): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not ready');
  const db = getFirestoreDb();
  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, { enabled, updatedAt: new Date().toISOString() });
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not ready');
  const db = getFirestoreDb();
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

/**
 * Reorder payment methods
 */
export async function reorderPaymentMethods(orderedIds: string[]): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index];
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, { displayOrder: index + 1, updatedAt: new Date().toISOString() });
  }
}
