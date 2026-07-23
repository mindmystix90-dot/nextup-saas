'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchInvoiceById } from '@/services/commerce.service';
import type { Invoice } from '@/types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params?.id as string;
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;
    (async () => {
      setLoading(true);
      try {
        const inv = await fetchInvoiceById(invoiceId);
        setInvoice(inv);
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="font-display text-2xl font-bold">Invoice Not Found</h2>
          <p className="text-sm text-muted-foreground">The requested invoice document could not be located.</p>
          <Button asChild className="bg-brand-gradient">
            <Link href="/dashboard/orders">Return to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-12 px-4 print:p-0 print:bg-white">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-xs font-semibold"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Orders
          </Button>

          <Button
            onClick={() => window.print()}
            className="bg-brand-gradient font-bold text-xs shadow-premium"
          >
            <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
          </Button>
        </div>

        {/* Printable Tax Invoice Card */}
        <Card className="card-premium bg-white text-slate-900 border-border p-8 shadow-2xl rounded-3xl print:shadow-none print:border-none print:p-0">
          <CardContent className="p-0 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm">
                    N
                  </span>
                  <span className="font-display font-bold text-xl text-slate-900">NextUp SaaS</span>
                </div>
                <p className="text-xs text-slate-500">NextUp Learning Platform Inc.</p>
                <p className="text-xs text-slate-500">Tax ID / GSTIN: 27AAAAA0000A1Z5</p>
                <p className="text-xs text-slate-500">support@nextupsaas.com</p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold mb-1">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> TAX INVOICE
                </Badge>
                <p className="font-mono text-sm font-bold text-slate-900">{invoice.id}</p>
                <p className="text-xs text-slate-500">
                  Date:{' '}
                  {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Bill To & Order References */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Billed To</p>
                <p className="font-bold text-slate-900 text-sm mt-1">{invoice.userName}</p>
                <p className="text-slate-600">{invoice.userEmail}</p>
                <p className="text-slate-500 mt-1">Customer UID: {invoice.uid}</p>
              </div>

              <div className="space-y-1 text-right">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Reference IDs</p>
                <p className="text-slate-700 font-mono mt-1">Order ID: <strong className="text-slate-900">{invoice.orderId}</strong></p>
                <p className="text-slate-700 font-mono">Payment ID: <strong className="text-slate-900">{invoice.paymentId}</strong></p>
                <p className="text-emerald-700 font-semibold mt-1">Payment Status: PAID</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Description / Package</th>
                    <th className="py-3 px-2 text-right">Base Amount</th>
                    <th className="py-3 px-2 text-right">GST (18%)</th>
                    <th className="py-3 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  <tr>
                    <td className="py-4 px-2">
                      <p className="font-bold text-slate-900 text-sm">{invoice.itemName}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Full package course access + platform privileges</p>
                    </td>
                    <td className="py-4 px-2 text-right font-mono">₹{invoice.amount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-2 text-right font-mono">₹{invoice.taxAmount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-2 text-right font-mono font-bold text-slate-900">
                      ₹{invoice.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-slate-900">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Computer generated tax invoice. No signature required.</span>
              </div>

              <div className="text-right space-y-1">
                <p className="text-xs text-slate-500 font-semibold">Total Paid Amount</p>
                <p className="font-display text-2xl font-bold text-slate-900">
                  ₹{invoice.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
