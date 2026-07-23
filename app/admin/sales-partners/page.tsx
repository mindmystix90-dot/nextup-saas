'use client';

import { Handshake } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminSalesPartnersPage() {
  return (
    <FirestoreAdminSection
      icon={Handshake}
      title="Sales Partners"
      subtitle="View sales partner records from Firestore. Partner logic is intentionally not implemented in this phase."
      collectionName="sales_partners"
      emptyTitle="No sales partners yet"
      emptyDescription="Sales partner records will appear here once they exist in Firestore."
    />
  );
}
