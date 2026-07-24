import {
  collection, deleteDoc, doc, getDocs, setDoc, updateDoc, serverTimestamp, onSnapshot, query, where,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { NotificationItem } from '@/types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export async function fetchNotifications(): Promise<NotificationItem[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
  } catch {
    return [];
  }
}

export function subscribeNotifications(callback: (notifications: NotificationItem[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, NOTIFICATIONS_COLLECTION), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeNotifications error:', err);
    callback([]);
  });
}

export function subscribeUserNotifications(
  uid: string,
  callback: (notifications: NotificationItem[]) => void
): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, NOTIFICATIONS_COLLECTION), (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }))
      .filter((n) => !n.uid || n.uid === uid || n.targetRole === 'student' || n.targetRole === 'all');
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeUserNotifications error:', err);
    callback([]);
  });
}

export async function createNotification(input: Omit<NotificationItem, 'id' | 'createdAt' | 'readCount'>): Promise<NotificationItem> {
  const newItem: NotificationItem = {
    id: `NOTIF-${Date.now().toString().slice(-4)}`,
    ...input,
    readCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      const ref = doc(collection(db, NOTIFICATIONS_COLLECTION));
      await setDoc(ref, {
        ...newItem,
        createdAt: serverTimestamp(),
      });
      newItem.id = ref.id;
    } catch (e) {
      console.warn('Firestore fallback notification creation:', e);
    }
  }

  return newItem;
}

export async function deleteNotification(id: string): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, id));
  } catch (e) {
    console.warn('Firestore notification delete failed:', e);
  }
}
