'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ListChecks,
  ArrowLeft,
  Plus,
  Search,
  Building2,
  Clock,
  Edit2,
  Power,
  RefreshCw,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  fetchTasks,
  fetchProviders,
  saveTask,
  syncTasksForProvider,
} from '@/services/microtasks.service';
import { formatINR } from '@/services/wallet.service';
import type { Microtask, MicrotaskProvider } from '@/types';

export default function AdminTasksDirectoryPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Microtask[]>([]);
  const [providers, setProviders] = useState<MicrotaskProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Microtask> | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formProviderId, setFormProviderId] = useState('sproutgigs');
  const [formCategory, setFormCategory] = useState<any>('social');
  const [formDifficulty, setFormDifficulty] = useState<any>('easy');
  const [formReward, setFormReward] = useState('15');
  const [formMinutes, setFormMinutes] = useState('3');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, pList] = await Promise.all([
        fetchTasks(),
        fetchProviders(),
      ]);
      setTasks(tList);
      setProviders(pList);
    } catch (err) {
      console.error('Failed to load tasks directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormId(`task_${Date.now()}`);
    setFormTitle('');
    setFormDesc('');
    setFormInstructions('');
    setFormProviderId(providers[0]?.id || 'sproutgigs');
    setFormCategory('social');
    setFormDifficulty('easy');
    setFormReward('20');
    setFormMinutes('5');
    setFormExternalUrl('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (t: Microtask) => {
    setEditingTask(t);
    setFormId(t.id);
    setFormTitle(t.title);
    setFormDesc(t.description);
    setFormInstructions(t.instructions);
    setFormProviderId(t.providerId);
    setFormCategory(t.category);
    setFormDifficulty(t.difficulty);
    setFormReward(String(t.originalReward || t.reward));
    setFormMinutes(String(t.estimatedMinutes));
    setFormExternalUrl(t.externalUrl || '');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setSaving(true);
    try {
      const selectedP = providers.find((p) => p.id === formProviderId);
      const rawReward = Number(formReward) || 10;

      await saveTask({
        id: formId,
        title: formTitle.trim(),
        description: formDesc.trim(),
        instructions: formInstructions.trim(),
        providerId: formProviderId,
        providerName: selectedP?.name || 'External Provider',
        externalTaskId: `EXT-${Date.now().toString().slice(-4)}`,
        category: formCategory,
        difficulty: formDifficulty,
        originalReward: rawReward,
        estimatedMinutes: Number(formMinutes) || 5,
        proofTypes: ['text', 'screenshot'],
        externalUrl: formExternalUrl.trim(),
        maxSubmissions: 500,
        status: editingTask?.status || 'active',
      });

      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedProvider !== 'all' && t.providerId !== selectedProvider) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.providerName.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button asChild variant="ghost" size="sm" className="p-0 text-muted-foreground hover:text-foreground">
              <Link href="/admin/microtasks">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Microtask Hub
              </Link>
            </Button>
            <h1 className="font-display text-2xl font-bold tracking-tight">Locally Cached Tasks Directory</h1>
            <p className="text-xs text-muted-foreground">
              All tasks are cached locally so user browsers never call third-party provider APIs directly.
            </p>
          </div>

          <Button onClick={handleOpenAdd} className="bg-brand-gradient font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Add Custom Task
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 card-premium flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search task title or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background text-xs">
              <SelectValue placeholder="Provider Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers ({tasks.length})</SelectItem>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Tasks Table */}
        <Card className="card-premium p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Raw Payout</TableHead>
                <TableHead>User Receives</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-semibold max-w-xs">
                    <p className="truncate">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{t.id}</p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      <Building2 className="mr-1 h-3 w-3 text-primary" /> {t.providerName}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs uppercase font-medium text-muted-foreground">
                    {t.category}
                  </TableCell>

                  <TableCell className="text-xs font-mono">
                    ₹{t.originalReward}
                  </TableCell>

                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{t.reward}
                  </TableCell>

                  <TableCell className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    ₹{t.platformFee}
                  </TableCell>

                  <TableCell>
                    {t.status === 'active' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Paused</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(t)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Custom Task'}</DialogTitle>
              <DialogDescription>Configure reward payout and margin calculations.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Task Title</Label>
                <Input
                  placeholder="e.g. Follow Twitter Account & Retweet"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Provider</Label>
                <Select value={formProviderId} onValueChange={setFormProviderId}>
                  <SelectTrigger className="bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="app_download">App Download</SelectItem>
                      <SelectItem value="signup">Signup</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Difficulty</Label>
                  <Select value={formDifficulty} onValueChange={setFormDifficulty}>
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Raw Payout (₹)</Label>
                  <Input
                    type="number"
                    value={formReward}
                    onChange={(e) => setFormReward(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Est. Minutes</Label>
                  <Input
                    type="number"
                    value={formMinutes}
                    onChange={(e) => setFormMinutes(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Instructions</Label>
                <Textarea
                  placeholder="Step by step instructions for the user..."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="text-xs min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">External Offer Link</Label>
                <Input
                  placeholder="https://..."
                  value={formExternalUrl}
                  onChange={(e) => setFormExternalUrl(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-brand-gradient font-semibold">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Task'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
