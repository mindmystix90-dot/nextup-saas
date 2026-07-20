import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { adminWebsiteContent } from '@/lib/data/admin';

const CMS_COLLECTION = 'cms';
const CMS_DOC_ID = 'website';

export interface CmsContent {
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { label: string; value: string; suffix: string; icon: string }[];
  footer: { description: string; email: string; phone: string; address: string };
  contact: { email: string; phone: string; address: string; hours: string };
  company: { name: string; tagline: string; founded: string; legalName: string; gstin: string };
  updatedAt?: string;
}

export type CmsSection = 'hero' | 'stats' | 'footer' | 'contact' | 'company';

export function defaultCmsContent(): CmsContent {
  return {
    hero: adminWebsiteContent.hero,
    stats: adminWebsiteContent.stats,
    footer: adminWebsiteContent.footer,
    contact: adminWebsiteContent.contact,
    company: adminWebsiteContent.company,
  };
}

export async function fetchCmsContent(): Promise<CmsContent | null> {
  if (!firebaseReady) return null;
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, CMS_COLLECTION, CMS_DOC_ID));
  if (!snap.exists()) return null;
  return snap.data() as CmsContent;
}

export async function updateCmsSection(section: CmsSection, value: unknown): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const ref = doc(db, CMS_COLLECTION, CMS_DOC_ID);
  const existing = await getDoc(ref);
  const current = existing.exists() ? existing.data() : defaultCmsContent();
  await setDoc(ref, { ...current, [section]: value, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateCmsAll(content: Partial<CmsContent>): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  const ref = doc(db, CMS_COLLECTION, CMS_DOC_ID);
  const existing = await getDoc(ref);
  const current = existing.exists() ? existing.data() : defaultCmsContent();
  await setDoc(ref, { ...current, ...content, updatedAt: serverTimestamp() }, { merge: true });
}
