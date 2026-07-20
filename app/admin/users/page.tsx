'use client';

import { useMemo, useState } from 'react';
import { Users as UsersIcon, Search, Plus, Filter, Download, MoreHorizontal, Pencil, Trash2, Ban, KeyRound, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { adminUsers } from '@/lib/data/admin';
import { toast } from 'sonner';
import type { Role, Membership } from '@/types';

const PAGE_SIZE = 8;

const ROLE_OPTIONS: Role[] = ['superadmin', 'admin', 'instructor', 'student', 'affiliate', 'user'];
const MEMBERSHIP_OPTIONS: Membership[] = ['starter', 'pro', 'lifetime'];

type AdminUser = (typeof adminUsers)[number];

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'student' as Role, membership: 'starter' as Membership });

  const filtered = useMemo(() => {
    return adminUsers.filter((u) => {
      const matchQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.id.toLowerCase().includes(query.toLowerCase());
      const matchPlan = plan === 'all' || u.plan === plan;
      const matchStatus = status === 'all' || u.status === status;
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchQuery && matchPlan && matchStatus && matchRole;
    });
  }, [query, plan, status, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function openEdit(u: AdminUser) {
    setEditUser(u);
    setEditForm({ name: u.name, role: (u.role as Role) || 'student', membership: (u.plan.toLowerCase() as Membership) || 'starter' });
  }

  function saveEdit() {
    if (!editUser) return;
    toast.success(`${editUser.name} updated`, { description: `Role: ${editForm.role} · Membership: ${editForm.membership}` });
    setEditUser(null);
  }

  function toggleSuspend(u: AdminUser) {
    const isSuspended = u.status === 'Suspended';
    toast.success(`${isSuspended ? 'Reactivated' : 'Suspended'} ${u.name}`, {
      description: isSuspended ? 'User can now sign in.' : 'User cannot sign in until reactivated.',
    });
  }

  function resetPassword(u: AdminUser) {
    toast.success(`Password reset email sent to ${u.email}`);
  }

  function confirmDelete() {
    if (!deleteUser) return;
    toast.success(`${deleteUser.name} has been deleted`);
    setDeleteUser(null);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={UsersIcon}
        title="Users"
        subtitle="Search, filter and manage all platform users."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success('Export started (demo)')}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button size="sm" className="bg-brand-gradient font-semibold" onClick={() => toast.info('Add user dialog (demo)')}>
              <Plus className="h-4 w-4 mr-1" /> Add user
            </Button>
          </>
        }
      />

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All users ({filtered.length})</CardTitle>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, ID…"
                className="pl-10"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={plan} onValueChange={(v) => { setPlan(v); setPage(1); }}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                          {u.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{u.id}</TableCell>
                  <TableCell><Badge variant={u.plan === 'Lifetime' ? 'default' : 'secondary'}>{u.plan}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' || u.role === 'superadmin' ? 'default' : 'outline'} className="capitalize">{u.role}</Badge>
                  </TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-muted-foreground">{u.joined}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEdit(u)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleSuspend(u)}>
                          <Ban className="mr-2 h-4 w-4" /> {u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resetPassword(u)}>
                          <KeyRound className="mr-2 h-4 w-4" /> Reset password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteUser(u)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No users match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {current} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={current === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update profile, role and membership for {editUser?.email}</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full name</Label>
                <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v as Role }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Membership</Label>
                  <Select value={editForm.membership} onValueChange={(v) => setEditForm((f) => ({ ...f, membership: v as Membership }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEMBERSHIP_OPTIONS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                Role changes take effect on next sign-in.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-brand-gradient font-semibold">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteUser?.name} ({deleteUser?.email}) from the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
