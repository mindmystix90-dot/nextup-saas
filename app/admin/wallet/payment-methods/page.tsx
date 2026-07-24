'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Loader2,
  HelpCircle,
  Info,
  DollarSign,
  Clock,
  ShieldCheck,
  ListPlus,
  RefreshCw,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  subscribePaymentMethods,
  savePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod,
  reorderPaymentMethods,
  DEFAULT_PAYMENT_METHODS,
} from '@/services/payment-methods.service';
import type { PaymentMethodConfig, PaymentMethodField } from '@/types';
import { formatINR } from '@/services/wallet.service';

const EMPTY_METHOD: PaymentMethodConfig = {
  id: '',
  name: '',
  enabled: true,
  minimumWithdraw: 100,
  maximumWithdraw: 50000,
  withdrawFee: 0,
  withdrawFeeType: 'fixed',
  processingTime: 'Instant',
  instructions: 'Please enter your account details carefully.',
  requiredFields: [
    { key: 'accountId', label: 'Account Identifier / ID', placeholder: 'Enter details', required: true, type: 'text' },
  ],
  displayOrder: 99,
};

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePaymentMethods((data) => {
      setMethods(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function handleOpenCreate() {
    setEditingMethod({
      ...EMPTY_METHOD,
      displayOrder: methods.length + 1,
    });
    setIsDialogOpen(true);
  }

  function handleOpenEdit(m: PaymentMethodConfig) {
    setEditingMethod(JSON.parse(JSON.stringify(m)));
    setIsDialogOpen(true);
  }

  async function handleToggleStatus(m: PaymentMethodConfig) {
    try {
      await togglePaymentMethodStatus(m.id, !m.enabled);
      toast.success(`${m.name} is now ${!m.enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePaymentMethod(id);
      toast.success('Payment method deleted successfully');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete payment method');
    }
  }

  async function handleMoveOrder(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === methods.length - 1)
    ) {
      return;
    }

    const newMethods = [...methods];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newMethods[index];
    newMethods[index] = newMethods[targetIndex];
    newMethods[targetIndex] = temp;

    const orderedIds = newMethods.map((m) => m.id);
    try {
      await reorderPaymentMethods(orderedIds);
      toast.success('Display order updated');
    } catch (err) {
      toast.error('Failed to reorder payment methods');
    }
  }

  async function handleSaveMethod() {
    if (!editingMethod) return;
    if (!editingMethod.name.trim()) {
      toast.error('Please enter a payment method name');
      return;
    }

    const methodId =
      editingMethod.id.trim() ||
      editingMethod.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (editingMethod.requiredFields.length === 0) {
      toast.error('At least one required field must be defined');
      return;
    }

    setSaving(true);
    try {
      await savePaymentMethod({
        ...editingMethod,
        id: methodId,
      });
      toast.success(`Payment method "${editingMethod.name}" saved!`);
      setIsDialogOpen(false);
      setEditingMethod(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save payment method');
    } finally {
      setSaving(false);
    }
  }

  // Dynamic Field Builder Handlers
  function addRequiredField() {
    if (!editingMethod) return;
    const newField: PaymentMethodField = {
      key: `field_${Date.now()}`,
      label: 'New Account Field',
      placeholder: 'Enter details',
      required: true,
      type: 'text',
    };
    setEditingMethod({
      ...editingMethod,
      requiredFields: [...editingMethod.requiredFields, newField],
    });
  }

  function updateRequiredField(index: number, updates: Partial<PaymentMethodField>) {
    if (!editingMethod) return;
    const fields = [...editingMethod.requiredFields];
    fields[index] = { ...fields[index], ...updates };

    // Auto-slugify key if label changed and key is default
    if (updates.label && (!fields[index].key || fields[index].key.startsWith('field_'))) {
      fields[index].key = updates.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    setEditingMethod({ ...editingMethod, requiredFields: fields });
  }

  function removeRequiredField(index: number) {
    if (!editingMethod) return;
    const fields = editingMethod.requiredFields.filter((_, i) => i !== index);
    setEditingMethod({ ...editingMethod, requiredFields: fields });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment Methods & Payout Configuration"
        subtitle="Configure dynamic withdrawal payment methods, limits, fees, and required user input fields."
        actions={
          <Button onClick={handleOpenCreate} className="bg-brand-gradient font-semibold">
            <Plus className="h-4 w-4 mr-1.5" /> Add Payment Method
          </Button>
        }
      />

      {/* Info Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-foreground">Dynamic Firestore-backed Payment System</p>
            <p className="text-muted-foreground leading-relaxed">
              All active payment methods listed below load dynamically in the User Dashboard. Creating or editing payment methods updates Firestore document collection <code className="bg-background/80 px-1 py-0.5 rounded border border-border">payment_methods</code> without requiring frontend code changes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Methods Table */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" /> Supported Payment Methods
            </CardTitle>
            <CardDescription>
              Enable/disable options, set custom min/max withdrawal caps, and manage dynamic user input forms.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {methods.length} Total Configured
          </Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground">No payment methods found.</p>
              <Button onClick={handleOpenCreate} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add your first method
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold w-12 text-center">Order</th>
                    <th className="px-4 py-3 font-semibold">Method Name</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Limits (Min - Max)</th>
                    <th className="px-4 py-3 font-semibold">Withdrawal Fee</th>
                    <th className="px-4 py-3 font-semibold">Processing Time</th>
                    <th className="px-4 py-3 font-semibold">Form Inputs</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((m, index) => (
                    <tr
                      key={m.id}
                      className={`border-b border-border last:border-0 hover:bg-secondary/20 transition-colors ${
                        !m.enabled ? 'opacity-60 bg-muted/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMoveOrder(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-mono text-xs text-muted-foreground font-bold">{index + 1}</span>
                          <button
                            onClick={() => handleMoveOrder(index, 'down')}
                            disabled={index === methods.length - 1}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{m.name}</p>
                          <code className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                            {m.id}
                          </code>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={m.enabled}
                            onCheckedChange={() => handleToggleStatus(m)}
                          />
                          <Badge variant={m.enabled ? 'default' : 'secondary'} className="text-[10px]">
                            {m.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs">
                        ₹{formatINR(m.minimumWithdraw)} - ₹{formatINR(m.maximumWithdraw)}
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {m.withdrawFee === 0 ? (
                          <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                            FREE (₹0)
                          </Badge>
                        ) : (
                          <span className="font-medium text-amber-500">
                            {m.withdrawFee}
                            {m.withdrawFeeType === 'percentage' ? '%' : ' ₹'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        {m.processingTime || 'Instant'}
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center gap-1 bg-secondary/80 px-2 py-0.5 rounded-full font-medium">
                          <ListPlus className="h-3 w-3 text-primary" /> {m.requiredFields?.length || 0} Fields
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(m)}
                            className="h-8 px-2"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirmId(m.id)}
                            className="h-8 px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit / Create Payment Method Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              {editingMethod?.id && methods.some((m) => m.id === editingMethod.id)
                ? `Edit ${editingMethod.name}`
                : 'Add New Payment Method'}
            </DialogTitle>
            <DialogDescription>
              Configure withdrawal thresholds, fees, display text, and dynamic input fields.
            </DialogDescription>
          </DialogHeader>

          {editingMethod && (
            <div className="space-y-6 py-2">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Payment Method Name *</Label>
                  <Input
                    placeholder="e.g. UPI, Binance Pay, USDT (TRC20)"
                    value={editingMethod.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingMethod((prev) =>
                        prev
                          ? {
                              ...prev,
                              name,
                              id: prev.id || name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                            }
                          : null
                      );
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Document ID / Slug</Label>
                  <Input
                    placeholder="e.g. upi, binance_pay, usdt_trc20"
                    value={editingMethod.id}
                    onChange={(e) =>
                      setEditingMethod((prev) => (prev ? { ...prev, id: e.target.value } : null))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-secondary/20">
                <div>
                  <p className="font-semibold text-sm">Enabled for Users</p>
                  <p className="text-xs text-muted-foreground">
                    When active, users will see this payment method option in their Withdraw Modal.
                  </p>
                </div>
                <Switch
                  checked={editingMethod.enabled}
                  onCheckedChange={(checked) =>
                    setEditingMethod((prev) => (prev ? { ...prev, enabled: checked } : null))
                  }
                />
              </div>

              {/* Limits & Fees */}
              <div className="space-y-3 rounded-xl border border-border p-4">
                <h3 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
                  <DollarSign className="h-4 w-4" /> Withdrawal Limits & Fee Configuration
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Minimum (₹)</Label>
                    <Input
                      type="number"
                      value={editingMethod.minimumWithdraw}
                      onChange={(e) =>
                        setEditingMethod((prev) =>
                          prev ? { ...prev, minimumWithdraw: Number(e.target.value) } : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Maximum (₹)</Label>
                    <Input
                      type="number"
                      value={editingMethod.maximumWithdraw}
                      onChange={(e) =>
                        setEditingMethod((prev) =>
                          prev ? { ...prev, maximumWithdraw: Number(e.target.value) } : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Withdraw Fee</Label>
                    <Input
                      type="number"
                      value={editingMethod.withdrawFee}
                      onChange={(e) =>
                        setEditingMethod((prev) =>
                          prev ? { ...prev, withdrawFee: Number(e.target.value) } : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Fee Type</Label>
                    <Select
                      value={editingMethod.withdrawFeeType}
                      onValueChange={(val: 'fixed' | 'percentage') =>
                        setEditingMethod((prev) =>
                          prev ? { ...prev, withdrawFeeType: val } : null
                        )
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Processing Time & Instructions */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Estimated Processing Time</Label>
                  <Input
                    placeholder="e.g. Instant, 1 - 2 Hours, 24 - 48 Hours"
                    value={editingMethod.processingTime}
                    onChange={(e) =>
                      setEditingMethod((prev) =>
                        prev ? { ...prev, processingTime: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Instructions for User</Label>
                  <Textarea
                    placeholder="Enter explicit instructions or warnings shown to the user when selecting this payment method..."
                    value={editingMethod.instructions}
                    rows={2}
                    onChange={(e) =>
                      setEditingMethod((prev) =>
                        prev ? { ...prev, instructions: e.target.value } : null
                      )
                    }
                  />
                </div>
              </div>

              {/* Dynamic Required Fields Builder */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
                      <ListPlus className="h-4 w-4" /> Dynamic User Required Form Fields
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      The user form automatically renders input fields created here.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addRequiredField}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingMethod.requiredFields.map((field, fIdx) => (
                    <div
                      key={fIdx}
                      className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl border border-border bg-secondary/10"
                    >
                      <div className="col-span-4 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Field Label</Label>
                        <Input
                          value={field.label}
                          placeholder="e.g. Account Number"
                          className="h-8 text-xs"
                          onChange={(e) => updateRequiredField(fIdx, { label: e.target.value })}
                        />
                      </div>

                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Key Slug</Label>
                        <Input
                          value={field.key}
                          placeholder="accountNumber"
                          className="h-8 text-xs font-mono"
                          onChange={(e) => updateRequiredField(fIdx, { key: e.target.value })}
                        />
                      </div>

                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Placeholder</Label>
                        <Input
                          value={field.placeholder || ''}
                          placeholder="Enter details"
                          className="h-8 text-xs"
                          onChange={(e) =>
                            updateRequiredField(fIdx, { placeholder: e.target.value })
                          }
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1 pt-4">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(v) => updateRequiredField(fIdx, { required: v })}
                          title="Is Required?"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => removeRequiredField(fIdx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveMethod}
              disabled={saving}
              className="bg-brand-gradient font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Payment Method
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this payment method? Users will no longer be able to select it for withdrawals.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
