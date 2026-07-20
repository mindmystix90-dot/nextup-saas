'use client';

import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { stats, siteConfig } from '@/lib/data/site';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col p-6 md:p-10">
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">{siteConfig.name}</span>
        </Link>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>

        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>

      {/* Right: visual */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[100px]" />
        <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-accent/30 blur-[80px]" />
        <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-primary/30 blur-[80px]" />
        <div className="relative max-w-md p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-8 font-display text-3xl font-bold text-white leading-tight">
            Learn Skills.
            <br />
            Build Your Future.
          </h2>
          <p className="mt-4 text-slate-400">
            Join 25,000+ learners mastering practical skills, earning certificates, and
            unlocking career opportunities.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {stats.slice(0, 3).map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="font-display text-2xl font-bold text-white">
                  {s.value.toLocaleString()}{s.suffix}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
