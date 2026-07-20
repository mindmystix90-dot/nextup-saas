import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

const CMS_COLLECTION = 'cms';
const CMS_DOC_ID = 'website';

export interface CmsContent {
  site: {
    name: string;
    logo: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: {
    title: string;
    subtitle: string;
    body: string;
  };
  features: { icon: string; title: string; text: string }[];
  stats: { label: string; value: string; suffix: string; icon: string }[];
  pricing: {
    title: string;
    subtitle: string;
    plans: { name: string; price: string; period: string; description: string; features: string[]; cta: string; featured: boolean; badge: string }[];
  };
  faq: { q: string; a: string }[];
  footer: { description: string; email: string; phone: string; address: string };
  contact: { email: string; phone: string; whatsapp: string; address: string; hours: string; supportEmail: string };
  social: { facebook: string; instagram: string; linkedin: string; youtube: string; twitter: string };
  legal: { privacyPolicy: string; terms: string };
  company: { name: string; tagline: string; founded: string; legalName: string; gstin: string };
  updatedAt?: string;
}

export type CmsSection = keyof Omit<CmsContent, 'updatedAt'>;

export function defaultCmsContent(): CmsContent {
  return {
    site: { name: 'NextUp', logo: '' },
    hero: {
      eyebrow: 'Premium career growth platform',
      titleLine1: 'Learn Skills.',
      titleLine2: 'Build Your Future.',
      titleLine3: 'Unlock Opportunities.',
      subtitle: 'Master practical skills, earn certificates, join a supportive learning community, and unlock career opportunities.',
      primaryCta: 'Start Learning',
      secondaryCta: 'Explore Courses',
    },
    about: {
      title: 'About NextUp',
      subtitle: 'We are on a mission to make practical career skills accessible to everyone.',
      body: 'NextUp was founded with a simple belief: learning should be practical, affordable, and directly tied to real career outcomes. Every course is designed by industry experts who have been there and done that.',
    },
    features: [
      { icon: 'ShieldCheck', title: 'Verifiable certificates', text: 'Every certificate has a unique ID anyone can verify instantly.' },
      { icon: 'Video', title: 'Weekly live classes', text: 'Interactive sessions with industry experts, not pre-recorded lectures.' },
      { icon: 'Users', title: 'Active community', text: 'Learn alongside thousands of peers and mentors who have your back.' },
      { icon: 'TrendingUp', title: 'Career outcomes', text: 'Skills that directly translate to better jobs, freelance clients, and growth.' },
    ],
    stats: [
      { label: 'Students', value: '25000', suffix: '+', icon: 'Users' },
      { label: 'Lessons', value: '150', suffix: '+', icon: 'BookOpen' },
      { label: 'Courses', value: '20', suffix: '+', icon: 'GraduationCap' },
      { label: 'Completion Rate', value: '95', suffix: '%', icon: 'TrendingUp' },
    ],
    pricing: {
      title: 'Simple, transparent pricing',
      subtitle: 'Choose the plan that fits your journey. Cancel anytime.',
      plans: [
        { name: 'Starter', price: '₹499', period: '/month', description: 'Perfect to explore the platform and try a few lessons.', features: ['Access to 5 starter lessons', 'Community read access', 'Basic progress tracking', 'Email support'], cta: 'Start Free', featured: false, badge: '' },
        { name: 'Pro', price: '₹999', period: '/month', description: 'Everything you need to learn seriously and grow.', features: ['All 20+ courses', 'Verifiable certificates', 'Weekly live classes', 'Full community access', 'Priority support', 'Progress analytics'], cta: 'Go Pro', featured: true, badge: 'Most Popular' },
        { name: 'Lifetime', price: '₹4,999', period: 'one-time', description: 'Pay once. Learn forever. No recurring fees.', features: ['Everything in Pro', 'Lifetime access', 'All future courses', 'Exclusive alumni network', 'Early feature access', '1:1 onboarding call'], cta: 'Get Lifetime', featured: false, badge: '' },
      ],
    },
    faq: [
      { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your Pro subscription at any time from your dashboard. You keep access until the end of your billing period.' },
      { q: 'Are certificates really verifiable?', a: 'Absolutely. Every certificate has a unique verification ID that anyone can check to confirm its authenticity.' },
      { q: 'Is there a money-back guarantee?', a: 'Yes, all paid plans include a 7-day no-questions-asked money-back guarantee.' },
      { q: 'Do you offer team or enterprise plans?', a: 'We do. Contact us and we will tailor a plan for your team or organization.' },
    ],
    footer: {
      description: 'Learn valuable skills, earn certificates, join a community, and build a successful career — all in one premium platform.',
      email: 'hello@nextup.in',
      phone: '+91 98765 43210',
      address: 'Connaught Place, New Delhi, India',
    },
    contact: {
      email: 'hello@nextup.in',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      address: 'Connaught Place, New Delhi, India',
      hours: 'Mon–Fri, 9am–6pm IST',
      supportEmail: 'support@nextup.in',
    },
    social: { facebook: '#', instagram: '#', linkedin: '#', youtube: '#', twitter: '#' },
    legal: {
      privacyPolicy: 'We respect your privacy. We do not sell your personal data. We only collect information necessary to provide our services and improve your learning experience.',
      terms: 'By using NextUp, you agree to our terms of service. All courses are licensed for individual use. Certificates are non-transferable. Refunds are available within 7 days of purchase.',
    },
    company: {
      name: 'NextUp',
      tagline: 'Learn Skills. Build Your Future. Unlock Opportunities.',
      founded: '2024',
      legalName: 'NextUp Learning Pvt. Ltd.',
      gstin: '07ABCDE1234F1Z5',
    },
  };
}

export async function fetchCmsContent(): Promise<CmsContent | null> {
  if (!firebaseReady) return null;
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, CMS_COLLECTION, CMS_DOC_ID));
  if (!snap.exists()) return null;
  const data = snap.data();
  const defaults = defaultCmsContent();
  // Merge with defaults so new fields are always present
  return {
    ...defaults,
    ...data,
    site: { ...defaults.site, ...(data.site || {}) },
    hero: { ...defaults.hero, ...(data.hero || {}) },
    about: { ...defaults.about, ...(data.about || {}) },
    features: data.features || defaults.features,
    stats: data.stats || defaults.stats,
    pricing: { ...defaults.pricing, ...(data.pricing || {}), plans: data.pricing?.plans || defaults.pricing.plans },
    faq: data.faq || defaults.faq,
    footer: { ...defaults.footer, ...(data.footer || {}) },
    contact: { ...defaults.contact, ...(data.contact || {}) },
    social: { ...defaults.social, ...(data.social || {}) },
    legal: { ...defaults.legal, ...(data.legal || {}) },
    company: { ...defaults.company, ...(data.company || {}) },
  } as CmsContent;
}

export async function updateCmsSection(section: CmsSection, value: unknown): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await setDoc(doc(db, CMS_COLLECTION, CMS_DOC_ID), { [section]: value, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateCmsAll(content: Partial<CmsContent>): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const db = getFirestoreDb();
  await setDoc(doc(db, CMS_COLLECTION, CMS_DOC_ID), { ...content, updatedAt: serverTimestamp() }, { merge: true });
}
