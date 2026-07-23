'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Phone,
  Mail,
  Building,
  IndianRupee,
  Calendar,
  MessageSquare,
  CheckSquare,
  UserCheck,
  ChevronRight,
  Loader2,
  Trash2,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  fetchLeads,
  createLead,
  updateLeadStage,
  addLeadNote,
  addLeadTask,
  toggleLeadTask,
  deleteLead,
  type Lead,
  type LeadStage,
} from '@/services/crm.service';
import { toast } from 'sonner';

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'new', label: 'New Leads', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { id: 'contacted', label: 'Contacted', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { id: 'qualified', label: 'Qualified', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  { id: 'proposal', label: 'Proposal Sent', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  { id: 'won', label: 'Closed Won', color: 'bg-success/10 text-success border-success/20' },
  { id: 'lost', label: 'Closed Lost', color: 'bg-destructive/10 text-destructive border-destructive/20' },
];

export default function AdminCRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  // Add Lead Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: 4999,
    source: 'website' as const,
    stage: 'new' as LeadStage,
    tags: [] as string[],
  });

  // Selected Lead Detail Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch {
      toast.error('Failed to load CRM leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.email) {
      toast.error('Name and Email are required.');
      return;
    }
    try {
      const created = await createLead(newLead);
      toast.success(`Lead "${created.name}" created successfully.`);
      setIsAddOpen(false);
      setNewLead({ name: '', email: '', phone: '', company: '', value: 4999, source: 'website', stage: 'new', tags: [] });
      await loadData();
    } catch {
      toast.error('Failed to create lead.');
    }
  };

  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    try {
      await updateLeadStage(leadId, newStage);
      toast.success(`Lead stage updated to ${newStage.toUpperCase()}`);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, stage: newStage });
      }
    } catch {
      toast.error('Failed to update stage.');
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !newNoteContent.trim()) return;
    try {
      const note = await addLeadNote(selectedLead.id, 'Admin', newNoteContent.trim());
      setSelectedLead({
        ...selectedLead,
        notes: [note, ...(selectedLead.notes || [])],
      });
      setNewNoteContent('');
      toast.success('Note added to timeline.');
    } catch {
      toast.error('Failed to add note.');
    }
  };

  const handleAddTask = async () => {
    if (!selectedLead || !newTaskTitle.trim()) return;
    try {
      const task = await addLeadTask(selectedLead.id, newTaskTitle.trim(), newTaskDueDate || new Date().toISOString().split('T')[0]);
      setSelectedLead({
        ...selectedLead,
        tasks: [...(selectedLead.tasks || []), task],
      });
      setNewTaskTitle('');
      setNewTaskDueDate('');
      toast.success('Task created.');
    } catch {
      toast.error('Failed to add task.');
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!selectedLead) return;
    try {
      await toggleLeadTask(selectedLead.id, taskId, !currentCompleted);
      const updatedTasks = (selectedLead.tasks || []).map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t));
      setSelectedLead({ ...selectedLead, tasks: updatedTasks });
    } catch {
      toast.error('Failed to update task.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(id);
      toast.info('Lead deleted.');
      setSelectedLead(null);
      await loadData();
    } catch {
      toast.error('Failed to delete lead.');
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPipelineValue = leads.filter((l) => l.stage !== 'lost').reduce((s, l) => s + (l.value || 0), 0);
  const wonDealsValue = leads.filter((l) => l.stage === 'won').reduce((s, l) => s + (l.value || 0), 0);
  const winRate = leads.length ? Math.round((leads.filter((l) => l.stage === 'won').length / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={TrendingUp}
        title="Sales Workspace (CRM)"
        subtitle="Track prospective students, manage sales pipelines, record activities, and assign deals."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold">Total Pipeline Value</p>
            <p className="mt-2 font-display text-2xl font-bold text-primary">₹{totalPipelineValue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold">Closed Won Revenue</p>
            <p className="mt-2 font-display text-2xl font-bold text-success">₹{wonDealsValue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold">Active Leads</p>
            <p className="mt-2 font-display text-2xl font-bold">{leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').length}</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold">Win Rate</p>
            <p className="mt-2 font-display text-2xl font-bold text-emerald-500">{winRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lead name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-secondary p-1 rounded-xl">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'board' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
              }`}
            >
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
              }`}
            >
              List View
            </button>
          </div>

          <Button onClick={() => setIsAddOpen(true)} className="bg-brand-gradient font-semibold text-xs shadow-premium">
            <Plus className="mr-1.5 h-4 w-4" /> Add New Lead
          </Button>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((st) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === st.id);
            const stageTotal = stageLeads.reduce((s, l) => s + (l.value || 0), 0);

            return (
              <div key={st.id} className="bg-secondary/30 rounded-2xl p-3 border border-border min-w-[240px] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                      {stageLeads.length}
                    </span>
                    <h4 className="font-bold text-xs">{st.label}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">₹{(stageTotal / 1000).toFixed(0)}k</span>
                </div>

                <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-muted-foreground border border-dashed rounded-xl border-border">
                      No leads in {st.label}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <Card
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="card-premium cursor-pointer hover:border-primary/50 transition-all group p-3 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-xs group-hover:text-primary transition-colors">{lead.name}</h5>
                          <span className="font-mono text-xs font-bold text-success">₹{(lead.value || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{lead.email}</p>
                        {lead.company && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3" /> {lead.company}</p>}

                        <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-muted-foreground">
                          <span className="capitalize bg-secondary px-1.5 py-0.5 rounded">{lead.source}</span>
                          <span className="font-mono text-[9px]">{new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="card-premium">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Lead Name</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Stage</th>
                    <th className="px-4 py-3 font-semibold">Deal Value</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{l.name}</p>
                        {l.company && <p className="text-xs text-muted-foreground">{l.company}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs space-y-0.5">
                        <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {l.email}</p>
                        {l.phone && <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {l.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Select value={l.stage} onValueChange={(val: LeadStage) => handleStageChange(l.id, val)}>
                          <SelectTrigger className="h-7 text-xs w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => (
                              <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 font-bold text-success">
                        ₹{(l.value || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{l.source}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedLead(l)}>Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Sales Lead</DialogTitle>
            <DialogDescription>Record a prospective student lead to track in the sales pipeline.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold">Full Name *</label>
              <Input
                placeholder="e.g. Vikram Malhotra"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold">Email Address *</label>
                <Input
                  placeholder="vikram@example.com"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Phone Number</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold">Company / College</label>
                <Input
                  placeholder="e.g. TechCorp Solutions"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Deal Value (₹)</label>
                <Input
                  type="number"
                  value={newLead.value}
                  onChange={(e) => setNewLead({ ...newLead, value: Number(e.target.value) })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold">Lead Source</label>
              <Select value={newLead.source} onValueChange={(val: any) => setNewLead({ ...newLead, source: val })}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website Form</SelectItem>
                  <SelectItem value="referral">Affiliate / Referral</SelectItem>
                  <SelectItem value="campaign">Ad Campaign</SelectItem>
                  <SelectItem value="direct">Direct Contact</SelectItem>
                  <SelectItem value="manual">Manual Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLead} className="bg-brand-gradient font-semibold">Create Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Selected Lead Details Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="font-display text-xl font-bold">{selectedLead.name}</DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">{selectedLead.email} · {selectedLead.company || 'Individual Student'}</DialogDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDeleteLead(selectedLead.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              {/* Stage & Deal Info */}
              <div className="bg-secondary/50 rounded-2xl p-4 space-y-3 border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">Current Stage:</span>
                  <Select value={selectedLead.stage} onValueChange={(val: LeadStage) => handleStageChange(selectedLead.id, val)}>
                    <SelectTrigger className="h-8 text-xs w-36 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Deal Value:</span>
                  <span className="font-bold text-base text-success">₹{(selectedLead.value || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Notes & Tasks Tabs */}
              <Tabs defaultValue="notes" className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                  <TabsTrigger value="notes" className="text-xs font-semibold"><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Activity Notes</TabsTrigger>
                  <TabsTrigger value="tasks" className="text-xs font-semibold"><CheckSquare className="mr-1.5 h-3.5 w-3.5" /> Follow-Up Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type activity note or meeting outcome..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="text-xs min-h-[70px]"
                    />
                    <Button size="sm" onClick={handleAddNote} className="bg-brand-gradient font-semibold text-xs">Add Note</Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {(!selectedLead.notes || selectedLead.notes.length === 0) ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No activity notes recorded yet.</p>
                    ) : (
                      selectedLead.notes.map((n) => (
                        <div key={n.id} className="p-3 bg-card border border-border rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between items-center font-semibold text-muted-foreground">
                            <span>{n.author}</span>
                            <span className="text-[10px]">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-foreground">{n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-3 mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Follow-up task title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="text-xs w-36"
                    />
                    <Button size="sm" onClick={handleAddTask} className="bg-brand-gradient font-semibold text-xs shrink-0">Add Task</Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {(!selectedLead.tasks || selectedLead.tasks.length === 0) ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No follow-up tasks scheduled.</p>
                    ) : (
                      selectedLead.tasks.map((t) => (
                        <div key={t.id} className="p-2.5 bg-card border border-border rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => handleToggleTask(t.id, t.completed)}
                              className="rounded border-border"
                            />
                            <span className={t.completed ? 'line-through text-muted-foreground' : 'font-semibold'}>{t.title}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">Due: {t.dueDate}</span>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
