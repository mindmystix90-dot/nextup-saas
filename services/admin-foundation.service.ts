import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { firebaseReady, getFirestoreDb } from '@/lib/firebase';

export interface AdminCollectionRecord {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  updatedAt?: string;
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asDateText(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === 'function') return maybeTimestamp.toDate().toISOString();
  }
  return undefined;
}

export async function fetchAdminCollectionRecords(collectionName: string, max = 25): Promise<AdminCollectionRecord[]> {
  if (!firebaseReady) return [];

  const db = getFirestoreDb();
  let snap;

  try {
    snap = await getDocs(query(collection(db, collectionName), orderBy('updatedAt', 'desc'), limit(max)));
  } catch {
    snap = await getDocs(query(collection(db, collectionName), limit(max)));
  }

  return snap.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const title =
      asText(data.title) ||
      asText(data.name) ||
      asText(data.email) ||
      asText(data.subject) ||
      asText(data.code) ||
      docSnap.id;
    const subtitle =
      asText(data.description) ||
      asText(data.subtitle) ||
      asText(data.email) ||
      asText(data.phone) ||
      asText(data.userId) ||
      asText(data.uid);
    const status = asText(data.status) || (typeof data.active === 'boolean' ? (data.active ? 'Active' : 'Inactive') : undefined);

    return {
      id: docSnap.id,
      title,
      subtitle,
      status,
      updatedAt: asDateText(data.updatedAt) || asDateText(data.createdAt) || asDateText(data.date),
    };
  });
}
