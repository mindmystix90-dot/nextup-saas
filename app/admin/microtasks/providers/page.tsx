'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  Key,
  ShieldAlert,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  fetchProviders,
  saveProvider,
  deleteProvider,
  toggleProviderEnabled,
  testProviderConnection,
  syncTasksForProvider,
} from '@/services/microtasks.service';
import type { MicrotaskProvider } from '@/types';

export default function AdminProvidersPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<MicrotaskProvider[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; message: string } | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Partial<MicrotaskProvider> | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiSecret, setFormApiSecret] = useState('');
  const [formWebhookSecret, setFormWebhookSecret] = useState('');
  const [formSyncInterval, setFormSyncInterval] = useState('15');
  const [formMargin, setFormMargin] = useState('20');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProviders();
      setProviders(data);
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProvider(null);
    setFormId('');
    setFormName('');
    setFormApiKey('');
    setFormApiSecret('');
    setFormWebhookSecret(`whsec_${Math.random().toString(36).slice(2, 10)}`);
    setFormSyncInterval('15');
    setFormMargin('20');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (p: MicrotaskProvider) => {
    setEditingProvider(p);
    setFormId(p.id);
    setFormName(p.name);
    setFormApiKey(p.apiKey);
    setFormApiSecret(p.apiSecret || '');
    setFormWebhookSecret(p.webhookSecret);
    setFormSyncInterval(String(p.syncIntervalMinutes));
    setFormMargin(String(p.profitMarginPercent));
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    try {
      const providerId = formId.trim() || formName.toLowerCase().replace(/[^a-z0-9]/g, '');
      await saveProvider({
        id: providerId,
        name: formName.trim(),
        slug: providerId,
        apiKey: formApiKey.trim(),
        apiSecret: formApiSecret.trim(),
        webhookSecret: formWebhookSecret.trim() || `whsec_${providerId}_secret`,
        syncIntervalMinutes: Number(formSyncInterval) || 15,
        profitMarginPercent: Number(formMargin) || 20,
        enabled: editingProvider ? editingProvider.enabled : true,
      });

      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save provider:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      await toggleProviderEnabled(id, currentEnabled);
      await loadData();
    } catch (err) {
      console.error('Failed toggle provider:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider configuration?')) return;
    try {
      await deleteProvider(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete provider:', err);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await testProviderConnection(id);
      setTestResult({ id, ...res });
      await loadData();
    } catch (err: any) {
      setTestResult({ id, ok: false, message: err?.message || 'Connection failed' });
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncTasksForProvider(id);
      await loadData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncingId(null);
    }
  };

  const copyWebhookUrl = (providerId: string) => {
    const url = `${window.location.origin}/api/webhooks/microtasks/${providerId}`;
    navigator.clipboard.writeText(url);
    alert(`Webhook URL copied to clipboard:\n${url}`);
  };

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
            <h1 className="font-display text-2xl font-bold tracking-tight">Microtask Providers</h1>
            <p className="text-xs text-muted-foreground">
              Configure SproutGigs, TimeBucks, PicoWorkers, or custom providers with unique API keys and margins.
            </p>
          </div>

          <Button onClick={handleOpenAdd} className="bg-brand-gradient font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Add New Provider
          </Button>
        </div>

        {/* Test Result Notice */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm ${
              testResult.ok
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setTestResult(null)} className="text-xs">
              Dismiss
            </Button>
          </div>
        )}

        {/* Provider List Table */}
        <Card className="card-premium p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Margin %</TableHead>
                <TableHead>Sync Interval</TableHead>
                <TableHead>Webhook Endpoint</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <div>
                        <p>{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.id}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {p.enabled ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>

                  <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {p.profitMarginPercent}%
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    Every {p.syncIntervalMinutes} mins
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyWebhookUrl(p.id)}
                      className="text-xs text-muted-foreground hover:text-foreground font-mono"
                    >
                      <Copy className="mr-1.5 h-3 w-3" /> /api/webhooks/microtasks/{p.id}
                    </Button>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {p.lastSyncAt ? new Date(p.lastSyncAt).toLocaleTimeString() : 'Never'}
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(p.id)}
                      disabled={testingId === p.id}
                      className="text-xs"
                    >
                      {testingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Test'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(p.id)}
                      disabled={syncingId === p.id}
                      className="text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 ${syncingId === p.id ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(p)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button size="sm" variant="ghost" onClick={() => handleToggle(p.id, p.enabled)}>
                      <Power className={`h-3.5 w-3.5 ${p.enabled ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    </Button>

                    <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Add / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProvider ? 'Edit Provider Configuration' : 'Add New Microtask Provider'}</DialogTitle>
              <DialogDescription>
                Configure third-party API keys, webhook authorization, and platform profit margins.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Provider Name</Label>
                <Input
                  placeholder="e.g. SproutGigs, TimeBucks, PicoWorkers"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">API Key</Label>
                <Input
                  placeholder="Enter Provider API Key"
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Webhook Authorization Secret</Label>
                <Input
                  placeholder="whsec_..."
                  value={formWebhookSecret}
                  onChange={(e) => setFormWebhookSecret(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Sync Interval (Mins)</Label>
                  <Input
                    type="number"
                    value={formSyncInterval}
                    onChange={(e) => setFormSyncInterval(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Profit Margin %</Label>
                  <Input
                    type="number"
                    value={formMargin}
                    onChange={(e) => setFormMargin(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-brand-gradient font-semibold">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Provider'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
