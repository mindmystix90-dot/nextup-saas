'use client';

import { Network } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminAffiliatePage() {
  return (
    <FirestoreAdminSection
      icon={Network}
      title="Affiliate"
      subtitle="View affiliate records from Firestore. Affiliate workflows are intentionally not implemented in this phase."
      collectionName="affiliates"
      emptyTitle="No affiliates yet"
      emptyDescription="Affiliate records will appear here once users are enabled in Firestore."
    />
  );
}
