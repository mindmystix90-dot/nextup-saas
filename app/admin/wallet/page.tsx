'use client';

import { useMemo, useState } from 'react';
import { Wallet, Search, ArrowUpRight, ArrowDownLeft, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { adminWalletTransactions } from '@/lib/data/admin';
import { toast } from 'sonner';

export default function AdminWalletPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  const filtered = useMemo(() => {
    return adminWalletTransactions.filter((t) => {
      const matchQuery =
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.user.toLowerCase().includes(query.toLowerCase()) ||
        t.label.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === 'all' || t.status === status;
      const matchType = type === 'all' || t.type === type;
      return matchQuery && matchStatus && matchType;
    });
  }, [query, status, type]);

  const totalIn = adminWalletTransactions.filter((t) => t.type === 'in').length;
  const totalOut = adminWalletTransactions.filter((t) => t.type === 'out').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Wallet}
        title="Wallet"
        subtitle="Track platform-wide transactions, payouts and refunds."
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success('Export started (demo)')}>
            <Download className="h-4 w-4 mr-1" /> Export ledger
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Gross balance</p>
          <p className="font-display text-xl font-bold">₹4,92,499</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Credits</p>
          <p className="font-display text-xl font-bold text-success">{totalIn}</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Debits</p>
          <p className="font-display text-xl font-bold text-destructive">{totalOut}</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="font-display text-xl font-bold text-warning">
            {adminWalletTransactions.filter((t) => t.status === 'Pending').length}
          </p>
        </CardContent></Card>
      </div>

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All transactions ({filtered.length})</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID, user, label…"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="in">Credit</SelectItem>
                <SelectItem value="out">Debit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.user}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${t.type === 'in' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'in' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                      {t.type === 'in' ? 'Credit' : 'Debit'}
                    </span>
                  </TableCell>
                  <TableCell>{t.label}</TableCell>
                  <TableCell><Badge variant="outline">{t.method}</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${t.type === 'in' ? 'text-success' : 'text-destructive'}`}>{t.amount}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-right text-muted-foreground">{t.date}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No transactions match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
