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
    hero: content?.hero || fallback.hero,
    stats: content?.stats || fallback.stats,
    footer: content?.footer || fallback.footer,
    contact: content?.contact || fallback.contact,
    company: content?.company || fallback.company,
  };
}
