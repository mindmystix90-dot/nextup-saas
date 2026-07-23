'use client';

import { FileText } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminReportsPage() {
  return (
    <FirestoreAdminSection
      icon={FileText}
      title="Reports"
      subtitle="Review generated platform reports from Firestore."
      collectionName="reports"
      emptyTitle="No reports yet"
      emptyDescription="Reports will appear here after they are generated and saved to Firestore."
    />
  );
}
