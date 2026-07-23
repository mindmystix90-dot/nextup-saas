import { collection, doc, setDoc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

export interface ReminderItem {
  id: string;
  uid: string;
  title: string;
  message: string;
  dueDate: string; // ISO 8601
  type: 'crm_followup' | 'live_class' | 'course_assignment' | 'payment_pending';
  completed: boolean;
  referenceId?: string;
  createdAt: string;
}

const REMINDERS_COLLECTION = 'reminders';

export async function createReminder(
  input: Omit<ReminderItem, 'id' | 'completed' | 'createdAt'>
): Promise<ReminderItem> {
  const db = firebaseReady ? getFirestoreDb() : null;
  const docRef = db ? doc(collection(db, REMINDERS_COLLECTION)) : { id: 'rem-' + Date.now() };
  const now = new Date().toISOString();

  const reminder: ReminderItem = {
    id: docRef.id,
    ...input,
    completed: false,
    createdAt: now,
  };

  if (db) {
    await setDoc(doc(db, REMINDERS_COLLECTION, docRef.id), {
      ...reminder,
      createdAt: serverTimestamp(),
    });
  }

  return reminder;
}

export async function fetchUserReminders(uid: string): Promise<ReminderItem[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, REMINDERS_COLLECTION), where('uid', '==', uid))
    );
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReminderItem, 'id'>) }));
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  } catch {
    return [];
  }
}

export async function completeReminder(id: string): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  await updateDoc(doc(db, REMINDERS_COLLECTION, id), {
    completed: true,
    updatedAt: new Date().toISOString(),
  });
}
