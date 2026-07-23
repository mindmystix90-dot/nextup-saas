import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { firebaseReady, getFirestoreDb } from '@/lib/firebase';

export type PublicIdType = 'user' | 'payment' | 'order' | 'enrollment' | 'affiliate' | 'salesPartner' | 'support' | 'certificate' | 'coupon';

const ID_CONFIG: Record<PublicIdType, { prefix: string; dateScoped: boolean; pad: number }> = {
  user: { prefix: 'NU', dateScoped: true, pad: 4 },
  payment: { prefix: 'PAY', dateScoped: true, pad: 4 },
  order: { prefix: 'ORD', dateScoped: true, pad: 4 },
  enrollment: { prefix: 'ENR', dateScoped: true, pad: 4 },
  affiliate: { prefix: 'AFF', dateScoped: false, pad: 6 },
  salesPartner: { prefix: 'SP', dateScoped: false, pad: 6 },
  support: { prefix: 'SUP', dateScoped: false, pad: 6 },
  certificate: { prefix: 'CERT', dateScoped: false, pad: 6 },
  coupon: { prefix: 'CPN', dateScoped: false, pad: 6 },
};

function dateKey(date = new Date()): string {
  return date.toISOString().slice(2, 10).replace(/-/g, '');
}

function counterKey(type: PublicIdType, date = new Date()): string {
  const config = ID_CONFIG[type];
  return config.dateScoped ? `${type}_${dateKey(date)}` : type;
}

export function formatPublicId(type: PublicIdType, sequence: number, date = new Date()): string {
  const config = ID_CONFIG[type];
  const suffix = String(sequence).padStart(config.pad, '0');
  return config.dateScoped ? `${config.prefix}-${dateKey(date)}-${suffix}` : `${config.prefix}-${suffix}`;
}

export async function generatePublicId(type: PublicIdType, date = new Date()): Promise<string> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');

  const db = getFirestoreDb();
  const ref = doc(db, 'admin_counters', counterKey(type, date));

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const current = snap.exists() ? Number(snap.data().sequence || 0) : 0;
    const next = current + 1;

    transaction.set(ref, {
      type,
      sequence: next,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return formatPublicId(type, next, date);
  });
}
