'use client';

import { Award } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminCertificatesPage() {
  return (
    <FirestoreAdminSection
      icon={Award}
      title="Certificates"
      subtitle="Review certificate records stored in Firestore."
      collectionName="certificates"
      emptyTitle="No certificates issued"
      emptyDescription="Certificate records will appear here when learners earn them."
    />
  );
}
