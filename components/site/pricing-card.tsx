'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  featured,
  badge,
}: PricingPlan) {
  return (
    <div
      className={cn(
        'relative rounded-3xl p-7 transition-all duration-300',
        featured
          ? 'bg-slate-950 text-white shadow-premium-lg border border-slate-800 lg:-translate-y-4'
          : 'card-premium card-premium-hover'
      )}
    >
      {featured && (
        <div className="absolute inset-0 rounded-3xl bg-brand-gradient opacity-20 blur-xl pointer-events-none" />
      )}
      <div className="relative">
        {badge && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
              featured ? 'bg-brand-gradient text-white' : 'bg-primary/10 text-primary'
            )}
          >
            <Sparkles className="h-3.5 w-3.5" /> {badge}
          </span>
        )}
        <h3 className={cn('mt-4 font-display text-xl font-bold', featured ? 'text-white' : 'text-foreground')}>
          {name}
        </h3>
        <p className={cn('mt-1.5 text-sm', featured ? 'text-slate-400' : 'text-muted-foreground')}>
          {description}
        </p>
        <div className="mt-5 flex items-baseline gap-1">
          <span className={cn('font-display text-4xl font-bold', featured ? 'text-white' : 'text-foreground')}>
            {price}
          </span>
          <span className={cn('text-sm', featured ? 'text-slate-400' : 'text-muted-foreground')}>
            {period}
          </span>
        </div>

        <Button
          asChild
          className={cn(
            'mt-6 w-full',
            featured
              ? 'bg-brand-gradient hover:opacity-90 text-white'
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          )}
        >
          <a href="/register">{cta}</a>
        </Button>

        <ul className="mt-7 space-y-3.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  featured ? 'bg-brand-gradient text-white' : 'bg-success/15 text-success'
                )}
              >
                <Check className="h-3 w-3" />
              </span>
              <span className={featured ? 'text-slate-300' : 'text-foreground'}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
