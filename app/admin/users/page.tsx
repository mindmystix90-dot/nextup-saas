'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users as UsersIcon, Search, MoreHorizontal, Pencil, Trash2, Ban, KeyRound, Loader2, Eye, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { UserControlCenter } from '@/components/admin/user-control-center';
import type { Role, Membership, FirestoreProfile } from '@/types';

const ROLE_OPTIONS: Role[] = ['superadmin', 'admin', 'instructor', 'student', 'affiliate', 'user'];
const MEMBERSHIP_OPTIONS: Membership[] = ['starter', 'pro', 'lifetime'];

function displayUserId(user: FirestoreProfile): string {
  return user.userId || user.uid;
}

function searchable(value: unknown): string {
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'number') return String(value).toLowerCase();
  return '';
}

function membershipLabel(m: Membership): string {
  return m.charAt(0).toUpperCase() + m.slice(1);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<FirestoreProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editUser, setEditUser] = useState<FirestoreProfile | null>(null);
  const [viewUser, setViewUser] = useState<FirestoreProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreProfile | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await authService.adminListUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const normalizedQuery = query.toLowerCase();
      const matchQuery = [
        displayUserId(u),
        u.uid,
        u.email,
        u.phone,
        u.name,
        u.referralCode,
        u.paymentId,
      ].some((value) => searchable(value).includes(normalizedQuery));
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchMembership = membershipFilter === 'all' || u.membership === membershipFilter;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'suspended' ? u.suspended : !u.suspended);
      return matchQuery && matchRole && matchMembership && matchStatus;
    });
  }, [users, query, roleFilter, membershipFilter, statusFilter]);

  function openEdit(u: FirestoreProfile) {
    setEditUser(u);
  }

  async function toggleSuspend(u: FirestoreProfile) {
    const isSuspended = !!u.suspended;
    try {
      await authService.adminSuspendUser(u.uid, !isSuspended);
      toast.success(`${isSuspended ? 'Reactivated' : 'Suspended'} ${u.name || u.email}`);
      await load();
    } catch {
      toast.error('Failed to update user status');
    }
  }

  async function resetPassword(u: FirestoreProfile) {
    if (!u.email) { toast.error('No email on file'); return; }
    try {
      await authService.adminResetPassword(u.email);
      toast.success(`Password reset email sent to ${u.email}`);
    } catch {
      toast.error('Failed to send reset email');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await authService.adminDeleteUser(deleteTarget.uid);
      toast.success(`${deleteTarget.name || deleteTarget.email} deleted from database`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(iso: string): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; }
  }

  function initials(name: string): string {
    return (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={UsersIcon}
        title="Users"
        subtitle="Search, filter and manage all platform users."
      />

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All users ({filtered.length})</CardTitle>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search User ID, email, phone, name, referral code, payment ID…"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  {MEMBERSHIP_OPTIONS.map((m) => <SelectItem key={m} value={m} className="capitalize">{membershipLabel(m)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UsersIcon className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No users found. {users.length === 0 ? 'No users have signed up yet.' : 'Try different filters.'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email / Phone</TableHead>
                  <TableHead className="hidden md:table-cell">User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Affiliate</TableHead>
                  <TableHead className="hidden lg:table-cell">Sales Partner</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {u.photoURL && <AvatarImage src={u.photoURL} alt={u.name} />}
                          <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-foreground">{u.name || 'Unnamed'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{u.email || '—'}</div>
                      <div className="text-xs">{u.phone || 'No phone'}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">{displayUserId(u)}</TableCell>
                    <TableCell><Badge variant={u.role === 'admin' || u.role === 'superadmin' ? 'default' : 'outline'} className="capitalize">{u.role || 'user'}</Badge></TableCell>
                    <TableCell><Badge variant={u.membership === 'lifetime' ? 'default' : 'secondary'} className="capitalize">{membershipLabel(u.membership || 'starter')}</Badge></TableCell>
                    <TableCell><StatusBadge status={u.suspended ? 'Suspended' : 'Active'} /></TableCell>
                    <TableCell className="hidden lg:table-cell"><StatusBadge status={u.affiliateStatus || (u.affiliateEnabled ? 'Enabled' : 'Disabled')} /></TableCell>
                    <TableCell className="hidden lg:table-cell"><StatusBadge status={u.salesPartnerStatus || 'Disabled'} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-muted-foreground text-sm">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setViewUser(u)}><Eye className="mr-2 h-4 w-4" /> View profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(u)}><Pencil className="mr-2 h-4 w-4" /> Edit profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleSuspend(u)}>{u.suspended ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />} {u.suspended ? 'Activate' : 'Suspend'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => resetPassword(u)}><KeyRound className="mr-2 h-4 w-4" /> Reset password</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteTarget(u)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete user</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>User profile</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {viewUser.photoURL && <AvatarImage src={viewUser.photoURL} alt={viewUser.name} />}
                  <AvatarFallback className="bg-brand-gradient text-white font-semibold">{initials(viewUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{viewUser.name || 'Unnamed'}</p>
                  <p className="text-muted-foreground">{viewUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div><p className="text-xs text-muted-foreground">User ID</p><p className="font-mono text-xs">{displayUserId(viewUser)}</p></div>
                <div><p className="text-xs text-muted-foreground">Firebase UID</p><p className="font-mono text-xs">{viewUser.uid}</p></div>
                <div><p className="text-xs text-muted-foreground">Role</p><p className="capitalize">{viewUser.role || 'user'}</p></div>
                <div><p className="text-xs text-muted-foreground">Package</p><p className="capitalize">{membershipLabel(viewUser.membership || 'starter')}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><p>{viewUser.suspended ? 'Suspended' : 'Active'}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p>{viewUser.phone || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Joined Date</p><p>{formatDate(viewUser.createdAt)}</p></div>
                <div><p className="text-xs text-muted-foreground">Wallet</p><p>₹{viewUser.walletBalance ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Orders</p><p>{viewUser.ordersCount ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Enrollments</p><p>{viewUser.enrollmentsCount ?? viewUser.accessibleCourses?.length ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Affiliate Status</p><p>{viewUser.affiliateStatus || (viewUser.affiliateEnabled ? 'Enabled' : 'Disabled')}</p></div>
                <div><p className="text-xs text-muted-foreground">Sales Partner Status</p><p>{viewUser.salesPartnerStatus || 'Disabled'}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Address</p><p>{viewUser.address || '—'}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Admin Notes</p><p>{viewUser.adminNotes || '—'}</p></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewUser(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog — tabbed control center */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User management</DialogTitle>
            <DialogDescription>Upgrade, downgrade, suspend, activate, reset password, and manage profile details for {editUser?.email}</DialogDescription>
          </DialogHeader>
          {editUser && (
            <UserControlCenter
              user={editUser}
              onClose={() => setEditUser(null)}
              onSaved={load}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.name || deleteTarget?.email} ({deleteTarget?.email}) from the Firestore database. The Firebase Auth account will still exist — delete it from the Firebase console if needed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
