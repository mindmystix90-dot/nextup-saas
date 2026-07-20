'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import { getIcon } from '@/lib/icons';

export function CategoryCard({
  name,
  description,
  count,
  icon,
  gradient,
  delay = 0,
}: {
  name: string;
  description: string;
  count: string;
  icon: string;
  gradient: string;
  delay?: number;
}) {
  const Icon = getIcon(icon);
  return (
    <Link href="/courses" className="group block" style={{ animationDelay: `${delay}ms` }}>
      <Card className="card-premium card-premium-hover h-full p-5 relative overflow-hidden">
        <div className={cn('absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-xl transition-opacity group-hover:opacity-20', gradient)} />
        <div className="flex items-start justify-between">
          <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md', gradient)}>
            <Icon className="h-6 w-6" />
          </span>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
        <p className="mt-3 text-xs font-medium text-primary">{count} courses</p>
      </Card>
    </Link>
  );
}
