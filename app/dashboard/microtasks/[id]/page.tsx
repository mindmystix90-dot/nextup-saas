'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Type,
  Link2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import { fetchTaskById, subscribeTask, submitTaskProof } from '@/services/microtasks.service';
import { formatINR } from '@/services/wallet.service';
import type { Microtask } from '@/types';

function MicrotaskDetailsContent({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  let resolvedId = '';
  try {
    const resolvedParams =
      params && typeof (params as any)?.then === 'function'
        ? use(params as Promise<{ id: string }>)
        : (params as { id: string });
    resolvedId = resolvedParams?.id || '';
    console.log('[MicrotaskDetailsPage] Route parameter unwrapped:', params, 'Resolved Task ID:', resolvedId);
  } catch (err) {
    console.error('[MicrotaskDetailsPage] Error unwrapping params:', err);
  }

  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [task, setTask] = useState<Microtask | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofScreenshots, setProofScreenshots] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    console.log('[MicrotaskDetailsPage] Effect triggered for Task ID:', resolvedId);
    if (!resolvedId) {
      console.warn('[MicrotaskDetailsPage] Missing or empty Task ID in route');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    let unsubscribe: (() => void) | null = null;

    try {
      console.log('[MicrotaskDetailsPage] Subscribing to task via subscribeTask:', resolvedId);
      unsubscribe = subscribeTask(resolvedId, (fetchedTask) => {
        console.log('[MicrotaskDetailsPage] Received task update from Firestore/service:', fetchedTask);
        if (fetchedTask) {
          console.log('[MicrotaskDetailsPage] Task Details -> Provider:', fetchedTask.providerName, 'Title:', fetchedTask.title, 'Reward:', fetchedTask.reward);
          setTask(fetchedTask);
          setLoadError(null);
        } else {
          console.warn('[MicrotaskDetailsPage] Task returned as null for ID:', resolvedId);
          setTask(null);
        }
        setLoading(false);
      });
    } catch (err: any) {
      console.error('[MicrotaskDetailsPage] Exception subscribing to task:', err);
      (async () => {
        try {
          console.log('[MicrotaskDetailsPage] Attempting fallback fetchTaskById for ID:', resolvedId);
          const singleTask = await fetchTaskById(resolvedId);
          setTask(singleTask);
          if (!singleTask) {
            setLoadError('Task not found.');
          }
        } catch (fetchErr: any) {
          console.error('[MicrotaskDetailsPage] Error in fallback fetchTaskById:', fetchErr);
          setLoadError('Unable to load task');
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      if (unsubscribe) {
        console.log('[MicrotaskDetailsPage] Cleaning up task subscription for ID:', resolvedId);
        unsubscribe();
      }
    };
  }, [resolvedId]);

  const handleAddImage = () => {
    try {
      if (!imageInput.trim()) return;
      setProofScreenshots([...proofScreenshots, imageInput.trim()]);
      setImageInput('');
    } catch (err) {
      console.error('[MicrotaskDetailsPage] Error adding image URL:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setProofScreenshots((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('[MicrotaskDetailsPage] Error reading file upload:', err);
    }
  };

  const handleRemoveImage = (index: number) => {
    try {
      setProofScreenshots(proofScreenshots.filter((_, i) => i !== index));
    } catch (err) {
      console.error('[MicrotaskDetailsPage] Error removing image:', err);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit proof.');
      return;
    }
    if (!task) {
      setError('Task details missing.');
      return;
    }

    const proofTypes = Array.isArray(task.proofTypes) ? task.proofTypes : [];

    if (proofTypes.includes('text') && !proofText.trim()) {
      setError('Please provide the required Text proof / note.');
      return;
    }
    if (proofTypes.includes('url') && !proofUrl.trim()) {
      setError('Please provide the required verification URL link.');
      return;
    }
    if (proofTypes.includes('screenshot') && proofScreenshots.length === 0) {
      setError('Please upload at least one screenshot proof.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await submitTaskProof({
        taskId: task.id,
        uid: user.uid,
        userName: user.name || user.email || 'User',
        userEmail: user.email || '',
        proofText,
        proofUrl,
        proofScreenshots,
      });

      setSuccess('Task proof submitted successfully! Verification is pending.');
      setTimeout(() => {
        router.push('/dashboard/microtasks');
      }, 1500);
    } catch (err: any) {
      console.error('[MicrotaskDetailsPage] Error submitting proof:', err);
      setError(err?.message || 'Failed to submit task proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading microtask offer details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-bold text-foreground">Unable to load task</h2>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/microtasks">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Task Marketplace
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Microtask Not Found</h2>
          <p className="text-sm text-muted-foreground">
            This microtask may have expired, reached maximum submissions, or been removed.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/microtasks">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Task Marketplace
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Safe variables with complete fallback null guards
  const providerName = task.providerName || (task as any)?.provider?.name || 'SproutGigs';
  const taskTitle = task.title || 'Microtask Offer';
  const taskDescription = task.description || '';
  const taskReward = typeof task.reward === 'number' ? task.reward : 0;
  const taskEstimatedMins = typeof task.estimatedMinutes === 'number' ? task.estimatedMinutes : 5;
  const taskInstructions = task.instructions || 'Follow provider guidelines on external offer page.';
  const taskRequirements = Array.isArray(task.requirements) ? task.requirements : [];
  const proofTypes = Array.isArray(task.proofTypes) ? task.proofTypes : ['text', 'screenshot'];
  const externalUrl = task.externalUrl || '';

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Navigation */}
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/microtasks">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Task Marketplace
          </Link>
        </Button>

        {/* Task Title & Payout Card */}
        <Card className="card-premium overflow-hidden">
          <div className="bg-slate-950 p-6 md:p-8 text-white relative">
            <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-white/20 text-white text-xs">
                    <Building2 className="mr-1 h-3 w-3 text-primary" /> {providerName}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Verified Provider
                  </Badge>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{taskTitle}</h1>
                <p className="text-slate-300 text-sm max-w-2xl">{taskDescription}</p>
              </div>

              <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center min-w-[180px]">
                <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Reward Amount</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  ₹{formatINR(taskReward)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> ~{taskEstimatedMins} mins
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Task Instructions & Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 card-premium p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Step-by-Step Instructions
              </h3>
              <div className="mt-3 p-4 rounded-xl bg-secondary/40 border border-border text-sm leading-relaxed whitespace-pre-line">
                {taskInstructions}
              </div>
            </div>

            {taskRequirements.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-foreground mb-2">Requirements Check:</h4>
                <ul className="space-y-2">
                  {taskRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {externalUrl && (
              <div className="pt-2">
                <Button asChild size="lg" className="w-full bg-brand-gradient font-bold shadow-glow">
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    Open Offer External Link <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="text-[11px] text-center text-muted-foreground mt-2">
                  Perform the requested actions on the external page, then submit proof below.
                </p>
              </div>
            )}
          </Card>

          {/* Proof Submission Form */}
          <Card className="card-premium p-6 flex flex-col justify-between">
            <form onSubmit={handleSubmitProof} className="space-y-5">
              <div>
                <h3 className="font-bold text-lg mb-1">Submit Proof</h3>
                <p className="text-xs text-muted-foreground">
                  Provide evidence of task completion for provider validation.
                </p>
              </div>

              {error && (
                <div className="p-3 text-xs bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Text Proof */}
              {proofTypes.includes('text') && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-blue-500" /> Text Proof / Notes <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter username, completion code, or details..."
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    className="text-xs bg-background min-h-[80px]"
                  />
                </div>
              )}

              {/* URL Proof */}
              {proofTypes.includes('url') && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-purple-500" /> Verification URL Link <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
              )}

              {/* Screenshot Proof */}
              {proofTypes.includes('screenshot') && (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-500" /> Screenshot Proof <span className="text-rose-500">*</span>
                  </Label>

                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="text-xs bg-background"
                    />
                  </div>

                  <div className="text-[11px] text-muted-foreground text-center">or paste image URL</div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="https://i.imgur.com/..."
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="text-xs bg-background"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddImage} className="text-xs">
                      Add
                    </Button>
                  </div>

                  {proofScreenshots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {proofScreenshots.map((img, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-border h-16 bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Proof" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-gradient font-bold shadow-glow mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Proof...
                  </>
                ) : (
                  'Submit Task Proof'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MicrotaskDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      }
    >
      <MicrotaskDetailsContent params={params} />
    </Suspense>
  );
}
