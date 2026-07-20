'use client';

import { useEffect, useState } from 'react';
import { fetchCmsContent, type CmsContent } from '@/lib/supabase/cms';
import { adminWebsiteContent } from '@/lib/data/admin';

export function useCmsContent() {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCmsContent();
        if (!cancelled) setContent(data);
      } catch {
        // Use null — callers fall back to static data
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return {
    content,
    loading,
    hero: content?.hero || adminWebsiteContent.hero,
    stats: content?.stats || adminWebsiteContent.stats,
    footer: content?.footer || adminWebsiteContent.footer,
    contact: content?.contact || adminWebsiteContent.contact,
    company: content?.company || adminWebsiteContent.company,
  };
}
