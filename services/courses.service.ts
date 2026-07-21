import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

import type { CourseAccessLevel, PurchaseType, Membership } from '@/types';

const COURSES_COLLECTION = 'courses';
const ACCESS_COLLECTION = 'course_access';

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
  banner?: string;
  videoUrl?: string;
  resourceUrl?: string;
  accessLevel: CourseAccessLevel;
  purchaseType: PurchaseType;
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

const MEMBERSHIP_RANK: Record<Membership, number> = { starter: 1, pro: 2, lifetime: 3 };
const ACCESS_RANK: Record<CourseAccessLevel, number> = { public: 0, starter: 1, pro: 2, lifetime: 3 };

export function canAccessCourse(membership: Membership, course: Course, purchasedCourseIds: string[] = []): boolean {
  if (purchasedCourseIds.includes(course.id)) return true;
  return MEMBERSHIP_RANK[membership] >= ACCESS_RANK[course.accessLevel];
}

export async function syncUserAccessibleCourses(
  uid: string,
  membership: Membership,
  purchasedCourseIds: string[] = []
): Promise<string[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const allCourses = await fetchCourses();
  const accessible = allCourses
    .filter((c) => canAccessCourse(membership, c, purchasedCourseIds))
    .map((c) => c.id);
  await setDoc(
    doc(db, 'users', uid),
    { accessibleCourses: accessible, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return accessible;
}

export async function fetchUserPurchasedCourses(uid: string): Promise<string[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return [];
  const data = snap.data() as { purchasedCourses?: string[] };
  return data.purchasedCourses || [];
}

export async function adminAssignPurchasedCourse(uid: string, courseId: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await setDoc(
    doc(db, 'users', uid),
    { purchasedCourses: arrayUnion(courseId), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function adminRemovePurchasedCourse(uid: string, courseId: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await setDoc(
    doc(db, 'users', uid),
    { purchasedCourses: arrayRemove(courseId), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function fetchUserCourseAccess(uid: string): Promise<string[]> {
  if (!firebaseReady) return [];
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, ACCESS_COLLECTION, uid));
  if (!snap.exists()) return [];
  const data = snap.data() as { courseIds?: string[] };
  return data.courseIds || [];
}

export async function assignCourseToUser(uid: string, courseId: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await setDoc(
    doc(db, ACCESS_COLLECTION, uid),
    { courseIds: arrayUnion(courseId), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function removeCourseFromUser(uid: string, courseId: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await setDoc(
    doc(db, ACCESS_COLLECTION, uid),
    { courseIds: arrayRemove(courseId), updatedAt: serverTimestamp() },
    { merge: true }
  );
}
