'use client';

import { Users } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminCommunityPage() {
  return (
    <FirestoreAdminSection
      icon={Users}
      title="Community"
      subtitle="Moderate real community posts stored in Firestore."
      collectionName="community_posts"
      emptyTitle="No community posts"
      emptyDescription="Community activity will appear here after members create posts."
    />
  );
}
