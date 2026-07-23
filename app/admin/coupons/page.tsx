'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Search, Copy, Check, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/coupons.service';
import type { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    validUntil: '2026-12-31',
    usageLimit: 100,
    applicablePlan: 'All Plans',
    active: true,
  });

  async function load() {
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditTarget(null);
    setForm({
      code: '',
      discountType: 'percentage',
      discountValue: 20,
      validUntil: '2026-12-31',
      usageLimit: 500,
      applicablePlan: 'All Plans',
      active: true,
    });
    setDialogOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditTarget(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      validUntil: c.validUntil,
      usageLimit: c.usageLimit,
      applicablePlan: c.applicablePlan || 'All Plans',
      active: c.active,
    });
    setDialogOpen(true);
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code "${code}"`);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleSave() {
    if (!form.code.trim()) {
      toast.error('Coupon code is required.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updateCoupon(editTarget.id, form);
        toast.success(`Coupon "${form.code}" updated`);
      } else {
        await createCoupon(form);
        toast.success(`Coupon "${form.code}" created`);
      }
      setDialogOpen(false);
      await load();
    } catch {
      toast.error('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCoupon(deleteTarget.id);
      toast.success(`Deleted coupon ${deleteTarget.code}`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Failed to delete coupon');
    }
  }

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(query.toLowerCase()) ||
    (c.applicablePlan || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Tag}
        title="Coupon Manager"
        subtitle="Create, monitor, and restrict promotional discount codes across all membership plans."
        actions={
          <Button onClick={openCreate} className="bg-brand-gradient font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Create Coupon Code
          </Button>
        }
      />

      <Card className="card-premium">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg">Active Coupons ({filtered.length})</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupon code..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No discount coupons found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applicable Plan</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
                          {c.code}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(c.code)}>
                          {copiedCode === c.code ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </TableCell>
                    <TableCell><Badge variant="outline">{c.applicablePlan || 'All Plans'}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.usedCount} / {c.usageLimit} redeemed
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {c.validUntil}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={c.active ? 'Active' : 'Expired'} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
            <DialogTitle>{editTarget ? 'Edit Coupon Code' : 'Create Coupon Code'}</DialogTitle>
            <DialogDescription>Set discount rates, usage caps, and expiration limits.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1">
              <Label>Coupon Code *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Discount Type</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as 'percentage' | 'fixed' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Discount Value *</Label>
                <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Valid Until</Label>
                <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Usage Cap Limit</Label>
                <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Applicable Plan</Label>
              <Input value={form.applicablePlan} onChange={(e) => setForm({ ...form, applicablePlan: e.target.value })} placeholder="All Plans, Pro, or Lifetime" />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <Label>Active Status</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-gradient font-semibold">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the coupon code {deleteTarget?.code}.</AlertDialogDescription>
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
