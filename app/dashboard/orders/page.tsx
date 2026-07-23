'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  CreditCard,
  Receipt,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { fetchUserOrders, fetchUserPayments, fetchUserInvoices } from '@/services/commerce.service';
import type { Order, Payment, Invoice } from '@/types';

export default function OrdersPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [o, p, i] = await Promise.all([
          fetchUserOrders(user.uid),
          fetchUserPayments(user.uid),
          fetchUserInvoices(user.uid),
        ]);
        setOrders(o);
        setPayments(p);
        setInvoices(i);
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
              <ShoppingBag className="h-5 w-5" />
            </span>
            Orders & Purchases
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your order history, payment transactions, and downloadable invoices.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="card-premium">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold">Total Orders</p>
              <p className="mt-2 font-display text-2xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold">Payments Completed</p>
              <p className="mt-2 font-display text-2xl font-bold text-success">{payments.length}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold">Invoices Generated</p>
              <p className="mt-2 font-display text-2xl font-bold text-primary">{invoices.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Orders, Payments, Invoices */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 rounded-2xl p-1">
            <TabsTrigger value="orders" className="text-xs font-semibold">
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs font-semibold">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Payments ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs font-semibold">
              <Receipt className="mr-1.5 h-3.5 w-3.5" /> Invoices ({invoices.length})
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <Card className="card-premium py-12 text-center">
                <CardContent className="space-y-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                    <ShoppingBag className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold">No orders found</p>
                  <p className="text-xs text-muted-foreground">You haven&apos;t purchased any packages or courses yet.</p>
                  <Button asChild size="sm" className="bg-brand-gradient font-semibold mt-2">
                    <Link href="/pricing">Browse Packages</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((o) => (
                <Card key={o.id} className="card-premium">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary">{o.id}</span>
                        {o.status === 'completed' ? (
                          <Badge className="bg-success/10 text-success border-transparent">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                          </Badge>
                        ) : o.status === 'pending' ? (
                          <Badge className="bg-warning/10 text-warning border-transparent">
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" /> Failed
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-base">{o.packageName}</p>
                      <p className="text-xs text-muted-foreground">
                        Date: {new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                      <div className="text-right">
                        <p className="font-display text-lg font-bold">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                        {o.discountAmount ? <p className="text-[10px] text-success">Saved ₹{o.discountAmount}</p> : null}
                      </div>

                      {o.invoiceId && (
                        <Button asChild size="sm" variant="outline" className="font-semibold text-xs">
                          <Link href={`/dashboard/invoices/${o.invoiceId}`}>
                            <Receipt className="mr-1.5 h-3.5 w-3.5" /> Invoice
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6 space-y-4">
            {payments.length === 0 ? (
              <Card className="card-premium py-12 text-center">
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold">No payment records found</p>
                  <p className="text-xs text-muted-foreground">Successful transactions will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              payments.map((p) => (
                <Card key={p.id} className="card-premium">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-success">{p.id}</span>
                        <Badge variant="secondary" className="uppercase text-[10px]">{p.method}</Badge>
                      </div>
                      <p className="font-semibold text-sm">{p.itemName}</p>
                      <p className="text-xs text-muted-foreground">Date: {p.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-success">₹{p.amount.toLocaleString('en-IN')}</p>
                      <span className="text-[11px] text-muted-foreground capitalize">Status: {p.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-6 space-y-4">
            {invoices.length === 0 ? (
              <Card className="card-premium py-12 text-center">
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold">No invoices generated yet</p>
                  <p className="text-xs text-muted-foreground">Invoices are automatically created upon completed purchases.</p>
                </CardContent>
              </Card>
            ) : (
              invoices.map((inv) => (
                <Card key={inv.id} className="card-premium">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{inv.id}</span>
                        <Badge className="bg-success/10 text-success border-transparent">Paid</Badge>
                      </div>
                      <p className="font-semibold text-sm">{inv.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        Issued on: {new Date(inv.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-display text-lg font-bold">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-muted-foreground">Includes 18% GST</p>
                      </div>

                      <Button asChild size="sm" className="bg-brand-gradient font-semibold text-xs">
                        <Link href={`/dashboard/invoices/${inv.id}`}>
                          <Download className="mr-1.5 h-3.5 w-3.5" /> View / Download
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
