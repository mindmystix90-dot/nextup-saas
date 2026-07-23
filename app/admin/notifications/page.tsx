'use client';

import { Bell } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminNotificationsPage() {
  return (
    <FirestoreAdminSection
      icon={Bell}
      title="Notifications"
      subtitle="Review notification records delivered through the platform."
      collectionName="notifications"
      emptyTitle="No notifications found"
      emptyDescription="Notification records will appear here after they are written to Firestore."
    />
  );
}
