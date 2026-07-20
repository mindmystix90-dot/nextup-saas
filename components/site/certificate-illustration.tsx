'use client';

import { Award, ShieldCheck, Sparkles } from 'lucide-react';
import { certificateSample } from '@/lib/data/site';

export function CertificateIllustration() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto perspective-1000">
      <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[70px] rounded-full" />

      {/* Certificate card with subtle 3D tilt */}
      <div
        className="relative rounded-3xl bg-white shadow-premium-lg border border-border p-8 md:p-10 preserve-3d"
        style={{ transform: 'rotateY(-8deg) rotateX(4deg)' }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 h-12 w-12 rounded-tl-2xl border-t-2 border-l-2 border-primary/30" />
        <div className="absolute top-4 right-4 h-12 w-12 rounded-tr-2xl border-t-2 border-r-2 border-primary/30" />
        <div className="absolute bottom-4 left-4 h-12 w-12 rounded-bl-2xl border-b-2 border-l-2 border-primary/30" />
        <div className="absolute bottom-4 right-4 h-12 w-12 rounded-br-2xl border-b-2 border-r-2 border-primary/30" />

        {/* Top ribbon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
              <Award className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-lg font-bold text-foreground">NextUp</span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Certificate of Completion
          </span>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            This certifies that
          </p>
          <p className="mt-3 font-display text-2xl md:text-3xl font-bold text-foreground">
            {certificateSample.recipientName}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            has successfully completed the
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-gradient">
            {certificateSample.courseName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">course program</p>
        </div>

        {/* Signature row */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <div className="h-8 w-24 border-b border-foreground/30" />
            <p className="mt-1 text-[10px] text-muted-foreground">Instructor</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-brand-gradient-soft">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div className="text-right">
            <div className="h-8 w-24 border-b border-foreground/30" />
            <p className="mt-1 text-[10px] text-muted-foreground">Date</p>
          </div>
        </div>

        {/* Verification strip */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-2.5">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-success">
            Verified · ID: {certificateSample.certificateId}
          </span>
        </div>
      </div>

      {/* Floating sparkle */}
      <div className="absolute -top-4 -right-2 animate-float">
        <div className="glass rounded-2xl shadow-premium-lg p-3">
          <Sparkles className="h-6 w-6 text-amber-400" />
        </div>
      </div>
      <div className="absolute -bottom-4 -left-2 animate-float-slow">
        <div className="glass rounded-2xl shadow-premium-lg p-3">
          <Award className="h-6 w-6 text-accent" />
        </div>
      </div>
    </div>
  );
}
