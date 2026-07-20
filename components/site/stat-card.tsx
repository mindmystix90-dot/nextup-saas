'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/site/animated-counter';
import { Reveal } from '@/components/site/reveal';
import { getIcon } from '@/lib/icons';

export function StatCard({
  value,
  suffix,
  label,
  icon,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: string;
  delay?: number;
}) {
  const Icon = getIcon(icon);
  return (
    <Reveal delay={delay}>
      <Card className="card-premium card-premium-hover overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </Reveal>
  );
}
