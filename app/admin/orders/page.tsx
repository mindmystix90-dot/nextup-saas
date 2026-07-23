'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Receipt,
  FileText,
  User,
  ShieldCheck,
  IndianRupee,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { useAuth } from '@/hooks/use-auth';
import { fetchAllOrders, approveManualPayment, rejectManualPayment } from '@/services/commerce.service';
import type { Order } from '@/types';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject dialog
  const [rejectOrder, setRejectOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAllOrders();
      setOrders(list);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleApprove = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await approveManualPayment(orderId, user?.uid || 'admin');
      toast.success(`Payment approved! Membership activated for Order #${orderId}`);
      await loadOrders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve payment.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectOrder) return;
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setProcessingId(rejectOrder.id);
    try {
      await rejectManualPayment(rejectOrder.id, rejectReason.trim(), user?.uid || 'admin');
      toast.info(`Payment rejected for Order #${rejectOrder.id}`);
      setRejectOrder(null);
      setRejectReason('');
      await loadOrders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject payment.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.paymentProofRef && o.paymentProofRef.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ShoppingBag}
        title="Orders & Manual Payment Approvals"
        subtitle="Verify student payment receipts, approve memberships, and manage order history."
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Pending Approval</p>
              <p className="mt-2 font-display text-2xl font-bold text-warning">{pendingCount}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Clock className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Approved Orders</p>
              <p className="mt-2 font-display text-2xl font-bold text-success">{completedCount}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total Revenue Approved</p>
              <p className="mt-2 font-display text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IndianRupee className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total Submissions</p>
              <p className="mt-2 font-display text-2xl font-bold">{orders.length}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <FileText className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="card-premium">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Orders List ({filteredOrders.length})</CardTitle>
            <CardDescription>Review manual payment reference submissions and activate access.</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search email, ID, or UTR..."
                className="pl-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl w-full sm:w-auto">
              {(['all', 'pending', 'completed', 'failed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === st ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <ShoppingBag className="mx-auto h-10 w-10 opacity-30" />
              <p className="font-semibold text-sm">No orders matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Order / User</th>
                    <th className="px-4 py-3 font-semibold">Package / Item</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Payment Proof (UTR)</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-primary">{o.id}</span>
                        <p className="font-medium text-foreground">{o.userName}</p>
                        <p className="text-xs text-muted-foreground">{o.userEmail}</p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold">{o.packageName}</p>
                        {o.couponCode && <Badge variant="outline" className="text-[10px] text-success">Coupon: {o.couponCode}</Badge>}
                      </td>

                      <td className="px-4 py-3 font-bold text-foreground">
                        ₹{o.totalAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded border border-border">
                            {o.paymentProofRef || 'No Ref Provided'}
                          </span>
                          <p className="text-[11px] text-muted-foreground capitalize">Method: {o.paymentMethod || 'Manual'}</p>
                          {o.paymentProofNotes && <p className="text-[10px] text-muted-foreground italic truncate max-w-[180px]">&quot;{o.paymentProofNotes}&quot;</p>}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {o.status === 'completed' ? (
                          <Badge className="bg-success/10 text-success border-transparent">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                          </Badge>
                        ) : o.status === 'pending' ? (
                          <Badge className="bg-warning/10 text-warning border-transparent">
                            <Clock className="mr-1 h-3 w-3" /> Pending Review
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" /> Rejected
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {o.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90 text-white font-semibold h-8 text-xs"
                              disabled={processingId === o.id}
                              onClick={() => handleApprove(o.id)}
                            >
                              {processingId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="mr-1 h-3.5 w-3.5" />} Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs"
                              disabled={processingId === o.id}
                              onClick={() => setRejectOrder(o)}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">
                            {o.approvedAt ? `Approved ${new Date(o.approvedAt).toLocaleDateString('en-IN')}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      <Dialog open={!!rejectOrder} onOpenChange={() => setRejectOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payment Submission</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting payment reference #{rejectOrder?.paymentProofRef || rejectOrder?.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold">Rejection Reason *</label>
            <Textarea
              placeholder="e.g. UTR number not found in bank statement, amount mismatch..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOrder(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={processingId === rejectOrder?.id}>
              {processingId === rejectOrder?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
