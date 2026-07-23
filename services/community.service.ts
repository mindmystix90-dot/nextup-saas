import {
  collection, doc, getDocs, getDoc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { Discussion, MentorPost, StudentQuestion } from '@/types';

const DISCUSSIONS_COLLECTION = 'discussions';
const MENTOR_POSTS_COLLECTION = 'mentor_posts';
const QUESTIONS_COLLECTION = 'student_questions';

export async function fetchDiscussions(): Promise<Discussion[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, DISCUSSIONS_COLLECTION)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Discussion, 'id'>) }));
  } catch {
    return [];
  }
}

export async function createDiscussion(input: Omit<Discussion, 'id'>): Promise<Discussion> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const ref = doc(collection(db, DISCUSSIONS_COLLECTION));
  const data = { ...input, createdAt: serverTimestamp() };
  await setDoc(ref, data);
  return { ...input, id: ref.id };
}

export async function fetchMentorPosts(): Promise<MentorPost[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, MENTOR_POSTS_COLLECTION)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MentorPost, 'id'>) }));
  } catch {
    return [];
  }
}

export async function fetchStudentQuestions(): Promise<StudentQuestion[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, QUESTIONS_COLLECTION)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StudentQuestion, 'id'>) }));
  } catch {
    return [];
  }
}

export async function deleteDiscussion(id: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await deleteDoc(doc(db, DISCUSSIONS_COLLECTION, id));
}
