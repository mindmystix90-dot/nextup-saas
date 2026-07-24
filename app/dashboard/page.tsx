'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PlayCircle, Sparkles, Wallet, TrendingUp, BookOpen, Award, Users, Trophy, Loader2, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import { fetchPublishedCourses, fetchUserCourseAccess, type Course } from '@/services/courses.service';
import { fetchWallet, fetchTransactions, subscribeWallet, subscribeTransactions, formatINR } from '@/services/wallet.service';
import { fetchUserCertificates } from '@/services/certificates.service';
import { fetchUserOrders, subscribeUserOrders } from '@/services/commerce.service';
import type { WalletData, WalletTransaction, Certificate, Order } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = (user?.name || 'Guest').split(' ')[0];
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [userCertificates, setUserCertificates] = useState<Certificate[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    // Load static courses & certificates
    (async () => {
      try {
        const [courses, accessIds, certs] = await Promise.all([
          fetchPublishedCourses(),
          fetchUserCourseAccess(user.uid),
          fetchUserCertificates(user.uid),
        ]);
        setPublishedCourses(courses);
        setEnrolledCourses(courses.filter((c) => accessIds.includes(c.id)));
        setUserCertificates(certs);
      } catch {
        // best-effort
      } finally {
        setLoading(false);
      }
    })();

    // Realtime subscriptions for Wallet, Transactions, Orders
    const unsubWallet = subscribeWallet(user.uid, (w) => setWallet(w));
    const unsubTxns = subscribeTransactions(user.uid, (txns) => setTransactions(txns));
    const unsubOrders = subscribeUserOrders(user.uid, (ords) => setUserOrders(ords));

    return () => {
      unsubWallet();
      unsubTxns();
      unsubOrders();
    };
  }, [user?.uid]);


  const membership = user?.membership || 'starter';
  const membershipLabel = membership.charAt(0).toUpperCase() + membership.slice(1);
  const initials = firstName.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                <AvatarImage src={user?.photoURL || ''} alt={firstName} />
                <AvatarFallback className="bg-brand-gradient text-white text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-slate-300">Welcome back,</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{firstName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-brand-gradient border-transparent text-white px-3 py-1.5 text-xs font-semibold">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> {membershipLabel} Member
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
        <StatCard icon={BookOpen} label="Enrolled Courses" value={String(enrolledCourses.length)} color="text-primary" />
        <StatCard icon={Award} label="Certificates" value={String(userCertificates.length)} color="text-amber-500" />
        <StatCard icon={Wallet} label="Wallet Balance" value={`₹${formatINR(wallet?.balance ?? 0)}`} color="text-success" />
        <StatCard icon={TrendingUp} label="Orders & Purchases" value={String(userOrders.length)} color="text-violet-500" />
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
              {enrolledCourses.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/learning">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No enrolled courses yet"
                  description="Browse our course catalogue and enroll to start learning."
                  actionLabel="Browse Courses"
                  actionHref="/courses"
                />
              ) : (
                enrolledCourses.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-border p-3 hover:shadow-premium transition-all">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
                      <BookOpen className="h-6 w-6" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.instructor}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={0} className="h-1.5 flex-1" />
                        <span className="text-xs font-semibold text-muted-foreground">0%</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-brand-gradient font-semibold shrink-0">
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Resume
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No recent activity"
                  description="Your learning and wallet activity will appear here."
                />
              ) : (
                <ul className="space-y-4">
                  {transactions.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary ${t.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {t.amount >= 0 ? <TrendingUp className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`text-xs font-semibold ${t.amount >= 0 ? 'text-success' : 'text-foreground'}`}>
                        {t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
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
              <p className="font-display text-2xl font-bold text-white">₹{formatINR(wallet?.balance ?? 0)}</p>
              <p className="mt-1 text-xs text-slate-400">Lifetime: ₹{formatINR(wallet?.lifetimeEarnings ?? 0)}</p>
            </div>
            <CardContent className="p-5 space-y-2">
              {transactions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No transactions yet</p>
              ) : (
                transactions.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.amount >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {t.amount >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    </span>
                    <p className="flex-1 min-w-0 truncate text-foreground">{t.label}</p>
                    <span className={`text-xs font-semibold ${t.amount >= 0 ? 'text-success' : 'text-foreground'}`}>
                      {t.amount >= 0 ? '+' : ''}₹{formatINR(Math.abs(t.amount))}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Certificates
              </CardTitle>
              <Badge variant="secondary">{userCertificates.length} earned</Badge>
            </CardHeader>
            <CardContent>
              {userCertificates.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No certificates yet"
                  description="Complete 100% of any course to automatically earn your certificate."
                  actionLabel="My Learning"
                  actionHref="/dashboard/learning"
                />
              ) : (
                <div className="space-y-3">
                  {userCertificates.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{cert.courseName}</p>
                        <p className="text-muted-foreground">Issued: {cert.issueDate}</p>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 border-transparent font-bold">Verified</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community */}
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Community
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/community">Visit <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Join discussions, ask questions, and learn alongside peers.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended courses */}
      {publishedCourses.length > 0 && (
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
            {publishedCourses.slice(0, 3).map((c) => (
              <Card key={c.id} className="card-premium card-premium-hover overflow-hidden">
                <div className={`relative h-24 bg-gradient-to-br ${c.gradient} p-4 text-white`}>
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <BookOpen className="h-5 w-5" />
                  </span>
                </div>
                <CardContent className="p-5">
                  <p className="mt-1 font-display text-base font-semibold leading-tight">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {c.instructor}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-lg font-bold">{c.price}</span>
                    <Button size="sm" variant="outline" className="font-semibold" asChild>
                      <Link href="/courses">Enroll</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <Card className="card-premium">
      <CardContent className="p-5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-3 font-display text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: {
  icon: LucideIcon; title: string; description: string; actionLabel?: string; actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild size="sm" className="mt-4 bg-brand-gradient font-semibold">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}


