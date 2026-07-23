import type { SessionUser, CourseAccessLevel, Membership } from '@/types';

const MEMBERSHIP_RANK: Record<Membership, number> = {
  starter: 1,
  pro: 2,
  lifetime: 3,
};

const ACCESS_RANK: Record<CourseAccessLevel, number> = {
  public: 0,
  starter: 1,
  pro: 2,
  lifetime: 3,
};

export function canUserAccessCourseLevel(
  userMembership: Membership | undefined,
  requiredLevel: CourseAccessLevel,
  purchasedCourseIds: string[] = []
): boolean {
  if (requiredLevel === 'public') return true;
  const currentMembership = userMembership || 'starter';
  return MEMBERSHIP_RANK[currentMembership] >= ACCESS_RANK[requiredLevel];
}

export type FeatureName =
  | 'courses'
  | 'lessons'
  | 'downloads'
  | 'certificates'
  | 'community'
  | 'live_classes'
  | 'ai_tools'
  | 'premium_features';

export function canUserAccessFeature(
  user: SessionUser | null | undefined,
  feature: FeatureName
): boolean {
  if (!user) return false;
  
  // Superadmin and Admin have access to all features
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  const membership = user.membership || 'starter';

  switch (feature) {
    case 'courses':
    case 'lessons':
    case 'community':
      return true; // Accessible to all registered accounts

    case 'downloads':
      return membership === 'pro' || membership === 'lifetime';

    case 'certificates':
      return membership === 'pro' || membership === 'lifetime';

    case 'live_classes':
      return membership === 'pro' || membership === 'lifetime';

    case 'ai_tools':
      return membership === 'pro' || membership === 'lifetime';

    case 'premium_features':
      return membership === 'lifetime';

    default:
      return true;
  }
}
