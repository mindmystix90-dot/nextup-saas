import {
  collection, doc, getDocs, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { RolePermission } from '@/types';

const ROLES_COLLECTION = 'roles';

const DEFAULT_ROLES: RolePermission[] = [
  {
    id: 'ROLE-01',
    role: 'superadmin',
    displayName: 'Super Admin',
    description: 'Full system control, billing, database management, and permission matrix administration.',
    permissions: [
      'users.read', 'users.write', 'users.delete',
      'courses.read', 'courses.write', 'courses.delete',
      'pricing.read', 'pricing.write',
      'affiliate.read', 'affiliate.write',
      'cms.read', 'cms.write',
      'financials.read', 'financials.write',
      'settings.read', 'settings.write',
    ],
    userCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROLE-02',
    role: 'admin',
    displayName: 'Admin',
    description: 'Manages user accounts, community moderation, content publishing, and support tickets.',
    permissions: [
      'users.read', 'users.write',
      'courses.read', 'courses.write',
      'community.read', 'community.write',
      'support.read', 'support.write',
      'reports.read',
    ],
    userCount: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROLE-03',
    role: 'instructor',
    displayName: 'Instructor',
    description: 'Creates and manages assigned courses, live sessions, quizzes, and student discussions.',
    permissions: [
      'courses.read', 'courses.write',
      'live_classes.read', 'live_classes.write',
      'community.read', 'community.write',
    ],
    userCount: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROLE-04',
    role: 'affiliate',
    displayName: 'Affiliate Partner',
    description: 'Accesses referral link generator, conversion tracking dashboard, and commission balance.',
    permissions: [
      'affiliate.read', 'wallet.read', 'wallet.withdraw',
    ],
    userCount: 1284,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROLE-05',
    role: 'student',
    displayName: 'Student',
    description: 'Accesses enrolled courses, community forums, live sessions, and verifiable certificates.',
    permissions: [
      'courses.read', 'community.read', 'community.post', 'certificates.read',
    ],
    userCount: 24100,
    updatedAt: new Date().toISOString(),
  },
];

export async function fetchRolePermissions(): Promise<RolePermission[]> {
  if (!firebaseReady) return DEFAULT_ROLES;
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, ROLES_COLLECTION));
    if (snap.empty) return DEFAULT_ROLES;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RolePermission, 'id'>) }));
  } catch {
    return DEFAULT_ROLES;
  }
}

export async function updateRolePermissions(id: string, permissions: string[]): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await updateDoc(doc(db, ROLES_COLLECTION, id), {
      permissions,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore role permissions update failed:', e);
  }
}
