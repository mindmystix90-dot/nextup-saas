'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Type,
  Link2,
  Loader2,
  Building2,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  fetchAllSubmissions,
  processSubmissionApproval,
} from '@/services/microtasks.service';
import { formatINR } from '@/services/wallet.service';
import type { MicrotaskSubmission } from '@/types';

export default function AdminSubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<MicrotaskSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Rejection Modal
  const [rejectingSub, setRejectingSub] = useState<MicrotaskSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Preview Proof Modal
  const [viewingSub, setViewingSub] = useState<MicrotaskSubmission | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await fetchAllSubmissions();
      setSubmissions(list);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (sub: MicrotaskSubmission) => {
    if (!confirm(`Approve task "${sub.taskTitle}" for ${sub.userName}? ₹${sub.reward} will be credited to their wallet.`)) {
      return;
    }
    setProcessingId(sub.id);
    try {
      await processSubmissionApproval(sub.id, 'approve');
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to approve submission');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingSub) return;
    setProcessingId(rejectingSub.id);
    try {
      await processSubmissionApproval(rejectingSub.id, 'reject', rejectionReason);
      setRejectingSub(null);
      setRejectionReason('');
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to reject submission');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = sub.taskTitle.toLowerCase().includes(q);
      const matchUser = (sub.userName || '').toLowerCase().includes(q) || (sub.userEmail || '').toLowerCase().includes(q);
      const matchProvider = sub.providerName.toLowerCase().includes(q);
      if (!matchTitle && !matchUser && !matchProvider) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button asChild variant="ghost" size="sm" className="p-0 text-muted-foreground hover:text-foreground">
              <Link href="/admin/microtasks">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Microtask Hub
              </Link>
            </Button>
            <h1 className="font-display text-2xl font-bold tracking-tight">User Submissions & Proof Approvals</h1>
            <p className="text-xs text-muted-foreground">
              Verify proof text, URLs, and screenshots submitted by users. Approved tasks immediately credit wallet balances.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 card-premium flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user email, task name, provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background text-xs">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses ({submissions.length})</SelectItem>
              <SelectItem value="submitted">Submitted / In Review</SelectItem>
              <SelectItem value="approved">Approved & Paid</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Submissions Table */}
        <Card className="card-premium p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Date</TableHead>
                <TableHead>Task & Provider</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Proof Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No submissions found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm">{sub.userName}</p>
                        <p className="text-xs text-muted-foreground">{sub.userEmail}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{sub.taskTitle}</p>
                        <Badge variant="outline" className="text-[10px]">
                          <Building2 className="mr-1 h-3 w-3 text-primary" /> {sub.providerName}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{formatINR(sub.reward)}
                    </TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingSub(sub)}
                        className="text-xs"
                      >
                        <FileCheck2 className="mr-1.5 h-3.5 w-3.5 text-primary" /> Inspect Proof
                      </Button>
                    </TableCell>

                    <TableCell>
                      {sub.status === 'approved' && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          Approved
                        </Badge>
                      )}
                      {sub.status === 'rejected' && (
                        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                          Rejected
                        </Badge>
                      )}
                      {(sub.status === 'submitted' || sub.status === 'pending_provider') && (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          In Review
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      {sub.status === 'submitted' || sub.status === 'pending_provider' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(sub)}
                            disabled={processingId === sub.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          >
                            {processingId === sub.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectingSub(sub)}
                            disabled={processingId === sub.id}
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Inspect Proof Modal */}
        <Dialog open={!!viewingSub} onOpenChange={(open) => !open && setViewingSub(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Proof Inspection</DialogTitle>
              <DialogDescription>{viewingSub?.taskTitle}</DialogDescription>
            </DialogHeader>

            {viewingSub && (
              <div className="space-y-4 py-2">
                {viewingSub.proofText && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <Type className="h-3.5 w-3.5 text-blue-500" /> Proof Text / Note:
                    </p>
                    <div className="p-3 bg-muted rounded-lg text-xs leading-relaxed font-mono">
                      {viewingSub.proofText}
                    </div>
                  </div>
                )}

                {viewingSub.proofUrl && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5 text-purple-500" /> Verification URL:
                    </p>
                    <a
                      href={viewingSub.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline flex items-center gap-1 break-all"
                    >
                      {viewingSub.proofUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}

                {viewingSub.proofScreenshots && viewingSub.proofScreenshots.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-500" /> Screenshots ({viewingSub.proofScreenshots.length}):
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                      {viewingSub.proofScreenshots.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Proof" className="w-full h-24 object-cover hover:scale-105 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={!!rejectingSub} onOpenChange={(open) => !open && setRejectingSub(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Submission</DialogTitle>
              <DialogDescription>Provide a reason for rejecting this microtask submission.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <Input
                placeholder="e.g. Screenshot does not show watching 2 minutes"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setRejectingSub(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
