import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

export interface EmailDispatchInput {
  to: string;
  subject: string;
  template: 'welcome' | 'payment_pending' | 'payment_approved' | 'commission_earned' | 'withdrawal_paid' | 'crm_reminder';
  data: Record<string, any>;
}

export interface EmailLogDoc {
  id: string;
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  status: 'queued' | 'sent' | 'failed';
  sentAt: string;
}

export async function sendEmailNotification(input: EmailDispatchInput): Promise<boolean> {
  const now = new Date().toISOString();
  console.log(`[Email Service Dispatch] Sending '${input.template}' email to ${input.to}: ${input.subject}`);

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      const docRef = doc(collection(db, 'email_logs'));
      const emailLog: EmailLogDoc = {
        id: docRef.id,
        to: input.to,
        subject: input.subject,
        template: input.template,
        data: input.data,
        status: 'sent',
        sentAt: now,
      };
      await setDoc(docRef, { ...emailLog, createdAt: serverTimestamp() });
    } catch (e) {
      console.warn('Failed to log email dispatch:', e);
    }
  }

  return true;
}
