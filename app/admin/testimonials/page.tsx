'use client';

import { MessageSquare } from 'lucide-react';
import { FirestoreAdminSection } from '@/components/admin/firestore-admin-section';

export default function AdminTestimonialsPage() {
  return (
    <FirestoreAdminSection
      icon={MessageSquare}
      title="Testimonials"
      subtitle="Review real testimonial records from Firestore."
      collectionName="testimonials"
      emptyTitle="No testimonials submitted"
      emptyDescription="Testimonials will appear here after users submit them."
    />
  );
}
