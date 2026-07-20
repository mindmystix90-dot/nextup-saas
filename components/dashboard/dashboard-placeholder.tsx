'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/icons';

export function DashboardPlaceholder({
  title,
  description,
  icon,
  accent,
}: {
  title: string;
  description: string;
  icon: string;
  accent?: string;
}) {
  const Icon = getIcon(icon);
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary', accent)}>
            <Icon className="h-5 w-5" />
          </span>
          {title}
        </h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <Card className="card-premium">
        <CardContent className="p-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
            <Icon className="h-8 w-8" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold">Coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            This section is part of the NextUp prototype. Content and functionality will be
            connected here in a future update.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
