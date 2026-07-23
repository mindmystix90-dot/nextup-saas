'use client';

import { useEffect, useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth.service';
import { validatePackagePermission, type FeatureKey, type PermissionDecision } from '@/services/permission.service';
import type { FirestoreProfile } from '@/types';
import Link from 'next/link';

interface PackageFeatureGuardProps {
  feature: FeatureKey;
  children: React.ReactNode;
}

export function PackageFeatureGuard({ feature, children }: PackageFeatureGuardProps) {
  const { user } = useAuth();
  const [decision, setDecision] = useState<PermissionDecision | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      if (!user) {
        setDecision({ allowed: false, reason: 'Please sign in to continue.' });
        setLoading(false);
        return;
      }

      const profile = await authService.getProfile() as FirestoreProfile | null;
      const result = await validatePackagePermission(profile, feature);
      if (mounted) {
        setDecision(result);
        setLoading(false);
      }
    }

    check().catch(() => {
      if (mounted) {
        setDecision({ allowed: false, reason: 'Could not validate package access.' });
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [feature, user]);

  if (loading) {
    return <div className="flex min-h-[240px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!decision?.allowed) {
    return (
      <Card className="card-premium mx-auto max-w-xl">
        <CardContent className="p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-bold">Package access required</h2>
          <p className="mt-2 text-sm text-muted-foreground">{decision?.reason || 'Your current package does not include this feature.'}</p>
          <Button asChild className="mt-5 bg-brand-gradient font-semibold"><Link href="/pricing">View packages</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
