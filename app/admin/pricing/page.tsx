'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Star, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  fetchPricingPlans, createPricingPlan, updatePricingPlan, deletePricingPlan, type PricingPlanInput,
} from '@/services/pricing.service';
import type { PricingPlan } from '@/types';

const EMPTY_FORM: PricingPlanInput = {
  name: '', price: 0, period: '/month', description: '', features: [],
  cta: 'Get Started', featured: false, badge: '', active: true, sort_order: 0,
};

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<PricingPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PricingPlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PricingPlanInput>(EMPTY_FORM);
  const [featureText, setFeatureText] = useState('');

  const load = useCallback(async () => {
    try { setPlans(await fetchPricingPlans()); } catch { toast.error('Failed to load plans'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditPlan(null);
    setForm({ ...EMPTY_FORM, sort_order: plans.length + 1 });
    setFeatureText('');
    setDialogOpen(true);
  }

  function openEdit(p: PricingPlan) {
    setEditPlan(p);
    setForm({
      name: p.name, price: p.price, period: p.period, description: p.description,
      features: p.features, cta: p.cta, featured: p.featured, badge: p.badge,
      active: p.active, sort_order: p.sort_order,
    });
    setFeatureText(p.features.join('\n'));
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Plan name is required'); return; }
    const features = featureText.split('\n').map((f) => f.trim()).filter(Boolean);
    const data = { ...form, features };
    setSaving(true);
    try {
      if (editPlan) {
        await updatePricingPlan(editPlan.id, data);
        toast.success('Plan updated');
      } else {
        await createPricingPlan(data);
        toast.success('Plan created');
      }
      setDialogOpen(false);
      await load();
    } catch { toast.error('Failed to save plan'); } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deletePricingPlan(deleteTarget.id);
      toast.success('Plan deleted');
      setDeleteTarget(null);
      await load();
    } catch { toast.error('Failed to delete plan'); }
  }

  async function toggleActive(p: PricingPlan) {
    try {
      await updatePricingPlan(p.id, { active: !p.active });
      await load();
    } catch { toast.error('Failed to update plan'); }
  }

  async function movePlan(p: PricingPlan, dir: 'up' | 'down') {
    const sorted = [...plans].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === p.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swap = sorted[swapIdx];
    await Promise.all([
      updatePricingPlan(p.id, { sort_order: swap.sort_order }),
      updatePricingPlan(swap.id, { sort_order: p.sort_order }),
    ]);
    await load();
  }

  const sorted = useMemo(() => [...plans].sort((a, b) => a.sort_order - b.sort_order), [plans]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pricing Plans"
        subtitle="Create, edit and manage subscription plans."
        actions={<Button size="sm" className="bg-brand-gradient font-semibold" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add plan</Button>}
      />

      <Card className="card-premium">
        <CardHeader><CardTitle className="text-lg">All plans ({plans.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : plans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pricing plans yet. Create your first plan.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((p) => (
                <Card key={p.id} className={`relative ${p.featured ? 'border-primary' : ''} ${!p.active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-bold">{p.name}</h3>
                          {p.featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                        </div>
                        <p className="mt-1 font-display text-2xl font-bold">₹{p.price.toLocaleString('en-IN')}<span className="text-sm font-normal text-muted-foreground">{p.period}</span></p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEdit(p)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => movePlan(p, 'up')}><ArrowUp className="mr-2 h-4 w-4" /> Move up</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => movePlan(p, 'down')}><ArrowDown className="mr-2 h-4 w-4" /> Move down</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(p)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant={p.active ? 'default' : 'secondary'}>{p.active ? 'Active' : 'Inactive'}</Badge>
                      {p.badge && <Badge variant="outline">{p.badge}</Badge>}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPlan ? 'Edit plan' : 'New plan'}</DialogTitle>
            <DialogDescription>{editPlan ? `Updating ${editPlan.name}` : 'Create a new pricing plan.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Plan name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Pro" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="/month or one-time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea value={featureText} onChange={(e) => setFeatureText(e.target.value)} rows={5} placeholder="All 20+ courses&#10;Verifiable certificates" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA text</Label>
                <Input value={form.cta} onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="Most Popular" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>Featured</Label>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>Active</Label>
                <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-gradient font-semibold">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editPlan ? 'Save changes' : 'Create plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleteTarget?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
