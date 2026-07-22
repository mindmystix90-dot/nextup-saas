import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { FeatureFlag } from '@/types';

interface FeatureFlagsContextType {
  flags: Record<string, boolean>;
  loading: boolean;
  isEnabled: (id: string) => boolean;
  refresh: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase.from('feature_flags').select('*').order('sort_order');
    const map: Record<string, boolean> = {};
    (data as FeatureFlag[] | null)?.forEach((f) => { map[f.id] = f.enabled; });
    setFlags(map);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const isEnabled = (id: string) => flags[id] ?? true;

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, isEnabled, refresh }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return ctx;
}
