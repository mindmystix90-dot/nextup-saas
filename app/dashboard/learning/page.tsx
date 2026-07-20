'use client';

import { useState } from 'react';
import { PlayCircle, Lock, CheckCircle2, BookOpen, Trophy, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getIcon } from '@/lib/icons';
import { enrolledCourses, completedCourses, lockedCourses, dashboardStats } from '@/lib/data/dashboard';
import { toast } from 'sonner';

type Tab = 'in-progress' | 'completed' | 'locked';

export default function LearningPage() {
  const [tab, setTab] = useState<Tab>('in-progress');

  const list =
    tab === 'in-progress' ? enrolledCourses : tab === 'completed' ? completedCourses : lockedCourses;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'in-progress', label: 'In Progress', count: enrolledCourses.length },
    { key: 'completed', label: 'Completed', count: completedCourses.length },
    { key: 'locked', label: 'Locked', count: lockedCourses.length },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          Learning
        </h1>
        <p className="mt-2 text-muted-foreground">Track your enrolled courses, lessons, and progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((s) => {
          const Icon = getIcon(s.icon);
          return (
            <Card key={s.label} className="card-premium">
              <CardContent className="p-5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label} <span className="ml-1 text-xs">({t.count})</span>
            {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-gradient" />}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {list.map((c) => {
          const Icon = getIcon(c.icon);
          const isLocked = tab === 'locked';
          const isCompleted = tab === 'completed';
          return (
            <Card key={c.title} className="card-premium card-premium-hover">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
                  <Icon className="h-7 w-7" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{c.title}</p>
                    {isCompleted && <Badge className="bg-success/10 text-success border-transparent">Completed</Badge>}
                    {isLocked && <Badge variant="secondary">Locked</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.instructor} · {c.lesson}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={c.progress} className="h-1.5 flex-1 max-w-xs" />
                    <span className="text-xs font-semibold text-muted-foreground">{c.progress}%</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {isLocked ? (
                    <Button variant="outline" disabled className="font-semibold">
                      <Lock className="mr-1.5 h-4 w-4" /> Locked
                    </Button>
                  ) : isCompleted ? (
                    <>
                      <Button variant="outline" size="sm" className="font-semibold" onClick={() => toast.success('Opening certificate…')}>
                        <Trophy className="mr-1.5 h-4 w-4" /> View Certificate
                      </Button>
                      <Button size="sm" variant="ghost" className="font-semibold" onClick={() => toast.success('Reviewing course…')}>
                        <PlayCircle className="h-4 w-4" /> Review
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="bg-brand-gradient font-semibold" onClick={() => toast.success('Resuming course…')}>
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Continue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
