'use client';

import { LifeBuoy } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminSupportPage() {
  return (
    <FirestoreAdminSection
      icon={LifeBuoy}
      title="Support"
      subtitle="Track real customer support requests from Firestore."
      collectionName="support_tickets"
      emptyTitle="No support tickets"
      emptyDescription="Customer support tickets will appear here when users submit them."
    />
  );
}
