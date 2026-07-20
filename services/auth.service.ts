import {
  applyActionCode,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as fbUpdateProfile,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { AuthResult, FirestoreProfile, Membership, Role, SessionUser } from '@/types';
import { firebaseReady, getFirebaseAuth, getFirestoreDb, googleProvider } from '@/lib/firebase';

const USERS_COLLECTION = 'users';
const DEFAULT_MEMBERSHIP: Membership = 'starter';
const DEFAULT_ROLE: Role = 'user';

function db() {
  return getFirestoreDb();
}

function auth() {
  return getFirebaseAuth();
}

function toSession(firebaseUser: FirebaseUser, profile: FirestoreProfile | null): SessionUser {
  return {
    uid: firebaseUser.uid,
    name: profile?.name || firebaseUser.displayName || '',
    email: profile?.email || firebaseUser.email || '',
    role: profile?.role || DEFAULT_ROLE,
    membership: profile?.membership || DEFAULT_MEMBERSHIP,
    phone: profile?.phone ?? '',
    photoURL: profile?.photoURL ?? firebaseUser.photoURL ?? '',
    address: profile?.address ?? '',
  };
}

export async function fetchProfile(uid: string): Promise<FirestoreProfile | null> {
  const snap = await getDoc(doc(db(), USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as FirestoreProfile) : null;
}

async function buildSession(firebaseUser: FirebaseUser): Promise<SessionUser | null> {
  let profile = await fetchProfile(firebaseUser.uid);
  if (!profile) {
    profile = await createUserDocument(firebaseUser);
  }
  return toSession(firebaseUser, profile);
}

export async function createUserDocument(
  firebaseUser: FirebaseUser,
  overrides: Partial<Pick<FirestoreProfile, 'name' | 'phone' | 'photoURL'>> = {}
): Promise<FirestoreProfile> {
  const ref = doc(db(), USERS_COLLECTION, firebaseUser.uid);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();

  const profile: FirestoreProfile = {
    uid: firebaseUser.uid,
    name: overrides.name ?? existing.data()?.name ?? firebaseUser.displayName ?? '',
    email: firebaseUser.email ?? '',
    phone: overrides.phone ?? existing.data()?.phone ?? '',
    photoURL: overrides.photoURL ?? existing.data()?.photoURL ?? firebaseUser.photoURL ?? '',
    role: existing.data()?.role ?? DEFAULT_ROLE,
    membership: existing.data()?.membership ?? DEFAULT_MEMBERSHIP,
    address: existing.data()?.address ?? '',
    createdAt: existing.data()?.createdAt ?? now,
    updatedAt: now,
  };

  await setDoc(ref, profile, { merge: true });
  return profile;
}

function friendlyAuthError(code: string | undefined): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by the browser.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled for the project.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/requires-recent-login':
      return 'Please sign out and sign in again before changing your password.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export const authService = {
  isConfigured(): boolean {
    return firebaseReady;
  },

  onAuthChange(callback: (user: SessionUser | null) => void): () => void {
    if (!firebaseReady) {
      callback(null);
      return () => {};
    }
    try {
      return onAuthStateChanged(auth(), async (firebaseUser) => {
        if (!firebaseUser) {
          callback(null);
          return;
        }
        try {
          const session = await buildSession(firebaseUser);
          callback(session);
        } catch {
          callback(null);
        }
      });
    } catch {
      callback(null);
      return () => {};
    }
  },

  subscribeProfile(uid: string, callback: (profile: FirestoreProfile | null) => void): () => void {
    if (!firebaseReady) {
      callback(null);
      return () => {};
    }
    return onSnapshot(doc(db(), USERS_COLLECTION, uid), (snap) => {
      callback(snap.exists() ? (snap.data() as FirestoreProfile) : null);
    });
  },

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    if (!firebaseReady) return { ok: false, error: 'Firebase is not configured.' };
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) return { ok: false, error: 'Please enter your full name.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return { ok: false, error: 'Please enter a valid email address.' };
    if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

    try {
      const cred = await createUserWithEmailAndPassword(auth(), trimmedEmail, password);
      await fbUpdateProfile(cred.user, { displayName: trimmedName });
      const profile = await createUserDocument(cred.user, { name: trimmedName });
      return { ok: true, user: toSession(cred.user, profile) };
    } catch (err) {
      return { ok: false, error: friendlyAuthError((err as { code?: string }).code) };
    }
  },

  async login(email: string, password: string): Promise<AuthResult> {
    if (!firebaseReady) return { ok: false, error: 'Firebase is not configured.' };
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) return { ok: false, error: 'Please enter your email and password.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return { ok: false, error: 'Please enter a valid email address.' };

    try {
      const cred = await signInWithEmailAndPassword(auth(), trimmedEmail, password);
      const session = await buildSession(cred.user);
      if (!session) return { ok: false, error: 'Could not load your account. Please try again.' };
      return { ok: true, user: session };
    } catch (err) {
      return { ok: false, error: friendlyAuthError((err as { code?: string }).code) };
    }
  },

  async loginWithGoogle(): Promise<AuthResult> {
    if (!firebaseReady) return { ok: false, error: 'Firebase is not configured.' };
    try {
      const cred = await signInWithPopup(auth(), googleProvider);
      const profile = await createUserDocument(cred.user, {
        name: cred.user.displayName ?? '',
        photoURL: cred.user.photoURL ?? '',
      });
      return { ok: true, user: toSession(cred.user, profile) };
    } catch (err) {
      return { ok: false, error: friendlyAuthError((err as { code?: string }).code) };
    }
  },

  async logout(): Promise<void> {
    if (!firebaseReady) return;
    await signOut(auth());
  },

  async sendPasswordReset(email: string): Promise<AuthResult> {
    if (!firebaseReady) return { ok: false, error: 'Firebase is not configured.' };
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return { ok: false, error: 'Please enter your email address.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return { ok: false, error: 'Please enter a valid email address.' };

    try {
      await sendPasswordResetEmail(auth(), trimmedEmail);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendlyAuthError((err as { code?: string }).code) };
    }
  },

  async applyActionCode(code: string): Promise<AuthResult> {
    if (!firebaseReady) return { ok: false, error: 'Firebase is not configured.' };
    try {
      await applyActionCode(auth(), code);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendlyAuthError((err as { code?: string }).code) };
    }
  },

  async getProfile(): Promise<FirestoreProfile | null> {
    const current = auth().currentUser;
    if (!current) return null;
    return fetchProfile(current.uid);
  },

  async updateProfile(updates: Partial<Pick<FirestoreProfile, 'name' | 'phone' | 'photoURL' | 'address'>>): Promise<AuthResult> {
    if (!firebaseReady) return { ok: false, error: 'Firebase is not configured.' };
    const current = auth().currentUser;
    if (!current) return { ok: false, error: 'You must be signed in.' };

    try {
      const ref = doc(db(), USERS_COLLECTION, current.uid);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
      if (updates.name) await fbUpdateProfile(current, { displayName: updates.name });
      if (updates.photoURL) await fbUpdateProfile(current, { photoURL: updates.photoURL });

      const profile = await fetchProfile(current.uid);
      return { ok: true, user: toSession(current, profile) };
    } catch (err) {
      return { ok: false, error: friendlyAuthError((err as { code?: string }).code) };
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    if (!firebaseReady) return { ok: false, error: 'Firebase is not configured.' };
    if (newPassword.length < 8) return { ok: false, error: 'New password must be at least 8 characters.' };
    const current = auth().currentUser;
    if (!current?.email) return { ok: false, error: 'You must be signed in.' };

    try {
      await signInWithEmailAndPassword(auth(), current.email, currentPassword);
      const refreshed = auth().currentUser;
      if (!refreshed) return { ok: false, error: 'You must be signed in.' };
      await updatePassword(refreshed, newPassword);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendlyAuthError((err as { code?: string }).code) };
    }
  },
};
