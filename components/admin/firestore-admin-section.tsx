'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchAdminCollectionRecords, type AdminCollectionRecord } from '@/services/admin-foundation.service';
import { toast } from 'sonner';

interface FirestoreAdminSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  collectionName: string;
  emptyTitle: string;
  emptyDescription: string;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function FirestoreAdminSection({ icon: Icon, title, subtitle, collectionName, emptyTitle, emptyDescription }: FirestoreAdminSectionProps) {
  const [records, setRecords] = useState<AdminCollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchAdminCollectionRecords(collectionName)
      .then((data) => {
        if (mounted) setRecords(data);
      })
      .catch(() => toast.error(`Failed to load ${title.toLowerCase()}`))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [collectionName, title]);

  return (
    <div className="space-y-6">
      <AdminPageHeader icon={Icon} title={title} subtitle={subtitle} />

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">{title} ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium text-foreground">{emptyTitle}</p>
              <p className="mt-1 text-sm">{emptyDescription}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{record.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{record.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.subtitle || '—'}</TableCell>
                    <TableCell>{record.status ? <StatusBadge status={record.status} /> : '—'}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{formatDate(record.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
