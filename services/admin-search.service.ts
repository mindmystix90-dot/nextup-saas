import { collection, getDocs, limit, query } from 'firebase/firestore';
import { firebaseReady, getFirestoreDb } from '@/lib/firebase';

export type AdminSearchType = 'User' | 'Payment' | 'Order' | 'Affiliate' | 'Sales Partner' | 'Enrollment' | 'Support Ticket' | 'Certificate' | 'Coupon';

export interface AdminSearchResult {
  id: string;
  type: AdminSearchType;
  title: string;
  subtitle: string;
  href: string;
  matchedFields: string[];
}

interface SearchCollectionConfig {
  collectionName: string;
  type: AdminSearchType;
  hrefBase: string;
  titleFields: string[];
  subtitleFields: string[];
  searchableFields: string[];
}

const SEARCH_COLLECTIONS: SearchCollectionConfig[] = [
  {
    collectionName: 'users',
    type: 'User',
    hrefBase: '/admin/users',
    titleFields: ['userId', 'name', 'email', 'uid'],
    subtitleFields: ['email', 'phone', 'referralCode', 'paymentId'],
    searchableFields: ['userId', 'uid', 'email', 'phone', 'name', 'referralCode', 'paymentId'],
  },
  {
    collectionName: 'payments',
    type: 'Payment',
    hrefBase: '/admin/payments',
    titleFields: ['paymentId', 'id', 'user', 'email'],
    subtitleFields: ['userId', 'uid', 'email', 'phone', 'status'],
    searchableFields: ['paymentId', 'id', 'userId', 'uid', 'email', 'phone', 'name', 'user', 'referralCode'],
  },
  {
    collectionName: 'orders',
    type: 'Order',
    hrefBase: '/admin/payments',
    titleFields: ['orderId', 'id', 'userName', 'email'],
    subtitleFields: ['paymentId', 'userId', 'uid', 'email', 'status'],
    searchableFields: ['orderId', 'paymentId', 'userId', 'uid', 'email', 'phone', 'name', 'userName', 'referralCode'],
  },
  {
    collectionName: 'affiliates',
    type: 'Affiliate',
    hrefBase: '/admin/affiliate',
    titleFields: ['affiliateId', 'referralCode', 'name', 'email'],
    subtitleFields: ['userId', 'uid', 'email', 'phone', 'status'],
    searchableFields: ['affiliateId', 'userId', 'uid', 'email', 'phone', 'name', 'referralCode', 'paymentId'],
  },
  {
    collectionName: 'sales_partners',
    type: 'Sales Partner',
    hrefBase: '/admin/sales-partners',
    titleFields: ['salesPartnerId', 'partnerId', 'name', 'email'],
    subtitleFields: ['userId', 'uid', 'email', 'phone', 'referralCode'],
    searchableFields: ['salesPartnerId', 'partnerId', 'userId', 'uid', 'email', 'phone', 'name', 'referralCode', 'paymentId'],
  },
  {
    collectionName: 'enrollments',
    type: 'Enrollment',
    hrefBase: '/admin/courses',
    titleFields: ['enrollmentId', 'courseTitle', 'courseId', 'userId'],
    subtitleFields: ['userId', 'uid', 'email', 'phone', 'status'],
    searchableFields: ['enrollmentId', 'courseId', 'courseTitle', 'userId', 'uid', 'email', 'phone', 'name', 'paymentId'],
  },
  {
    collectionName: 'support_tickets',
    type: 'Support Ticket',
    hrefBase: '/admin/support',
    titleFields: ['supportId', 'ticketId', 'subject', 'email'],
    subtitleFields: ['userId', 'uid', 'email', 'phone', 'status'],
    searchableFields: ['supportId', 'ticketId', 'userId', 'uid', 'email', 'phone', 'name', 'subject'],
  },
  {
    collectionName: 'certificates',
    type: 'Certificate',
    hrefBase: '/admin/certificates',
    titleFields: ['certificateId', 'certId', 'recipientName', 'courseName'],
    subtitleFields: ['userId', 'uid', 'email', 'courseId', 'status'],
    searchableFields: ['certificateId', 'certId', 'userId', 'uid', 'email', 'phone', 'name', 'recipientName', 'courseName'],
  },
  {
    collectionName: 'coupons',
    type: 'Coupon',
    hrefBase: '/admin/coupons',
    titleFields: ['couponId', 'code', 'name'],
    subtitleFields: ['packageId', 'status', 'expiresAt'],
    searchableFields: ['couponId', 'code', 'name', 'packageId'],
  },
];

function normalize(value: unknown): string {
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'number') return String(value).toLowerCase();
  return '';
}

function firstText(data: Record<string, unknown>, fields: string[], fallback: string): string {
  for (const field of fields) {
    const value = data[field];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return fallback;
}

export async function universalAdminSearch(term: string, maxPerCollection = 40): Promise<AdminSearchResult[]> {
  const needle = term.trim().toLowerCase();
  if (!firebaseReady || needle.length < 2) return [];

  const db = getFirestoreDb();
  const results: AdminSearchResult[] = [];

  await Promise.all(SEARCH_COLLECTIONS.map(async (config) => {
    const snap = await getDocs(query(collection(db, config.collectionName), limit(maxPerCollection)));

    snap.docs.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() } as Record<string, unknown>;
      const matchedFields = config.searchableFields.filter((field) => normalize(data[field]).includes(needle));
      if (matchedFields.length === 0 && !docSnap.id.toLowerCase().includes(needle)) return;

      results.push({
        id: docSnap.id,
        type: config.type,
        title: firstText(data, config.titleFields, docSnap.id),
        subtitle: firstText(data, config.subtitleFields, config.collectionName),
        href: config.hrefBase,
        matchedFields: matchedFields.length > 0 ? matchedFields : ['documentId'],
      });
    });
  }));

  return results.sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
}
