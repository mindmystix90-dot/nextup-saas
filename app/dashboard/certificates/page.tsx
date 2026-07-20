'use client';

import { useState } from 'react';
import { Download, ShieldCheck, Search, Award, CheckCircle2, X } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getIcon } from '@/lib/icons';
import { certificates } from '@/lib/data/certificates';
import type { Certificate } from '@/types';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const [query, setQuery] = useState('');
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<Certificate | null | 'not-found'>(null);
  const [open, setOpen] = useState(false);

  const filtered = certificates.filter(
    (c) =>
      c.courseName.toLowerCase().includes(query.toLowerCase()) ||
      c.recipientName.toLowerCase().includes(query.toLowerCase())
  );

  function handleDownload(c: Certificate) {
    toast.success(`Downloading "${c.courseName}" certificate…`);
  }

  function handleVerify() {
    const found = certificates.find((c) => c.id.toLowerCase() === verifyId.trim().toLowerCase());
    setVerifyResult(found || 'not-found');
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <Award className="h-5 w-5" />
          </span>
          Certificates
        </h1>
        <p className="mt-2 text-muted-foreground">View, download, and verify your earned certificates.</p>
      </div>

      {/* Verify */}
      <Card className="card-premium mb-6">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verify a certificate</label>
            <Input
              placeholder="Enter certificate ID (e.g. NX-2024-08AF31)"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button onClick={handleVerify} className="bg-brand-gradient font-semibold">
            <ShieldCheck className="mr-2 h-4 w-4" /> Verify
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your certificates…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="card-premium">
          <CardContent className="py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Award className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">No certificates found</h2>
            <p className="mt-1 text-sm text-muted-foreground">Complete a course to earn your first certificate.</p>
            <Button asChild className="mt-5 bg-brand-gradient font-semibold">
              <a href="/courses">Browse courses</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const Icon = getIcon(c.icon);
            return (
              <Card key={c.id} className="card-premium card-premium-hover overflow-hidden">
                <div className={`relative h-32 bg-gradient-to-br ${c.gradient} p-5 text-white`}>
                  <div className="absolute inset-0 bg-slate-950/10" />
                  <div className="relative flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge className="bg-white/20 text-white border-transparent">Issued</Badge>
                  </div>
                  <p className="relative mt-3 text-xs font-medium text-white/80">{c.id}</p>
                </div>
                <CardContent className="p-5">
                  <p className="font-display text-base font-semibold leading-tight">{c.courseName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Issued to {c.recipientName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.issueDate} · Grade: {c.grade}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 font-semibold" onClick={() => handleDownload(c)}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="font-semibold"
                      onClick={() => {
                        setVerifyId(c.id);
                        setVerifyResult(c);
                        setOpen(true);
                      }}
                    >
                      <ShieldCheck className="h-4 w-4" /> Verify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Verify dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Certificate Verification
            </DialogTitle>
          </DialogHeader>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {verifyResult === null ? (
            <p className="text-sm text-muted-foreground">Enter a certificate ID to verify.</p>
          ) : verifyResult === 'not-found' ? (
            <div className="text-center py-4">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <X className="h-6 w-6" />
              </span>
              <p className="mt-3 font-semibold">Certificate not found</p>
              <p className="mt-1 text-sm text-muted-foreground">No certificate matches ID "{verifyId}".</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-semibold">Valid certificate</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Recipient</span><span className="font-medium">{verifyResult.recipientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Course</span><span className="font-medium text-right">{verifyResult.courseName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Issue date</span><span className="font-medium">{verifyResult.issueDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Certificate ID</span><span className="font-mono text-xs">{verifyResult.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Grade</span><span className="font-medium">{verifyResult.grade}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
