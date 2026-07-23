'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, Trash2, Loader2, Info, CheckCircle2, AlertTriangle, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchNotifications, createNotification, deleteNotification } from '@/services/notifications.service';
import type { NotificationItem } from '@/types';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'all' as NotificationItem['targetRole'],
    type: 'info' as NotificationItem['type'],
  });

  async function load() {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSend() {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message body are required.');
      return;
    }
    setSending(true);
    try {
      await createNotification({
        title: form.title,
        message: form.message,
        targetRole: form.targetRole,
        type: form.type,
        sentBy: 'Super Admin',
      });
      toast.success(`Broadcast notification sent to ${form.targetRole} users`);
      setDialogOpen(false);
      setForm({ title: '', message: '', targetRole: 'all', type: 'info' });
      await load();
    } catch {
      toast.error('Failed to send broadcast notification');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotification(id);
      toast.success('Notification removed');
      await load();
    } catch {
      toast.error('Failed to delete notification');
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Bell}
        title="Notification Center"
        subtitle="Send targeted announcements, system maintenance warnings, and promotional alerts."
        actions={
          <Button onClick={() => setDialogOpen(true)} className="bg-brand-gradient font-semibold">
            <Plus className="h-4 w-4 mr-1" /> New Announcement
          </Button>
        }
      />

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Sent Notifications ({notifications.length})</CardTitle>
          <CardDescription>Broadcast history and engagement analytics</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No broadcast notifications sent yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title & Message</TableHead>
                  <TableHead>Target Scope</TableHead>
                  <TableHead>Sent By</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <Badge variant={n.type === 'alert' || n.type === 'warning' ? 'destructive' : 'secondary'} className="capitalize">
                        {n.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{n.targetRole}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{n.sentBy || 'Admin'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(n.id)} className="text-destructive h-8 px-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Broadcast dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Broadcast Announcement</DialogTitle>
            <DialogDescription>This message will appear in user dashboards and notification bells.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1">
              <Label>Notification Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. New Live Class Scheduled" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Target Audience</Label>
                <Select value={form.targetRole} onValueChange={(v) => setForm({ ...form, targetRole: v as NotificationItem['targetRole'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="affiliate">Affiliates Only</SelectItem>
                    <SelectItem value="instructor">Instructors Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Notice Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as NotificationItem['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Message Content *</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Provide clear details for users..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sending} className="bg-brand-gradient font-semibold">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
