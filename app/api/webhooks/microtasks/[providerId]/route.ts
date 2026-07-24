import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { recordWalletTransaction } from '@/services/wallet.service';
import { createNotification } from '@/services/notifications.service';
import { recordAuditLog } from '@/services/audit-log.service';

const WEBHOOK_LOGS_COLLECTION = 'microtask_webhook_logs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;

  try {
    const body = await req.json();
    const signature = req.headers.get('x-provider-signature') || req.headers.get('authorization') || '';

    if (!firebaseReady) {
      return NextResponse.json({ success: false, error: 'Database initializing' }, { status: 503 });
    }

    const db = getFirestoreDb();

    // 1. Fetch Provider Config
    const pSnap = await getDoc(doc(db, 'microtask_providers', providerId));
    if (!pSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
    }

    const provider = pSnap.data();
    if (!provider.enabled) {
      return NextResponse.json({ success: false, error: 'Provider disabled' }, { status: 403 });
    }

    // 2. Extract Event Data
    const {
      eventId,
      submissionId,
      externalTaskId,
      uid,
      status, // 'approved' | 'rejected'
      reward,
      reason,
    } = body;

    const webhookEventId = eventId || `${providerId}_${submissionId}_${Date.now()}`;

    // 3. Idempotency Check
    const logRef = doc(db, WEBHOOK_LOGS_COLLECTION, webhookEventId);
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      return NextResponse.json({ success: true, message: 'Event already processed (idempotent)' });
    }

    // Record webhook log
    await setDoc(logRef, {
      id: webhookEventId,
      providerId,
      payload: body,
      processedAt: new Date().toISOString(),
      status: 'received',
    });

    if (status === 'approved') {
      const payoutAmount = Number(reward) || 10;

      // Credit User Unified Wallet
      await recordWalletTransaction({
        uid,
        type: 'microtask',
        label: `Microtask Provider Approval (${provider.name} - Task #${externalTaskId || submissionId})`,
        amount: payoutAmount,
        method: 'microtask_webhook',
        referenceId: submissionId || externalTaskId,
        status: 'completed',
      });

      // Notify User
      await createNotification({
        uid,
        title: `Microtask Approved! 🎉 (${provider.name})`,
        message: `Your completed offer on ${provider.name} was approved. ₹${payoutAmount} has been credited to your wallet.`,
        type: 'success',
      });

      await updateDoc(logRef, { status: 'processed_approved' });
    } else if (status === 'rejected') {
      await createNotification({
        uid,
        title: `Microtask Offer Rejected (${provider.name})`,
        message: `Your submission for offer ${externalTaskId || ''} was rejected by ${provider.name}. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'warning',
      });

      await updateDoc(logRef, { status: 'processed_rejected' });
    }

    await recordAuditLog({
      action: 'microtask_webhook_received',
      adminUid: `webhook_${providerId}`,
      adminName: `Provider Webhook (${providerId})`,
      targetCollection: WEBHOOK_LOGS_COLLECTION,
      targetDocument: webhookEventId,
      newValues: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      eventId: webhookEventId,
    });
  } catch (err: any) {
    console.error('Microtask Webhook Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
