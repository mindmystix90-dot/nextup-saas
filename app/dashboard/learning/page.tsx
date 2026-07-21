'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, Lock, BookOpen, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { fetchPublishedCourses, fetchUserPurchasedCourses, canAccessCourse, type Course } from '@/services/courses.service';
import type { Membership } from '@/types';

const MEMBERSHIP_LABEL: Record<string, string> = {
  starter: 'Starter', pro: 'Pro', lifetime: 'Lifetime',
};

export default function LearningPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchased, setPurchased] = useState<string[]>([]);

  const membership = (user?.membership || 'starter') as Membership;

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [c, p] = await Promise.all([
          fetchPublishedCourses(),
          fetchUserPurchasedCourses(user.uid),
        ]);
        setCourses(c);
        setPurchased(p);
      } catch { /* best-effort */ } finally { setLoading(false); }
    })();
  }, [user?.uid]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const accessible = courses.filter((c) => canAccessCourse(membership, c, purchased));
  const locked = courses.filter((c) => !canAccessCourse(membership, c, purchased));

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary"><BookOpen className="h-5 w-5" /></span>
          Learning
        </h1>
        <p className="mt-2 text-muted-foreground">All courses available on the platform. Unlock higher-tier courses by upgrading your membership.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Total courses" value={String(courses.length)} color="text-primary" />
        <StatCard icon={CheckCircle2} label="Accessible" value={String(accessible.length)} color="text-success" />
        <StatCard icon={Lock} label="Locked" value={String(locked.length)} color="text-warning" />
        <StatCard icon={Sparkles} label="Membership" value={MEMBERSHIP_LABEL[membership]} color="text-violet-500" />
      </div>

      {/* Accessible courses */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" /> Accessible courses ({accessible.length})
        </h2>
        {accessible.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="py-12 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3"><BookOpen className="h-6 w-6" /></span>
              <p className="text-sm font-semibold">No accessible courses yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Browse the catalogue and enroll to start learning.</p>
              <Button asChild size="sm" className="mt-4 bg-brand-gradient font-semibold"><Link href="/courses">Browse Courses</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {accessible.map((c) => (
              <Card key={c.id} className="card-premium card-premium-hover">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
                    <BookOpen className="h-7 w-7" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{c.title}</p>
                      <Badge className="bg-success/10 text-success border-transparent">Unlocked</Badge>
                      {purchased.includes(c.id) && <Badge variant="secondary">Purchased</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.instructor} · {c.lessons} lessons · {c.duration}</p>
                  </div>
                  <Button size="sm" className="bg-brand-gradient font-semibold shrink-0">
                    <PlayCircle className="mr-1.5 h-4 w-4" /> Continue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Locked courses */}
      {locked.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-warning" /> Locked courses ({locked.length})
          </h2>
          <div className="space-y-4">
            {locked.map((c) => (
              <Card key={c.id} className="card-premium relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary/20 pointer-events-none" />
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4 relative">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white opacity-60`}>
                    <BookOpen className="h-7 w-7" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{c.title}</p>
                      <Badge className="bg-warning/10 text-warning border-transparent">
                        <Lock className="mr-1 h-3 w-3" /> {MEMBERSHIP_LABEL[c.accessLevel]} Membership
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.instructor} · {c.lessons} lessons · {c.duration}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      This course is available with the {MEMBERSHIP_LABEL[c.accessLevel]} Membership.
                    </p>
                  </div>
                  <Button asChild size="sm" className="bg-brand-gradient font-semibold shrink-0">
                    <Link href="/pricing"><Sparkles className="mr-1.5 h-4 w-4" /> Upgrade Membership</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof BookOpen; label: string; value: string; color: string }) {
  return (
    <Card className="card-premium">
      <CardContent className="p-5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${color}`}><Icon className="h-5 w-5" /></span>
        <p className="mt-3 font-display text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
