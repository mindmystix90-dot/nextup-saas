'use client';

import { useEffect, useState } from 'react';
import { Video, Plus, Search, Calendar, Users, ExternalLink, Trash2, Pencil, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchLiveClasses, createLiveClass, updateLiveClass, deleteLiveClass } from '@/services/live-classes.service';
import type { LiveClassSession } from '@/types';

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LiveClassSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LiveClassSession | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    instructor: '',
    scheduledAt: '',
    durationMinutes: 60,
    meetingUrl: '',
    category: 'AI Tools',
    status: 'Scheduled' as LiveClassSession['status'],
    description: '',
  });

  async function load() {
    try {
      const data = await fetchLiveClasses();
      setClasses(data);
    } catch {
      toast.error('Failed to load live classes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditTarget(null);
    setForm({
      title: '',
      instructor: '',
      scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      durationMinutes: 60,
      meetingUrl: 'https://meet.google.com/new',
      category: 'AI Tools',
      status: 'Scheduled',
      description: '',
    });
    setDialogOpen(true);
  }

  function openEdit(item: LiveClassSession) {
    setEditTarget(item);
    setForm({
      title: item.title,
      instructor: item.instructor,
      scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : '',
      durationMinutes: item.durationMinutes || 60,
      meetingUrl: item.meetingUrl || '',
      category: item.category || 'AI Tools',
      status: item.status || 'Scheduled',
      description: item.description || '',
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.instructor.trim() || !form.meetingUrl.trim()) {
      toast.error('Title, instructor, and meeting URL are required.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updateLiveClass(editTarget.id, form);
        toast.success(`Updated "${form.title}"`);
      } else {
        await createLiveClass(form);
        toast.success(`Scheduled "${form.title}"`);
      }
      setDialogOpen(false);
      await load();
    } catch {
      toast.error('Failed to save live class session');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteLiveClass(deleteTarget.id);
      toast.success(`Deleted session "${deleteTarget.title}"`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Failed to delete session');
    }
  }

  const filtered = classes.filter((c) => {
    const matchQuery =
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.instructor.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Video}
        title="Live Classes"
        subtitle="Schedule interactive live sessions, broadcast links, and attendee counts."
        actions={
          <Button onClick={openCreate} className="bg-brand-gradient font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Schedule Live Class
          </Button>
        }
      />

      <Card className="card-premium">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg">All Live Sessions ({filtered.length})</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Live">Live Now</SelectItem>
                <SelectItem value="Ended">Ended</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No live class sessions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description || 'No description'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.instructor}</TableCell>
                    <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(c.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" /> {c.enrolledCount || 0}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={c.meetingUrl} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="h-8 px-2">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(c)} className="h-8 px-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Live Class' : 'Schedule Live Class'}</DialogTitle>
            <DialogDescription>Fill in session parameters and meeting URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1">
              <Label>Session Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI Workflow Masterclass" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Instructor *</Label>
                <Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="Instructor Name" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Scheduled Date & Time *</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Duration (Minutes)</Label>
                <Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Meeting / Stream URL *</Label>
              <Input value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://meet.google.com/..." />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LiveClassSession['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Live">Live Now</SelectItem>
                  <SelectItem value="Ended">Ended</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief outline for attendees" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-gradient font-semibold">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Live Class?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the live session.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
