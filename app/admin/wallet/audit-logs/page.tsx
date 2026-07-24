'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { fetchAuditLogs } from '@/services/audit-log.service';
import type { AdminAuditLog } from '@/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAuditLogs(150);
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q) ||
      log.adminUid.toLowerCase().includes(q) ||
      log.targetCollection.toLowerCase().includes(q) ||
      log.targetDocument.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <AdminPageHeader
        title="Admin Audit Trail Logs"
        subtitle="Immutable records of every financial and administrative action taken across the platform."
        actions={
          <Link href="/admin/wallet">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Wallet
            </Button>
          </Link>
        }
      />

      <Card className="card-premium">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> admin_audit_logs Records
            </CardTitle>
            <CardDescription>
              Every approval, rejection, setting update, or manual credit/debit is automatically logged here.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search action, admin, collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <FileText className="h-10 w-10 mx-auto opacity-30" />
              <p className="font-medium">No audit log entries recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <div
                    key={log.id}
                    className="p-4 bg-card hover:bg-secondary/20 border border-border rounded-xl transition-all"
                  >
                    <div
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold text-xs bg-primary/10 text-primary border-primary/20">
                            {log.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            Target: {log.targetCollection}/{log.targetDocument.slice(0, 10)}…
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground" /> {log.adminName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />{' '}
                            {new Date(log.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-primary">
                        <span>{isExpanded ? 'Hide Details' : 'View Values'}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="bg-muted/50 p-3 rounded-lg overflow-x-auto">
                          <p className="font-bold text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">
                            Old Values
                          </p>
                          <pre className="text-foreground font-mono leading-relaxed">
                            {JSON.stringify(log.oldValues || {}, null, 2)}
                          </pre>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg overflow-x-auto">
                          <p className="font-bold text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">
                            New Values
                          </p>
                          <pre className="text-foreground font-mono leading-relaxed">
                            {JSON.stringify(log.newValues || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
