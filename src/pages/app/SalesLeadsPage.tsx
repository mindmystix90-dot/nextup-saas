import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Target, Phone, Save } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Textarea, Select, Modal } from '@/components/ui';
import { timeAgo, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { fetchLeads, updateLeadStatus } from '@/services/sales.service';
import type { Lead, LeadStatus } from '@/types';

const statusVariant = (s: LeadStatus) =>
  s === 'closed' ? 'success' : s === 'rejected' || s === 'no_answer' ? 'danger' :
  s === 'interested' ? 'default' : s === 'follow_up' ? 'warning' : 'secondary';

export default function SalesLeadsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('all');
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState<LeadStatus>('new');
  const [callNotes, setCallNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    try { setLeads(await fetchLeads(user.id)); }
    catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const openEdit = (l: Lead) => {
    setEditLead(l); setNewStatus(l.status); setCallNotes(l.call_notes || '');
  };

  const handleSave = async () => {
    if (!editLead || !user) return;
    setSaving(true);
    const { error } = await updateLeadStatus(editLead.id, newStatus, callNotes, user.id);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Lead updated');
    setEditLead(null); load();
  };

  const filtered = leads.filter((l) => filter === 'all' || l.status === filter);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Leads CRM</h1>
        <p className="text-muted-foreground mt-1">Manage your assigned leads and track calls.</p>
      </div>

      <Select value={filter} onChange={setFilter} options={[
        { value: 'all', label: 'All' }, { value: 'new', label: 'New' },
        { value: 'called', label: 'Called' }, { value: 'interested', label: 'Interested' },
        { value: 'follow_up', label: 'Follow Up' }, { value: 'closed', label: 'Closed' },
        { value: 'rejected', label: 'Rejected' }, { value: 'no_answer', label: 'No Answer' }]} />

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={Target} title="No leads assigned" description="Leads assigned to you will appear here." />
        ) : (
          <div className="space-y-2">
            {filtered.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{l.name}</p>
                    <Badge variant={statusVariant(l.status)}>{l.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{l.email || l.phone || 'No contact'}</p>
                  {l.call_notes && <p className="text-xs text-muted-foreground mt-1 truncate">Notes: {l.call_notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {l.last_contacted_at ? `Last contacted ${timeAgo(l.last_contacted_at)}` : `Created ${timeAgo(l.created_at)}`}
                  </p>
                </div>
                <Button variant="outline" onClick={() => openEdit(l)}>
                  <Phone className="h-3 w-3 mr-1" /> Update
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!editLead} onClose={() => setEditLead(null)} title="Update Lead">
        {editLead && (
          <div className="space-y-4">
            <div className="text-sm bg-secondary/30 p-3 rounded-lg">
              <p className="font-medium">{editLead.name}</p>
              <p className="text-xs text-muted-foreground">{editLead.email} · {editLead.phone}</p>
              {editLead.notes && <p className="text-xs mt-1">Notes: {editLead.notes}</p>}
            </div>
            <Select label="Status" value={newStatus} onChange={(v) => setNewStatus(v as LeadStatus)} options={[
              { value: 'new', label: 'New' }, { value: 'called', label: 'Called' },
              { value: 'interested', label: 'Interested' }, { value: 'follow_up', label: 'Follow Up' },
              { value: 'closed', label: 'Closed' }, { value: 'rejected', label: 'Rejected' },
              { value: 'no_answer', label: 'No Answer' }]} />
            <Textarea label="Call Notes" value={callNotes} onChange={setCallNotes} placeholder="What was discussed on the call?" rows={3} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditLead(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
