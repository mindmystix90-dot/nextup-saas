import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { AdminAuditLog } from '@/types';

const AUDIT_LOGS_COLLECTION = 'admin_audit_logs';

export async function logAdminAction(params: {
  adminUid: string;
  adminName: string;
  adminEmail?: string;
  action: string;
  targetCollection: string;
  targetDocument: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
}): Promise<void> {
  if (!firebaseReady) return;

  try {
    const db = getFirestoreDb();
    const logDoc = doc(collection(db, AUDIT_LOGS_COLLECTION));
    const now = new Date().toISOString();

    const logItem: AdminAuditLog = {
      id: logDoc.id,
      adminUid: params.adminUid || 'system_admin',
      adminName: params.adminName || 'Admin',
      adminEmail: params.adminEmail || '',
      action: params.action,
      targetCollection: params.targetCollection,
      targetDocument: params.targetDocument,
      oldValues: params.oldValues || {},
      newValues: params.newValues || {},
      timestamp: now,
      ipAddress: params.ipAddress || '127.0.0.1',
    };

    await setDoc(logDoc, {
      ...logItem,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to save audit log:', err);
  }
}

export const recordAuditLog = logAdminAction;

export async function fetchAuditLogs(maxEntries = 100): Promise<AdminAuditLog[]> {
  if (!firebaseReady) return [];

  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('createdAt', 'desc'), limit(maxEntries))
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AdminAuditLog, 'id'>),
    }));
  } catch (err) {
    console.warn('Error fetching audit logs:', err);
    return [];
  }
}

export function subscribeAuditLogs(
  callback: (logs: AdminAuditLog[]) => void,
  maxEntries = 100
): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('createdAt', 'desc'), limit(maxEntries));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AdminAuditLog, 'id'>),
        }))
      );
    },
    (err) => {
      console.warn('Audit logs listener error:', err);
      callback([]);
    }
  );
}
