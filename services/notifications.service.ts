import {
  collection, deleteDoc, doc, getDocs, setDoc, updateDoc, serverTimestamp,
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
