'use client';

import { useMemo, useState } from 'react';
import { Network, Search, Pencil, Pause, Play, Ban } from 'lucide-react';
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
import { adminAffiliateStats, adminAffiliates } from '@/lib/data/admin';
import { getIcon } from '@/lib/icons';
import { toast } from 'sonner';

export default function AdminAffiliatePage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    return adminAffiliates.filter((a) => {
      const matchQuery =
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.email.toLowerCase().includes(query.toLowerCase()) ||
        a.id.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === 'all' || a.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Network}
        title="Affiliate program"
        subtitle="Manage affiliates, review payouts and track referrals."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adminAffiliateStats.map((s) => {
          const Icon = getIcon(s.icon);
          return (
            <Card key={s.label} className="card-premium">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs text-muted-foreground">{s.delta}</span>
                </div>
                <p className="mt-4 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All affiliates ({filtered.length})</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, ID…"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                <TableHead className="text-right">Earned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="text-right">{a.referrals}</TableCell>
                  <TableCell className="text-right">{a.joined}</TableCell>
                  <TableCell className="text-right font-medium">{a.earned}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Edit ${a.name} (demo)`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {a.status === 'Active' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-warning hover:text-warning" onClick={() => toast.info(`Paused ${a.name} (demo)`)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success" onClick={() => toast.success(`Resumed ${a.name} (demo)`)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => toast.error(`Banned ${a.name} (demo)`)}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No affiliates match your filters.
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
