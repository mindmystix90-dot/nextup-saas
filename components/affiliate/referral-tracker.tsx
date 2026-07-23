'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { recordAffiliateClick } from '@/services/affiliate.service';

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      const normalizedRef = ref.trim().toUpperCase();
      try {
        const stored = localStorage.getItem('nextup_ref_code');
        if (stored !== normalizedRef) {
          localStorage.setItem('nextup_ref_code', normalizedRef);
          document.cookie = `nextup_ref_code=${normalizedRef}; path=/; max-age=7776000`; // 90 days
          recordAffiliateClick(normalizedRef);
        }
      } catch (e) {
        console.warn('Failed to store referral code:', e);
      }
    }
  }, [searchParams]);

  return null;
}
