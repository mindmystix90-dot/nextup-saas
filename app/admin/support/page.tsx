'use client';

import { useEffect, useState } from 'react';
import { LifeBuoy, Search, Send, MessageSquare, CheckCircle, Clock, AlertTriangle, Trash2, Loader2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchSupportTickets, addTicketReply, updateTicketStatus, deleteTicket } from '@/services/support.service';
import type { SupportTicket } from '@/types';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  async function load() {
    try {
      const data = await fetchSupportTickets();
      setTickets(data);
    } catch {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSendReply() {
    if (!activeTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      const newReply = await addTicketReply(activeTicket.id, {
        sender: 'support',
        senderName: 'Super Admin',
        message: replyMessage.trim(),
      });
      const updated = {
        ...activeTicket,
        status: 'In Progress' as SupportTicket['status'],
        replies: [...(activeTicket.replies || []), newReply],
      };
      setActiveTicket(updated);
      setReplyMessage('');
      toast.success('Reply sent to student');
      await load();
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  }

  async function handleStatusChange(status: SupportTicket['status']) {
    if (!activeTicket) return;
    try {
      await updateTicketStatus(activeTicket.id, status);
      setActiveTicket({ ...activeTicket, status });
      toast.success(`Ticket status set to ${status}`);
      await load();
    } catch {
      toast.error('Failed to update ticket status');
    }
  }

  async function handleDeleteTicket(id: string) {
    try {
      await deleteTicket(id);
      toast.success('Ticket deleted');
      if (activeTicket?.id === id) setActiveTicket(null);
      await load();
    } catch {
      toast.error('Failed to delete ticket');
    }
  }

  const filtered = tickets.filter((t) => {
    const matchQuery =
      t.subject.toLowerCase().includes(query.toLowerCase()) ||
      t.userName.toLowerCase().includes(query.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(query.toLowerCase()) ||
      t.id.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={LifeBuoy}
        title="Support Ticket Center"
        subtitle="Manage student support queries, billing issues, and technical inquiries."
      />

      <Card className="card-premium">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg">Support Tickets ({filtered.length})</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket ID or subject..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LifeBuoy className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No support tickets found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-semibold">{t.id}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground line-clamp-1">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{t.userName}</p>
                      <p className="text-xs text-muted-foreground">{t.userEmail}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={t.priority === 'Urgent' || t.priority === 'High' ? 'destructive' : 'secondary'}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveTicket(t)}>
                          Open Thread
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTicket(t.id)} className="text-destructive h-8 px-2">
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

      {/* Ticket thread modal */}
      <Dialog open={!!activeTicket} onOpenChange={(open) => !open && setActiveTicket(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg flex items-center gap-2">
                  <span className="font-mono text-primary">{activeTicket?.id}</span> {activeTicket?.subject}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Submitted by {activeTicket?.userName} ({activeTicket?.userEmail})
                </DialogDescription>
              </div>
              {activeTicket && (
                <Select value={activeTicket.status} onValueChange={(v) => handleStatusChange(v as SupportTicket['status'])}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </DialogHeader>

          {activeTicket && (
            <div className="space-y-4 py-2">
              <div className="border rounded-xl p-4 bg-secondary/20 space-y-3 max-h-80 overflow-y-auto">
                {(activeTicket.replies || []).map((reply) => {
                  const isAdmin = reply.sender === 'support' || reply.sender === 'admin';
                  return (
                    <div
                      key={reply.id}
                      className={`p-3 rounded-xl text-sm ${
                        isAdmin ? 'bg-primary/10 border border-primary/20 ml-6' : 'bg-background border border-border mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs flex items-center gap-1">
                          <User className="h-3 w-3" /> {reply.senderName || reply.sender}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply form */}
              <div className="space-y-2 pt-2">
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official support reply to student..."
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyMessage.trim()}
                    className="bg-brand-gradient font-semibold"
                  >
                    {sendingReply ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
