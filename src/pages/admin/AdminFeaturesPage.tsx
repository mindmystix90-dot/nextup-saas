import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ToggleLeft } from 'lucide-react';
import { Card, Badge, Spinner, EmptyState } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { fetchAllFeatureFlags, updateFeatureFlag } from '@/services/general.service';
import type { FeatureFlag } from '@/types';

export default function AdminFeaturesPage() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    try { setFlags(await fetchAllFeatureFlags()); }
    catch { toast.error('Failed to load feature flags'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (f: FeatureFlag) => {
    setUpdating(f.id);
    const { error } = await updateFeatureFlag(f.id, !f.enabled);
    setUpdating(null);
    if (error) { toast.error(error); return; }
    toast.success(`${f.label} ${!f.enabled ? 'enabled' : 'disabled'}`);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Feature Flags</h1>
        <p className="text-muted-foreground mt-1">Enable or disable platform modules in real-time.</p>
      </div>

      <Card>
        {flags.length === 0 ? (
          <EmptyState icon={ToggleLeft} title="No feature flags" description="Feature flags will appear here once configured." />
        ) : (
          <div className="space-y-2">
            {flags.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{f.label}</p>
                    <Badge variant={f.enabled ? 'success' : 'secondary'}>{f.enabled ? 'On' : 'Off'}</Badge>
                  </div>
                  {f.description && <p className="text-sm text-muted-foreground mt-0.5">{f.description}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">Updated {timeAgo(f.updated_at)}</p>
                </div>
                <button
                  onClick={() => toggle(f)}
                  disabled={updating === f.id}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ml-4 ${
                    f.enabled ? 'bg-brand-600' : 'bg-secondary'
                  } ${updating === f.id ? 'opacity-50' : ''}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${f.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
