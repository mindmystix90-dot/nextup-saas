'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  PlayCircle,
  Lock,
  Clock,
  Award,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Sparkles,
  FileText,
  Download,
} from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { fetchCourses, fetchUserPurchasedCourses, canAccessCourse, type Course } from '@/services/courses.service';
import { fetchCourseLessons } from '@/services/learning.service';
import { CheckoutModal } from '@/components/checkout/checkout-modal';
import type { Lesson, Membership } from '@/types';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const membership = (user?.membership || 'starter') as Membership;

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      setLoading(true);
      try {
        const [allCourses, courseLessons] = await Promise.all([
          fetchCourses(),
          fetchCourseLessons(courseId),
        ]);
        const found = allCourses.find((c) => c.id === courseId) || null;
        setCourse(found);
        setLessons(courseLessons);

        if (user?.uid) {
          const userPurchased = await fetchUserPurchasedCourses(user.uid);
          setPurchased(userPurchased);
        }
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, user?.uid]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 px-4">
          <div className="mx-auto max-w-md text-center py-16">
            <h2 className="font-display text-2xl font-bold">Course Not Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">The course you are looking for does not exist or has been removed.</p>
            <Button asChild className="mt-6 bg-brand-gradient font-semibold">
              <Link href="/courses"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Catalog</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isUnlocked = canAccessCourse(membership, course, purchased);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 pb-16">
        {/* Banner Section */}
        <section className={`relative bg-gradient-to-br ${course.gradient || 'from-slate-900 to-indigo-950'} text-white py-12 md:py-16`}>
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Link
              href="/courses"
              className="inline-flex items-center text-xs font-semibold text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Courses
            </Link>

            <div className="grid gap-8 lg:grid-cols-3 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/10 text-white border-white/20">{course.category}</Badge>
                  <Badge className="bg-white/10 text-white border-white/20">{course.level}</Badge>
                  <Badge className="bg-white/10 text-white border-white/20">{course.accessLevel.toUpperCase()} Tier</Badge>
                </div>

                <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                  {course.title}
                </h1>
                <p className="text-base md:text-lg text-white/80">{course.subtitle}</p>

                <div className="flex items-center gap-6 text-xs text-white/80 pt-2 flex-wrap">
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {lessons.length} Modules</span>
                  <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-400" /> Certificate Included</span>
                  <span>Instructor: <strong className="text-white">{course.instructor}</strong></span>
                </div>
              </div>

              {/* Sidebar Action Card */}
              <Card className="bg-background/95 backdrop-blur-md text-foreground border-border shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground font-semibold">Pricing</span>
                    <span className="font-display text-3xl font-bold text-primary">{course.price || 'Included'}</span>
                  </div>

                  {isUnlocked ? (
                    <Button
                      className="w-full bg-brand-gradient font-bold h-12 text-sm shadow-premium"
                      onClick={() => router.push(`/dashboard/learning/${course.id}`)}
                    >
                      <PlayCircle className="mr-2 h-5 w-5" /> Open Course Player
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-brand-gradient font-bold h-12 text-sm shadow-premium"
                      onClick={() => {
                        if (!user) {
                          router.push(`/login?redirect=/courses/${course.id}`);
                        } else {
                          setIsCheckoutOpen(true);
                        }
                      }}
                    >
                      <Sparkles className="mr-2 h-5 w-5" /> Unlock Course
                    </Button>
                  )}

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Lifetime access & updates</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Downloadable source files & PDFs</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Official certificate of completion</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Course Syllabus & Modules */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="mx-auto max-w-4xl space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Course Curriculum</h2>
              <p className="text-sm text-muted-foreground">{lessons.length} lessons included in this course curriculum.</p>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-2xl border border-border p-4 bg-card hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">{lesson.duration}</span>
                    {lesson.type === 'pdf' ? (
                      <Badge variant="outline"><FileText className="mr-1 h-3 w-3" /> PDF</Badge>
                    ) : lesson.type === 'download' ? (
                      <Badge variant="outline"><Download className="mr-1 h-3 w-3" /> ZIP</Badge>
                    ) : (
                      <Badge variant="outline"><PlayCircle className="mr-1 h-3 w-3" /> Video</Badge>
                    )}
                    {isUnlocked || lesson.isFreePreview ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary font-semibold text-xs"
                        onClick={() => router.push(`/dashboard/learning/${course.id}`)}
                      >
                        Start
                      </Button>
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Checkout Modal */}
      {course && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          item={{
            id: course.id,
            name: `${course.title} (${course.accessLevel.toUpperCase()} Tier)`,
            description: course.subtitle,
            price: 2999,
            type: 'course',
          }}
        />
      )}
    </>
  );
}
