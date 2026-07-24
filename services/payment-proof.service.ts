import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { createNotification } from '@/services/notifications.service';
import { logAdminAction } from '@/services/audit-log.service';
import type { Withdrawal } from '@/types';

const WITHDRAWAL_REQUESTS_COLLECTION = 'withdrawal_requests';
const WITHDRAWALS_COLLECTION = 'withdrawals';

export interface PaymentProofInput {
  withdrawalId: string;
  transactionId?: string;
  referenceNumber?: string;
  paymentNotes?: string;
  paymentProofUrl?: string; // base64 or hosted image URL
  adminInfo?: {
    uid: string;
    name: string;
  };
}

export async function uploadPaymentProof(input: PaymentProofInput): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();

  let reqRef = doc(db, WITHDRAWAL_REQUESTS_COLLECTION, input.withdrawalId);
  let snap = await getDoc(reqRef);

  if (!snap.exists()) {
    reqRef = doc(db, WITHDRAWALS_COLLECTION, input.withdrawalId);
    snap = await getDoc(reqRef);
  }

  if (!snap.exists()) {
    throw new Error('Withdrawal request not found.');
  }

  const existingData = snap.data() as Withdrawal;

  const now = new Date().toISOString();
  const updateData: Partial<Withdrawal> = {
    ...(input.transactionId ? { transactionId: input.transactionId } : {}),
    ...(input.referenceNumber ? { referenceNumber: input.referenceNumber } : {}),
    ...(input.paymentNotes ? { paymentNotes: input.paymentNotes, adminNote: input.paymentNotes } : {}),
    ...(input.paymentProofUrl ? { paymentProofUrl: input.paymentProofUrl, paymentProofUploadedAt: now } : {}),
  };

  // Update in both collections for backward compatibility
  try {
    await updateDoc(doc(db, WITHDRAWAL_REQUESTS_COLLECTION, input.withdrawalId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch { /* best-effort */ }

  try {
    await updateDoc(doc(db, WITHDRAWALS_COLLECTION, input.withdrawalId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch { /* best-effort */ }

  // Send Notification to User
  try {
    await createNotification({
      uid: existingData.uid,
      title: 'Payment Proof Uploaded',
      message: `Payment proof and reference details (Ref: ${input.referenceNumber || input.transactionId || 'N/A'}) have been attached to your withdrawal request.`,
      type: 'success',
    });
  } catch { /* best-effort */ }

  // Audit log
  if (input.adminInfo) {
    await logAdminAction({
      adminUid: input.adminInfo.uid,
      adminName: input.adminInfo.name,
      action: 'Payment Proof Uploaded',
      targetCollection: WITHDRAWAL_REQUESTS_COLLECTION,
      targetDocument: input.withdrawalId,
      oldValues: {
        transactionId: existingData.transactionId,
        referenceNumber: existingData.referenceNumber,
      },
      newValues: updateData,
    });
  }
}
