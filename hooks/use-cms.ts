'use client';

import { useEffect, useState } from 'react';
import { fetchCmsContent, defaultCmsContent, type CmsContent } from '@/services/cms.service';

export function useCmsContent() {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCmsContent();
        if (!cancelled) setContent(data ?? defaultCmsContent());
      } catch {
        if (!cancelled) setContent(defaultCmsContent());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fallback = defaultCmsContent();
  return {
    content,
    loading,
    site: content?.site || fallback.site,
    hero: content?.hero || fallback.hero,
    about: content?.about || fallback.about,
    features: content?.features || fallback.features,
    stats: content?.stats || fallback.stats,
    pricing: content?.pricing || fallback.pricing,
    faq: content?.faq || fallback.faq,
    footer: content?.footer || fallback.footer,
    contact: content?.contact || fallback.contact,
    social: content?.social || fallback.social,
    legal: content?.legal || fallback.legal,
    company: content?.company || fallback.company,
  };
}
