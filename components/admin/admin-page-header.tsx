'use client';

import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  backHref?: string;
}

export function AdminPageHeader({ title, subtitle, icon: Icon, actions, backHref }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Icon className="h-6 w-6" />
          </span>
        )}
        <div>
          {backHref && (
            <Link
              href={backHref}
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
          )}
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    Active: 'text-success',
    Published: 'text-success',
    Verified: 'text-success',
    Completed: 'text-success',
    Trial: 'text-warning',
    Pending: 'text-warning',
    Draft: 'text-muted-foreground',
    Archived: 'text-muted-foreground',
    Hidden: 'text-muted-foreground',
    Suspended: 'text-destructive',
    Failed: 'text-destructive',
    Revoked: 'text-destructive',
    Banned: 'text-destructive',
    Flagged: 'text-destructive',
    Paused: 'text-warning',
    Pinned: 'text-primary',
  };
  const dot: Record<string, string> = {
    Active: 'bg-success',
    Published: 'bg-success',
    Verified: 'bg-success',
    Completed: 'bg-success',
    Trial: 'bg-warning',
    Pending: 'bg-warning',
    Paused: 'bg-warning',
    Draft: 'bg-muted-foreground',
    Archived: 'bg-muted-foreground',
    Hidden: 'bg-muted-foreground',
    Suspended: 'bg-destructive',
    Failed: 'bg-destructive',
    Revoked: 'bg-destructive',
    Banned: 'bg-destructive',
    Flagged: 'bg-destructive',
    Pinned: 'bg-primary',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone[status] || 'text-muted-foreground'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status] || 'bg-muted-foreground'}`} />
      {status}
    </span>
  );
}
