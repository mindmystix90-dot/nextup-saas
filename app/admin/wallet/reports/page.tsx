'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Loader2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { fetchAllWithdrawals, fetchAllTransactions, formatINR } from '@/services/wallet.service';
import { fetchPlatformFinance } from '@/services/platform-finance.service';
import type { Withdrawal, WalletTransaction, PlatformFinance } from '@/types';
import { toast } from 'sonner';

type PeriodType = 'daily' | 'weekly' | 'monthly';

export default function FinancialReportsPage() {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [finance, setFinance] = useState<PlatformFinance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [wList, tList, fData] = await Promise.all([
          fetchAllWithdrawals(),
          fetchAllTransactions(),
          fetchPlatformFinance(),
        ]);
        setWithdrawals(wList);
        setTransactions(tList);
        setFinance(fData);
      } catch {
        toast.error('Failed to load financial data for reports');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter dataset based on selected period
  const filteredWithdrawals = withdrawals.filter((w) => {
    const wDate = new Date(w.requestedAt);
    const now = new Date();
    if (period === 'daily') {
      return wDate.toDateString() === now.toDateString();
    }
    if (period === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return wDate >= oneWeekAgo;
    }
    if (period === 'monthly') {
      return wDate.getMonth() === now.getMonth() && wDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalRequested = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalPaid = filteredWithdrawals
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + w.amount, 0);
  const totalFees = filteredWithdrawals
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + (w.fee || 0), 0);
  const totalApproved = filteredWithdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);
  const totalPending = filteredWithdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  // Export CSV Handler
  function exportCSV() {
    if (filteredWithdrawals.length === 0) {
      toast.error('No records to export in this period.');
      return;
    }

    const headers = [
      'ID',
      'User Name',
      'User Email',
      'Amount',
      'Fee',
      'Net Amount',
      'Method',
      'Status',
      'Requested At',
      'Paid At',
      'Transaction ID',
      'Reference Number',
    ];

    const rows = filteredWithdrawals.map((w) => [
      w.id,
      `"${w.userName}"`,
      `"${w.userEmail}"`,
      w.amount,
      w.fee || 0,
      w.netAmount || w.amount - (w.fee || 0),
      w.methodName || w.method,
      w.status,
      w.requestedAt,
      w.paidAt || w.processedAt || '',
      w.transactionId || '',
      w.referenceNumber || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${period} CSV report successfully!`);
  }

  // Export Excel Handler (CSV extension formatted for Excel)
  function exportExcel() {
    exportCSV();
  }

  // Export PDF / Print Handler
  function exportPDF() {
    window.print();
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 print:max-w-none print:p-0">
      <div className="print:hidden">
        <AdminPageHeader
          title="Financial Reports & Analytics"
          subtitle="Generate daily, weekly, or monthly financial statements and export payout data to CSV, Excel, or PDF."
          actions={
            <div className="flex items-center gap-2">
              <Link href="/admin/wallet">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Wallet
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1.5 text-success" /> Export CSV
              </Button>

              <Button size="sm" variant="outline" onClick={exportExcel}>
                <Download className="h-4 w-4 mr-1.5 text-primary" /> Export Excel
              </Button>

              <Button size="sm" className="bg-brand-gradient text-white" onClick={exportPDF}>
                <Printer className="h-4 w-4 mr-1.5" /> Print / Export PDF
              </Button>
            </div>
          }
        />
      </div>

      {/* Period Selection Tabs */}
      <div className="flex items-center gap-2 print:hidden">
        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            className={`capitalize font-semibold ${period === p ? 'bg-brand-gradient text-white' : ''}`}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" /> {p} Report
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardHeader className="p-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Requested ({period})
            </CardTitle>
            <p className="text-2xl font-bold font-mono text-foreground mt-1">₹{formatINR(totalRequested)}</p>
          </CardHeader>
        </Card>

        <Card className="card-premium">
          <CardHeader className="p-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Paid Out ({period})
            </CardTitle>
            <p className="text-2xl font-bold font-mono text-success mt-1">₹{formatINR(totalPaid)}</p>
          </CardHeader>
        </Card>

        <Card className="card-premium">
          <CardHeader className="p-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fees Collected ({period})
            </CardTitle>
            <p className="text-2xl font-bold font-mono text-primary mt-1">₹{formatINR(totalFees)}</p>
          </CardHeader>
        </Card>

        <Card className="card-premium">
          <CardHeader className="p-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Platform Reserve Balance
            </CardTitle>
            <p className="text-2xl font-bold font-mono text-warning mt-1">
              ₹{formatINR(finance?.reservedBalance || 0)}
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Report Table */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="capitalize">{period} Financial Statement</span>
            <Badge variant="outline" className="font-mono text-xs">
              {filteredWithdrawals.length} Records Found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">No withdrawal entries found for the selected {period} period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2.5 font-semibold">Date</th>
                    <th className="py-2.5 font-semibold">User</th>
                    <th className="py-2.5 font-semibold">Amount</th>
                    <th className="py-2.5 font-semibold">Fee</th>
                    <th className="py-2.5 font-semibold">Net Payout</th>
                    <th className="py-2.5 font-semibold">Method</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Ref Number</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-border/50 text-xs">
                      <td className="py-2.5 font-mono text-muted-foreground">
                        {new Date(w.requestedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5 font-medium">{w.userName}</td>
                      <td className="py-2.5 font-mono font-bold">₹{formatINR(w.amount)}</td>
                      <td className="py-2.5 font-mono text-muted-foreground">₹{formatINR(w.fee || 0)}</td>
                      <td className="py-2.5 font-mono font-bold text-success">
                        ₹{formatINR(w.netAmount || w.amount - (w.fee || 0))}
                      </td>
                      <td className="py-2.5 capitalize">{w.methodName || w.method}</td>
                      <td className="py-2.5">
                        <Badge
                          variant="outline"
                          className={`capitalize text-[10px] ${
                            w.status === 'paid'
                              ? 'bg-success/10 text-success border-success/20'
                              : w.status === 'approved'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : w.status === 'pending'
                              ? 'bg-warning/10 text-warning border-warning/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                          }`}
                        >
                          {w.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-mono text-muted-foreground">
                        {w.referenceNumber || w.transactionId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
