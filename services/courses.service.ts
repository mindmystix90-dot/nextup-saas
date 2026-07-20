import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

const COURSES_COLLECTION = 'courses';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: string;
  icon: string;
  gradient: string;
  lessons: number;
  duration: string;
  status: 'Published' | 'Draft';
  sort_order: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CourseInput = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;

export async function fetchCourses(): Promise<Course[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDocs(query(collection(db, COURSES_COLLECTION), orderBy('sort_order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, 'id'>) }));
}

export async function fetchPublishedCourses(): Promise<Course[]> {
  const all = await fetchCourses();
  return all.filter((c) => c.status === 'Published');
}

export async function createCourse(input: CourseInput): Promise<Course> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const ref = doc(collection(db, COURSES_COLLECTION));
  const data = { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await setDoc(ref, data);
  return { id: ref.id, ...input };
}

export async function updateCourse(id: string, updates: Partial<CourseInput>): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await updateDoc(doc(db, COURSES_COLLECTION, id), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteCourse(id: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await deleteDoc(doc(db, COURSES_COLLECTION, id));
}
