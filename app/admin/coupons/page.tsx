'use client';

import { BadgePercent } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminCouponsPage() {
  return (
    <FirestoreAdminSection
      icon={BadgePercent}
      title="Coupons"
      subtitle="Manage coupon records from Firestore."
      collectionName="coupons"
      emptyTitle="No coupons created"
      emptyDescription="Create coupon records in Firestore to make them available here."
    />
  );
}
