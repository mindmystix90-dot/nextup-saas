import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Briefcase, Check, X, Ban, Pencil, TrendingUp } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Input, Select, Modal, Avatar } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  fetchAllSalesRecords, adminVerifySales, fetchSalesConfig, updateSalesConfig,
} from '@/services/sales.service';
import { fetchAllProfiles, adminUpdateProfile } from '@/services/admin.service';
import type { Profile, SalesRecord, SalesPartnerConfig } from '@/types';

export default function AdminSalesPartnersPage() {
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Profile[]>([]);
  const [allSales, setAllSales] = useState<SalesRecord[]>([]);
  const [config, setConfig] = useState<SalesPartnerConfig | null>(null);
  const [editPartner, setEditPartner] = useState<Profile | null>(null);
  const [viewSales, setViewSales] = useState<Profile | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [cfgForm, setCfgForm] = useState({ daily_lead_limit: '10', commission_per_sale: '500', inactivity_reassign_hours: '48' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [profiles, sales, cfg] = await Promise.all([
        fetchAllProfiles(), fetchAllSalesRecords(), fetchSalesConfig(),
      ]);
      setPartners(profiles.filter((p) => p.sales_partner_enabled));
      setAllSales(sales);
      setConfig(cfg);
      if (cfg) setCfgForm({
        daily_lead_limit: String(cfg.daily_lead_limit),
        commission_per_sale: String(cfg.commission_per_sale),
        inactivity_reassign_hours: String(cfg.inactivity_reassign_hours),
      });
    } catch { toast.error('Failed to load sales partners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (p: Profile, status: string) => {
    setSaving(true);
    const { error } = await adminUpdateProfile(p.id, { sales_partner_status: status });
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success(`Partner ${status}`);
    load();
  };

  const verifySale = async (s: SalesRecord) => {
    setSaving(true);
    const { error } = await adminVerifySales(s.id, s.commission);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Sale verified & commission credited');
    load();
  };

  const saveConfig = async () => {
    setSaving(true);
    const { error } = await updateSalesConfig({
      daily_lead_limit: Number(cfgForm.daily_lead_limit),
      commission_per_sale: Number(cfgForm.commission_per_sale),
      inactivity_reassign_hours: Number(cfgForm.inactivity_reassign_hours),
    });
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Config updated');
    setShowConfig(false); load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Sales Partners</h1>
          <p className="text-muted-foreground mt-1">Manage sales partner team and performance.</p>
        </div>
        <Button variant="outline" onClick={() => setShowConfig(true)}>Configure</Button>
      </div>

      <Card>
        {partners.length === 0 ? (
          <EmptyState icon={Briefcase} title="No sales partners" description="Users with sales partner enabled will appear here." />
        ) : (
          <div className="space-y-3">
            {partners.map((p) => {
              const sales = allSales.filter((s) => s.partner_id === p.id);
              const closed = sales.filter((s) => s.verified).length;
              const earnings = sales.filter((s) => s.verified).reduce((sum, s) => sum + Number(s.commission), 0);
              const score = sales.length > 0 ? Math.round((closed / sales.length) * 100) : 0;
              return (
                <div key={p.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} src={p.photo_url || undefined} size="md" />
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                        <Badge variant={p.sales_partner_status === 'approved' ? 'success' : p.sales_partner_status === 'suspended' ? 'danger' : 'warning'}>
                          {p.sales_partner_status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center"><p className="text-xs text-muted-foreground">Closed</p><p className="font-semibold">{closed}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Earnings</p><p className="font-semibold text-green-600">{formatCurrency(earnings)}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Score</p><p className="font-semibold">{score}%</p></div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setViewSales(p)}><TrendingUp className="h-3 w-3" /></Button>
                        {p.sales_partner_status !== 'approved' && (
                          <Button variant="outline" onClick={() => setStatus(p, 'approved')}><Check className="h-3 w-3" /></Button>
                        )}
                        {p.sales_partner_status !== 'suspended' && (
                          <Button variant="danger" onClick={() => setStatus(p, 'suspended')}><Ban className="h-3 w-3" /></Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={showConfig} onClose={() => setShowConfig(false)} title="Sales Partner Configuration">
        <div className="space-y-4">
          <Input label="Daily Lead Limit" type="number" value={cfgForm.daily_lead_limit} onChange={(v) => setCfgForm({ ...cfgForm, daily_lead_limit: v })} />
          <Input label="Commission Per Sale (₹)" type="number" value={cfgForm.commission_per_sale} onChange={(v) => setCfgForm({ ...cfgForm, commission_per_sale: v })} />
          <Input label="Inactivity Reassign (hours)" type="number" value={cfgForm.inactivity_reassign_hours} onChange={(v) => setCfgForm({ ...cfgForm, inactivity_reassign_hours: v })} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowConfig(false)}>Cancel</Button>
            <Button onClick={saveConfig} disabled={saving}>{saving ? 'Saving...' : 'Save Config'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewSales} onClose={() => setViewSales(null)} title={`Sales - ${viewSales?.name}`} maxWidth="max-w-2xl">
        {viewSales && (
          <div className="space-y-3">
            {allSales.filter((s) => s.partner_id === viewSales.id).length === 0 ? (
              <EmptyState icon={TrendingUp} title="No sales records" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="pb-2 font-medium">Lead</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Commission</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allSales.filter((s) => s.partner_id === viewSales.id).map((s) => (
                      <tr key={s.id}>
                        <td className="py-2">{s.lead_name}</td>
                        <td className="py-2">{formatCurrency(s.amount)}</td>
                        <td className="py-2 font-semibold">{formatCurrency(s.commission)}</td>
                        <td className="py-2"><Badge variant={s.verified ? 'success' : 'warning'}>{s.status}</Badge></td>
                        <td className="py-2 text-muted-foreground text-xs">{formatDate(s.created_at)}</td>
                        <td className="py-2 text-right">
                          {!s.verified && <Button variant="outline" onClick={() => verifySale(s)}><Check className="h-3 w-3 mr-1" /> Verify</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
