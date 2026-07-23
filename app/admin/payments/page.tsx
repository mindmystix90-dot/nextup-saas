'use client';

import { Wallet } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminPaymentsPage() {
  return (
    <FirestoreAdminSection
      icon={Wallet}
      title="Payments"
      subtitle="Monitor payment records stored in Firestore."
      collectionName="payments"
      emptyTitle="No payments found"
      emptyDescription="Real payment records will appear here after checkout events are saved."
    />
  );
}
