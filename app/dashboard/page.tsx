'use client';

import Link from 'next/link';
import { ArrowRight, PlayCircle, Calendar, Sparkles, Trophy, Wallet, TrendingUp, BookOpen, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import { getIcon } from '@/lib/icons';
import {
  dashboardStats,
  enrolledCourses,
  completedCourses,
  recentActivity,
  announcements,
  quickActions,
  upcomingLiveClass,
  recommendedCourses,
} from '@/lib/data/dashboard';
import { walletBalance, walletTransactions, lifetimeEarnings } from '@/lib/data/wallet';
import { certificates } from '@/lib/data/certificates';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = (user?.name || 'Guest').split(' ')[0];

  return (
    <DashboardLayout>
      {/* Welcome Card */}
      <Card className="card-premium overflow-hidden mb-8">
        <div className="relative bg-slate-950 p-6 md:p-8 text-white">
          <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[80px] pointer-events-none" />
          <div className="absolute -top-16 right-0 h-60 w-60 rounded-full bg-primary/30 blur-[100px] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white/20">
                <AvatarImage src="" alt={firstName} />
                <AvatarFallback className="bg-brand-gradient text-white text-lg font-bold">
                  {firstName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-slate-300">Welcome back,</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{firstName}</h1>
                <p className="mt-1 text-sm text-slate-400">You&apos;re on a 7-day learning streak. Keep it going!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-brand-gradient border-transparent text-white px-3 py-1.5 text-xs font-semibold">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Pro Member
              </Badge>
              <Button asChild className="bg-brand-gradient font-semibold">
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue learning */}
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Continue learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/learning">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.map((c) => {
                const Icon = getIcon(c.icon);
                return (
                  <div key={c.title} className="flex items-center gap-4 rounded-2xl border border-border p-3 hover:shadow-premium transition-all">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.instructor} · {c.lesson}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={c.progress} className="h-1.5 flex-1" />
                        <span className="text-xs font-semibold text-muted-foreground">{c.progress}%</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-brand-gradient font-semibold shrink-0">
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Resume
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Completed courses */}
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" /> Completed courses
                </CardTitle>
                <CardDescription>{completedCourses.length} courses finished</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/certificates">Certificates <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              {completedCourses.map((c) => {
                const Icon = getIcon(c.icon);
                return (
                  <div key={c.title} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.lesson}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {recentActivity.map((a, i) => {
                  const Icon = getIcon(a.icon);
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary ${a.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{a.text}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Membership badge / progress */}
          <Card className="card-premium overflow-hidden">
            <div className="bg-brand-gradient p-5 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <p className="font-display text-lg font-bold">Pro Member</p>
              </div>
              <p className="mt-1 text-sm text-white/80">You&apos;re 65% to Lifetime tier</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: '65%' }} />
              </div>
            </div>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Unlock Lifetime for all future courses and the alumni network.</p>
              <Button asChild className="mt-3 w-full bg-brand-gradient font-semibold">
                <Link href="/pricing">Upgrade <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Wallet balance */}
          <Card className="card-premium overflow-hidden">
            <div className="bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
                  <Wallet className="h-4 w-4 text-white" />
                </span>
                <Link href="/dashboard/wallet" className="text-xs font-medium text-slate-300 hover:text-white">
                  Manage
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-400">Wallet balance</p>
              <p className="font-display text-2xl font-bold text-white">{walletBalance}</p>
              <p className="mt-1 text-xs text-slate-400">Lifetime: {lifetimeEarnings}</p>
            </div>
            <CardContent className="p-5 space-y-2">
              {walletTransactions.slice(0, 3).map((t) => (
                <div key={t.label} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.type === 'in' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {t.type === 'in' ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  </span>
                  <p className="flex-1 min-w-0 truncate text-foreground">{t.label}</p>
                  <span className={`text-xs font-semibold ${t.type === 'in' ? 'text-success' : 'text-foreground'}`}>{t.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming live class */}
          <Card className="card-premium overflow-hidden">
            <div className="bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-pulse-ring" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-white">Upcoming Live Class</span>
              </div>
              <p className="mt-3 font-display text-lg font-bold text-white">{upcomingLiveClass.title}</p>
              <p className="mt-1 text-sm text-slate-400">{upcomingLiveClass.date}</p>
              <p className="mt-2 text-xs text-slate-500">{upcomingLiveClass.watching}</p>
              <Button className="mt-4 w-full bg-brand-gradient font-semibold">
                <Calendar className="mr-2 h-4 w-4" /> Set reminder
              </Button>
            </div>
          </Card>

          {/* Certificates earned */}
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Certificates
              </CardTitle>
              <Badge variant="secondary">{certificates.length} earned</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {certificates.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                    {(() => { const Icon = getIcon(c.icon); return <Icon className="h-4 w-4" />; })()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.courseName}</p>
                    <p className="text-xs text-muted-foreground">{c.issueDate}</p>
                  </div>
                </div>
              ))}
              <Button asChild variant="ghost" size="sm" className="w-full font-semibold">
                <Link href="/dashboard/certificates">View all certificates <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((a) => {
                const Icon = getIcon(a.icon);
                return (
                  <Link key={a.label} href={a.href} className="group flex flex-col items-center gap-2 rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-premium transition-all">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary group-hover:bg-brand-gradient group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-center">{a.label}</span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.map((a) => (
                <div key={a.title} className="rounded-2xl border border-border p-4">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.tagColor}`}>{a.tag}</span>
                  <p className="mt-2 text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{a.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended courses */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Recommended for you
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/courses">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedCourses.map((c) => {
            const Icon = getIcon(c.icon);
            return (
              <Card key={c.title} className="card-premium card-premium-hover overflow-hidden">
                <div className={`relative h-24 bg-gradient-to-br ${c.gradient} p-4 text-white`}>
                  <div className="absolute inset-0 bg-slate-950/10" />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <CardContent className="p-5">
                  <p className="text-xs text-primary font-medium">{c.reason}</p>
                  <p className="mt-1 font-display text-base font-semibold leading-tight">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {c.instructor}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" /> {c.rating}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-lg font-bold">{c.price}</span>
                    <Button size="sm" variant="outline" className="font-semibold">Enroll</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
