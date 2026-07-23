'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, Search, Eye, ShieldCheck, Ban, Plus, Loader2 } from 'lucide-react';
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
import { fetchCertificates, updateCertificateStatus } from '@/services/certificates.service';
import type { Certificate } from '@/types';
import { getIcon } from '@/lib/icons';
import { toast } from 'sonner';

export default function AdminCertificatesPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Certificate | null>(null);

  async function loadCertificates() {
    setLoading(true);
    try {
      const data = await fetchCertificates();
      setCertificatesList(data);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCertificates(); }, []);

  const filtered = useMemo(() => {
    return certificatesList.filter((c) => {
      const matchQuery =
        c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.recipientName.toLowerCase().includes(query.toLowerCase()) ||
        c.courseName.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === 'all' || c.status === status;
      return matchQuery && matchStatus;
    });
  }, [certificatesList, query, status]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Award}
        title="Certificates"
        subtitle="Issue, verify and revoke student certificates."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={() => toast.info('Issue certificate (demo)')}>
            <Plus className="h-4 w-4 mr-1" /> Issue certificate
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="space-y-4">
            <CardTitle className="text-lg">All certificates ({filtered.length})</CardTitle>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ID, recipient, course…"
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.recipientName}</TableCell>
                    <TableCell>
                      <p className="text-sm">{c.courseName}</p>
                      <p className="text-xs text-muted-foreground">{c.instructor}</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{c.grade}</Badge></TableCell>
                    <TableCell><StatusBadge status={c.status || 'issued'} /></TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreview(c)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success hover:text-success"
                          onClick={() => toast.success(`${c.id} verified (demo)`)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => toast.error(`${c.id} revoked (demo)`)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No certificates match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg">Certificate preview</CardTitle>
          </CardHeader>
          <CardContent>
            {preview ? (
              <CertificatePreview cert={preview} />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                Select a certificate to preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CertificatePreview({ cert }: { cert: Certificate }) {
  const Icon = getIcon(cert.icon);
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${cert.gradient} p-6 text-white shadow-glow`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Award className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">NextUp Certificate</p>
        </div>
        <Icon className="h-6 w-6 opacity-80" />
      </div>
      <p className="mt-6 text-xs uppercase tracking-wider opacity-80">Certificate of completion</p>
      <p className="mt-1 font-display text-xl font-bold leading-tight">{cert.courseName}</p>
      <p className="mt-4 text-xs opacity-80">Awarded to</p>
      <p className="font-display text-lg font-semibold">{cert.recipientName}</p>
      <div className="mt-6 flex items-end justify-between text-xs">
        <div>
          <p className="opacity-80">Instructor</p>
          <p className="font-medium">{cert.instructor}</p>
        </div>
        <div className="text-right">
          <p className="opacity-80">Issued</p>
          <p className="font-medium">{cert.issueDate}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/30 pt-3 text-xs">
        <span className="font-mono opacity-90">{cert.id}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 font-semibold">Grade {cert.grade}</span>
      </div>
    </div>
  );
}
