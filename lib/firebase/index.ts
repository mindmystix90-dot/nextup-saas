import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from './config';

export const firebaseReady = isFirebaseConfigured;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseApp = app;

let _auth: Auth | null = null;
let _firestore: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

export function getFirestoreDb(): Firestore {
  if (!_firestore) _firestore = getFirestore(app);
  return _firestore;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(app);
  return _storage;
}

export const googleProvider = new GoogleAuthProvider();

if (typeof window !== 'undefined' && firebaseReady) {
  try {
    setPersistence(getFirebaseAuth(), browserLocalPersistence).catch(() => {
      // Persistence setup is best-effort; auth still works without it.
    });
  } catch {
    // Ignore persistence errors when config is missing.
  }
}
