import {
  collection, deleteDoc, doc, getDocs, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { LiveClassSession } from '@/types';

const LIVE_CLASSES_COLLECTION = 'live_classes';

export async function fetchLiveClasses(): Promise<LiveClassSession[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, LIVE_CLASSES_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LiveClassSession, 'id'>) }));
  } catch {
    return [];
  }
}

export async function createLiveClass(input: Omit<LiveClassSession, 'id' | 'createdAt' | 'enrolledCount'>): Promise<LiveClassSession> {
  const newClass: LiveClassSession = {
    id: `LC-${Date.now().toString().slice(-4)}`,
    ...input,
    enrolledCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      const ref = doc(collection(db, LIVE_CLASSES_COLLECTION));
      await setDoc(ref, {
        ...newClass,
        createdAt: serverTimestamp(),
      });
      newClass.id = ref.id;
    } catch (e) {
      console.warn('Firestore fallback for live class creation:', e);
    }
  }

  return newClass;
}

export async function updateLiveClass(id: string, updates: Partial<LiveClassSession>): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await updateDoc(doc(db, LIVE_CLASSES_COLLECTION, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore update failed for live class:', e);
  }
}

export async function deleteLiveClass(id: string): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, LIVE_CLASSES_COLLECTION, id));
  } catch (e) {
    console.warn('Firestore delete failed for live class:', e);
  }
}
