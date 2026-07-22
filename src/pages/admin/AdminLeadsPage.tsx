import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Target, Plus, Trash2, Users, Layers } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Input, Textarea, Select, Modal } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  fetchLeads, fetchUnassignedLeads, adminCreateLead, adminAssignLead,
  adminBulkAssignLeads, adminDeleteLead,
} from '@/services/sales.service';
import { fetchAllProfiles } from '@/services/admin.service';
import type { Lead, LeadStatus, Profile } from '@/types';

const statusVariant = (s: LeadStatus) =>
  s === 'closed' ? 'success' : s === 'rejected' || s === 'no_answer' ? 'danger' :
  s === 'interested' ? 'default' : s === 'follow_up' ? 'warning' : 'secondary';

export default function AdminLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [partners, setPartners] = useState<Profile[]>([]);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [assignLead, setAssignLead] = useState<Lead | null>(null);
  const [assignTo, setAssignTo] = useState('');
  const [bulkPartner, setBulkPartner] = useState('');
  const [bulkCount, setBulkCount] = useState('5');
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [l, profiles] = await Promise.all([fetchLeads(), fetchAllProfiles()]);
      setLeads(l);
      setPartners(profiles.filter((p) => p.sales_partner_enabled));
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const partnerOpts = () => partners.map((p) => ({ value: p.id, label: p.name }));

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const { error } = await adminCreateLead(form);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Lead created');
    setShowCreate(false); setForm({ name: '', email: '', phone: '', source: '', notes: '' }); load();
  };

  const handleAssign = async () => {
    if (!assignLead || !assignTo) return;
    const p = partners.find((x) => x.id === assignTo);
    setSaving(true);
    const { error } = await adminAssignLead(assignLead.id, assignTo, p?.name || '');
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Lead assigned');
    setAssignLead(null); setAssignTo(''); load();
  };

  const handleBulk = async () => {
    if (!bulkPartner) return;
    const p = partners.find((x) => x.id === bulkPartner);
    setSaving(true);
    const { error, assigned } = await adminBulkAssignLeads(bulkPartner, p?.name || '', Number(bulkCount));
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success(`Assigned ${assigned} leads`);
    setShowBulk(false); load();
  };

  const handleDelete = async (l: Lead) => {
    if (!confirm('Delete this lead?')) return;
    const { error } = await adminDeleteLead(l.id);
    if (error) { toast.error(error); return; }
    toast.success('Lead deleted'); load();
  };

  const filtered = leads.filter((l) => filter === 'all' || l.status === filter || (filter === 'unassigned' && !l.assigned_to));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Leads</h1>
          <p className="text-muted-foreground mt-1">Create and assign leads to sales partners.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulk(true)} disabled={partners.length === 0}>
            <Layers className="h-4 w-4 mr-2" /> Bulk Assign
          </Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> New Lead</Button>
        </div>
      </div>

      <Select value={filter} onChange={setFilter} options={[
        { value: 'all', label: 'All Leads' }, { value: 'unassigned', label: 'Unassigned' },
        { value: 'new', label: 'New' }, { value: 'called', label: 'Called' },
        { value: 'interested', label: 'Interested' }, { value: 'follow_up', label: 'Follow Up' },
        { value: 'closed', label: 'Closed' }, { value: 'rejected', label: 'Rejected' },
        { value: 'no_answer', label: 'No Answer' }]} />

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={Target} title="No leads yet" description="Create a lead to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Contact</th>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Assigned To</th>
                  <th className="pb-2 font-medium">Created</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 font-medium">{l.name}</td>
                    <td className="py-3">
                      <p className="text-xs">{l.email}</p>
                      <p className="text-xs text-muted-foreground">{l.phone}</p>
                    </td>
                    <td className="py-3">{l.source}</td>
                    <td className="py-3"><Badge variant={statusVariant(l.status)}>{l.status}</Badge></td>
                    <td className="py-3">{l.assigned_to_name || <span className="text-muted-foreground text-xs">Unassigned</span>}</td>
                    <td className="py-3 text-muted-foreground text-xs">{formatDate(l.created_at)}</td>
                    <td className="py-3 text-right space-x-1 whitespace-nowrap">
                      {!l.assigned_to && (
                        <Button variant="outline" onClick={() => setAssignLead(l)}>
                          <Users className="h-3 w-3 mr-1" /> Assign
                        </Button>
                      )}
                      <Button variant="danger" onClick={() => handleDelete(l)}><Trash2 className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Lead">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v })} placeholder="e.g. Website, Ads" />
          <Textarea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={2} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Lead'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!assignLead} onClose={() => setAssignLead(null)} title="Assign Lead">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Assign <span className="font-medium text-foreground">{assignLead?.name}</span> to a sales partner.</p>
          {partners.length === 0 ? (
            <EmptyState icon={Users} title="No sales partners" description="Enable sales partners first." />
          ) : (
            <Select label="Sales Partner" value={assignTo} onChange={setAssignTo} options={[{ value: '', label: 'Select...' }, ...partnerOpts()]} />
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setAssignLead(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={saving || !assignTo}>{saving ? 'Assigning...' : 'Assign'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Assign Leads">
        <div className="space-y-4">
          {partners.length === 0 ? (
            <EmptyState icon={Users} title="No sales partners" />
          ) : (
            <>
              <Select label="Sales Partner" value={bulkPartner} onChange={setBulkPartner} options={[{ value: '', label: 'Select...' }, ...partnerOpts()]} />
              <Input label="Number of Leads" type="number" value={bulkCount} onChange={setBulkCount} />
            </>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowBulk(false)}>Cancel</Button>
            <Button onClick={handleBulk} disabled={saving || !bulkPartner}>{saving ? 'Assigning...' : 'Bulk Assign'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
