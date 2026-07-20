import { supabase } from '@/lib/supabase/client';

export interface CmsContent {
  id: number;
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
  updated_at: string;
}

export type CmsSection = 'hero' | 'stats' | 'footer' | 'contact' | 'company';

export async function fetchCmsContent(): Promise<CmsContent | null> {
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data as CmsContent | null;
}

export async function updateCmsSection(section: CmsSection, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('cms_content')
    .update({ [section]: value, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}

export async function updateCmsAll(content: Partial<Omit<CmsContent, 'id' | 'updated_at'>>): Promise<void> {
  const { error } = await supabase
    .from('cms_content')
    .update({ ...content, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}
