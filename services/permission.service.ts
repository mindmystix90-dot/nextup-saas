import { doc, getDoc } from 'firebase/firestore';
import { firebaseReady, getFirestoreDb } from '@/lib/firebase';
import type { FirestoreProfile, PricingPlan } from '@/types';

export type FeatureKey =
  | 'communityAccess'
  | 'liveClasses'
  | 'certificates'
  | 'downloads'
  | 'affiliateEnabled'
  | 'salesPartnerEnabled'
  | 'aiTools';

export interface PermissionDecision {
  allowed: boolean;
  reason?: string;
  packageId?: string;
  packageName?: string;
}

const PACKAGE_COLLECTION = 'pricing_plans';

function packageAllows(plan: PricingPlan | null, feature: FeatureKey): PermissionDecision {
  if (!plan) return { allowed: false, reason: 'No package is assigned.' };
  if (!plan.active || plan.visible === false) {
    return { allowed: false, packageId: plan.id, packageName: plan.name, reason: 'Package is inactive or hidden.' };
  }
  if (!plan[feature]) {
    return { allowed: false, packageId: plan.id, packageName: plan.name, reason: 'Feature is not included in this package.' };
  }
  return { allowed: true, packageId: plan.id, packageName: plan.name };
}

export async function fetchUserPackage(profile: FirestoreProfile): Promise<PricingPlan | null> {
  if (!firebaseReady || !profile.membership) return null;

  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, PACKAGE_COLLECTION, profile.membership));
  if (!snap.exists()) return null;

  return { id: snap.id, ...(snap.data() as Omit<PricingPlan, 'id'>) };
}

export async function validatePackagePermission(profile: FirestoreProfile | null, feature: FeatureKey): Promise<PermissionDecision> {
  if (!profile) return { allowed: false, reason: 'User is not authenticated.' };
  if (profile.suspended) return { allowed: false, reason: 'User account is suspended.' };
  if (profile.membershipStatus && profile.membershipStatus !== 'active') {
    return { allowed: false, reason: 'User package is not active.' };
  }

  const plan = await fetchUserPackage(profile);
  return packageAllows(plan, feature);
}

export function validatePackagePermissionFromPlan(profile: FirestoreProfile | null, plan: PricingPlan | null, feature: FeatureKey): PermissionDecision {
  if (!profile) return { allowed: false, reason: 'User is not authenticated.' };
  if (profile.suspended) return { allowed: false, reason: 'User account is suspended.' };
  if (profile.membershipStatus && profile.membershipStatus !== 'active') {
    return { allowed: false, reason: 'User package is not active.' };
  }
  return packageAllows(plan, feature);
}
