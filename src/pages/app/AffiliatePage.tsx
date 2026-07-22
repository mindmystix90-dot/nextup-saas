import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Link2, Copy, MousePointerClick, UserPlus, ShoppingBag, IndianRupee,
  Users, Power, PowerOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, StatCard, Badge, EmptyState, Spinner, Button } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  fetchAffiliateStats, fetchReferrals, enableAffiliate, disableAffiliate,
} from '@/services/affiliate.service';
import type { AffiliateStats, Referral } from '@/types';

export default function AffiliatePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [toggling, setToggling] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [s, r] = await Promise.all([
        fetchAffiliateStats(user.id), fetchReferrals(user.id),
      ]);
      setStats(s); setReferrals(r);
    } catch {
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const enabled = stats?.enabled ?? false;
  const link = stats?.referral_link ?? '';

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Referral link copied!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleToggle = async () => {
    if (!user) return;
    setToggling(true);
    const res = enabled ? await disableAffiliate(user.id) : await enableAffiliate(user.id);
    setToggling(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success(enabled ? 'Affiliate disabled' : 'Affiliate enabled!');
    await refreshProfile();
    loadData();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Affiliate Program</h1>
          <p className="text-muted-foreground mt-1">Earn commission by referring others to NextUp.</p>
        </div>
        <Button
          variant={enabled ? 'danger' : 'primary'}
          onClick={handleToggle}
          disabled={toggling}
        >
          {enabled ? <><PowerOff className="h-4 w-4 mr-2" />Disable</> : <><Power className="h-4 w-4 mr-2" />Enable Affiliate</>}
        </Button>
      </div>

      {!enabled ? (
        <Card className="text-center">
          <div className="p-4 rounded-2xl bg-secondary/50 w-fit mx-auto mb-4">
            <Power className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold font-display">Affiliate program is off</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Enable affiliate to get your referral link and start earning commission.</p>
          <Button onClick={handleToggle} disabled={toggling}>
            <Power className="h-4 w-4 mr-2" /> Enable Now
          </Button>
        </Card>
      ) : (
        <>
          <Card>
            <h2 className="font-semibold font-display mb-2">Your Referral Link</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px] input-field bg-secondary/30 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-sm">{link || '—'}</span>
              </div>
              <Button onClick={copyLink}><Copy className="h-4 w-4 mr-2" />Copy</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Referral code: <span className="font-mono font-semibold">{stats?.referral_code ?? '—'}</span>
              {stats?.commission_rate ? ` · Commission rate: ${stats.commission_rate}%` : ''}
            </p>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={MousePointerClick} label="Clicks" value={stats?.clicks ?? 0} color="text-blue-600" />
            <StatCard icon={UserPlus} label="Registrations" value={stats?.registrations ?? 0} color="text-purple-600" />
            <StatCard icon={ShoppingBag} label="Sales" value={stats?.sales ?? 0} color="text-green-600" />
            <StatCard icon={IndianRupee} label="Commission" value={formatCurrency((stats?.pending_commission ?? 0) + (stats?.paid_commission ?? 0))} color="text-orange-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard icon={IndianRupee} label="Available Balance" value={formatCurrency(stats?.available_balance ?? 0)} color="text-green-600" />
            <StatCard icon={IndianRupee} label="Paid Commission" value={formatCurrency(stats?.paid_commission ?? 0)} color="text-blue-600" />
          </div>

          <Card>
            <h2 className="font-semibold font-display mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" /> Referrals
            </h2>
            {referrals.length === 0 ? (
              <EmptyState icon={Users} title="No referrals yet" description="Share your link to start earning commission." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Commission</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {referrals.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3">{r.referred_name || '—'}</td>
                        <td className="py-3 text-muted-foreground">{r.referred_email || '—'}</td>
                        <td className="py-3">
                          <Badge variant={r.status === 'purchased' ? 'success' : r.status === 'registered' ? 'default' : 'outline'}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 font-semibold">{formatCurrency(r.commission)}</td>
                        <td className="py-3 text-muted-foreground">{formatDateTime(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
