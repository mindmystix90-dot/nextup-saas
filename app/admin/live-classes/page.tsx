'use client';

import { Video } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminLiveClassesPage() {
  return (
    <FirestoreAdminSection
      icon={Video}
      title="Live Classes"
      subtitle="Manage scheduled live learning sessions from Firestore."
      collectionName="live_classes"
      emptyTitle="No live classes scheduled"
      emptyDescription="Create live class records in Firestore to manage them here."
    />
  );
}
