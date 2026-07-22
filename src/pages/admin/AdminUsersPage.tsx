import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users, Search, Pencil, Ban, CheckCircle } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Input, Select, Modal, Avatar } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import { fetchAllProfiles, adminUpdateProfile, adminSetMembership, adminSuspendUser } from '@/services/admin.service';
import type { Profile, Role, Membership } from '@/types';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'user', membership: 'starter', start: '', expiry: '' });

  const load = async () => {
    try {
      setUsers(await fetchAllProfiles());
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u: Profile) => {
    setEditUser(u);
    setForm({
      name: u.name, email: u.email, phone: u.phone || '',
      role: u.role, membership: u.membership,
      start: u.membership_start?.split('T')[0] || '',
      expiry: u.membership_expiry?.split('T')[0] || '',
    });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    const { error: pErr } = await adminUpdateProfile(editUser.id, { name: form.name, email: form.email, phone: form.phone });
    if (pErr) { toast.error(pErr); setSaving(false); return; }

    const { error: rErr } = await adminUpdateProfile(editUser.id, { role: form.role as Role });
    if (rErr) toast.error(rErr);

    if (form.membership !== editUser.membership || form.start || form.expiry) {
      const { error: mErr } = await adminSetMembership(editUser.id, form.membership as Membership, {
        start: form.start || undefined, expiry: form.expiry || undefined, status: 'active',
      });
      if (mErr) toast.error(mErr);
    }

    toast.success('User updated');
    setEditUser(null);
    setSaving(false);
    load();
  };

  const toggleSuspend = async (u: Profile) => {
    const { error } = await adminSuspendUser(u.id, !u.suspended);
    if (error) { toast.error(error); return; }
    toast.success(u.suspended ? 'User activated' : 'User suspended');
    load();
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchMem = membershipFilter === 'all' || u.membership === membershipFilter;
    return matchSearch && matchRole && matchMem;
  });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Users</h1>
        <p className="text-muted-foreground mt-1">Manage all platform users.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className="input-field pl-9" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onChange={setRoleFilter} options={[
          { value: 'all', label: 'All Roles' }, ...['superadmin','admin','instructor','student','affiliate','sales_partner','user'].map((r) => ({ value: r, label: r }))]} />
        <Select value={membershipFilter} onChange={setMembershipFilter} options={[
          { value: 'all', label: 'All Memberships' }, ...['starter','pro','lifetime','sales_partner'].map((m) => ({ value: m, label: m }))]} />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users yet." description="Users will appear here once they register." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Membership</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Joined</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} src={u.photo_url || undefined} size="sm" />
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3"><Badge variant="secondary">{u.role}</Badge></td>
                    <td className="py-3"><Badge variant="default">{u.membership}</Badge></td>
                    <td className="py-3">
                      {u.suspended ? <Badge variant="danger">Suspended</Badge> : <Badge variant="success">Active</Badge>}
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="py-3 text-right space-x-2 whitespace-nowrap">
                      <Button variant="outline" onClick={() => openEdit(u)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant={u.suspended ? 'outline' : 'danger'} onClick={() => toggleSuspend(u)}>
                        {u.suspended ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Select label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={[
              { value: 'user', label: 'User' }, { value: 'student', label: 'Student' }, { value: 'affiliate', label: 'Affiliate' },
              { value: 'sales_partner', label: 'Sales Partner' }, { value: 'instructor', label: 'Instructor' },
              { value: 'admin', label: 'Admin' }, { value: 'superadmin', label: 'Super Admin' }]} />
            <Select label="Membership" value={form.membership} onChange={(v) => setForm({ ...form, membership: v })} options={[
              { value: 'starter', label: 'Starter' }, { value: 'pro', label: 'Pro' },
              { value: 'lifetime', label: 'Lifetime' }, { value: 'sales_partner', label: 'Sales Partner' }]} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" type="date" value={form.start} onChange={(v) => setForm({ ...form, start: v })} />
              <Input label="Expiry Date" type="date" value={form.expiry} onChange={(v) => setForm({ ...form, expiry: v })} />
            </div>
            {editUser.membership_expiry && (
              <p className="text-xs text-muted-foreground">Current expiry: {formatDateTime(editUser.membership_expiry)}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
