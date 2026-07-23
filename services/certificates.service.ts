import {
  collection, doc, getDocs, getDoc, query, where, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { Certificate } from '@/types';

const CERTIFICATES_COLLECTION = 'certificates';

export async function fetchCertificates(): Promise<Certificate[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, CERTIFICATES_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Certificate, 'id'>) }));
  } catch {
    return [];
  }
}

export async function fetchUserCertificates(uid: string): Promise<Certificate[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, CERTIFICATES_COLLECTION), where('recipientUid', '==', uid))
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Certificate, 'id'>) }));
  } catch {
    return [];
  }
}

export async function fetchCertificateById(id: string): Promise<Certificate | null> {
  if (!firebaseReady) return null;
  try {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, CERTIFICATES_COLLECTION, id));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Certificate, 'id'>) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function createCertificate(input: Omit<Certificate, 'id'>): Promise<Certificate> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const id = `NX-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const ref = doc(db, CERTIFICATES_COLLECTION, id);
  const data = { ...input, createdAt: serverTimestamp() };
  await setDoc(ref, data);
  return { id, ...input };
}

export async function updateCertificateStatus(id: string, status: 'Verified' | 'Pending' | 'Revoked'): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await updateDoc(doc(db, CERTIFICATES_COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
