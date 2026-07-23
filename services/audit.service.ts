import { collection, doc, setDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

export interface AuditLogEntry {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetCollection?: string;
  targetDocId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

const AUDIT_COLLECTION = 'auditLogs';

export async function logAdminAction(
  entry: Omit<AuditLogEntry, 'id' | 'createdAt'>
): Promise<void> {
  const now = new Date().toISOString();
  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      const docRef = doc(collection(db, AUDIT_COLLECTION));
      const logData: AuditLogEntry = {
        id: docRef.id,
        ...entry,
        createdAt: now,
      };
      await setDoc(docRef, { ...logData, createdAt: serverTimestamp() });
    } catch (e) {
      console.warn('Failed to record audit log:', e);
    }
  }
}

export async function fetchAuditLogs(max: number = 50): Promise<AuditLogEntry[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, AUDIT_COLLECTION), orderBy('createdAt', 'desc'), limit(max))
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLogEntry, 'id'>) }));
  } catch (e) {
    console.warn('Failed to fetch audit logs:', e);
    return [];
  }
}
