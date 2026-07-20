'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, Clock, Users, PlayCircle, Lock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getIcon } from '@/lib/icons';
import { courses as fallbackCourses } from '@/lib/data/site';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fetchPublishedCourses, type Course } from '@/lib/supabase/courses';

type Level = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

const CATEGORIES = ['All', 'Marketing', 'AI Tools', 'Business', 'Content', 'Communication', 'Sales', 'Freelancing', 'Branding'];
const LEVELS: Level[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const ENROLLED = new Set(['Digital Marketing Mastery', 'AI Tools for Work', 'Content Creation Bootcamp']);
const COMPLETED = new Set(['Speak with Confidence', 'Business Strategy 101']);
const LOCKED = new Set(['AI for Business Growth']);

interface DisplayCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  price: string;
  icon: string;
  gradient: string;
}

export default function CoursesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState<Level>('All');
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublishedCourses();
        if (!cancelled) setDbCourses(data);
      } catch {
        // Fallback to static data silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const allCourses: DisplayCourse[] = useMemo(() => {
    if (dbCourses.length > 0) {
      return dbCourses.map((c) => ({
        id: c.id,
        title: c.title,
        instructor: c.instructor,
        category: c.category,
        level: c.level,
        duration: c.duration,
        lessons: c.lessons,
        price: c.price,
        icon: c.icon,
        gradient: c.gradient,
      }));
    }
    return fallbackCourses.map((c) => ({
      id: c.title,
      title: c.title,
      instructor: c.instructor,
      category: c.category,
      level: c.level,
      duration: c.duration,
      lessons: 0,
      price: c.price,
      icon: c.icon,
      gradient: c.gradient,
    }));
  }, [dbCourses]);

  const filtered = useMemo(() => {
    return allCourses.filter((c) => {
      const matchQuery =
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.instructor.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === 'All' || c.category === category;
      const matchLevel = level === 'All' || c.level === level;
      return matchQuery && matchCat && matchLevel;
    });
  }, [allCourses, query, category, level]);

  function statusFor(title: string): 'enrolled' | 'completed' | 'locked' | 'new' {
    if (COMPLETED.has(title)) return 'completed';
    if (ENROLLED.has(title)) return 'enrolled';
    if (LOCKED.has(title)) return 'locked';
    return 'new';
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-brand-gradient opacity-10 blur-[120px]" />
        </div>
        <div className="container">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Courses
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Explore <span className="text-gradient">premium courses</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Practical, expert-led courses across the most in-demand skills. Learn at your own pace and earn verifiable certificates.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8 max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses or instructors…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  category === c
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30'
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level:</span>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                  level === l
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container section-padding">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> course{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <Card className="card-premium">
                <CardContent className="py-16 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                    <Search className="h-7 w-7" />
                  </span>
                  <h2 className="mt-4 font-display text-lg font-semibold">No courses found</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Try a different search or filter.</p>
                  <Button
                    variant="outline"
                    className="mt-4 font-semibold"
                    onClick={() => { setQuery(''); setCategory('All'); setLevel('All'); }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filtered.map((c, i) => {
                  const Icon = getIcon(c.icon);
                  const status = statusFor(c.title);
                  return (
                    <Reveal key={c.id} delay={(i % 3) * 80}>
                      <Card className="card-premium card-premium-hover h-full overflow-hidden">
                        <div className={cn('relative h-32 bg-gradient-to-br p-5 text-white', c.gradient)}>
                          <div className="absolute inset-0 bg-slate-950/10" />
                          <div className="relative flex items-center justify-between">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                              <Icon className="h-6 w-6" />
                            </span>
                            {status === 'completed' && <Badge className="bg-success text-white border-transparent">Completed</Badge>}
                            {status === 'enrolled' && <Badge className="bg-white/20 text-white border-transparent">In Progress</Badge>}
                            {status === 'locked' && <Badge className="bg-slate-950/40 text-white border-transparent">Locked</Badge>}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{c.category}</span>
                            <span>·</span>
                            <span>{c.level}</span>
                          </div>
                          <h3 className="mt-1.5 font-display text-lg font-semibold leading-tight">{c.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">by {c.instructor}</p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            {c.lessons > 0 && (
                              <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {c.lessons} lessons</span>
                            )}
                            {c.duration && (
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-display text-lg font-bold">{c.price}</span>
                          </div>
                          <div className="mt-4">
                            {status === 'completed' ? (
                              <Button variant="outline" size="sm" className="w-full font-semibold" onClick={() => toast.success('Opening certificate…')}>
                                <CheckCircle2 className="mr-1.5 h-4 w-4" /> View Certificate
                              </Button>
                            ) : status === 'enrolled' ? (
                              <Button size="sm" className="w-full bg-brand-gradient font-semibold" onClick={() => toast.success('Resuming course…')}>
                                <PlayCircle className="mr-1.5 h-4 w-4" /> Continue Learning
                              </Button>
                            ) : status === 'locked' ? (
                              <Button variant="outline" size="sm" className="w-full font-semibold opacity-60 cursor-not-allowed" disabled>
                                <Lock className="mr-1.5 h-4 w-4" /> Unlock with Pro
                              </Button>
                            ) : (
                              <Button size="sm" className="w-full bg-brand-gradient font-semibold" onClick={() => toast.success('Enrolling in course…')}>
                                Enroll Now <ArrowRight className="ml-1.5 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
