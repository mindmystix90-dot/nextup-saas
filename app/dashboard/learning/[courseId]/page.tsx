'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  Bookmark,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  Send,
  Award,
  BookOpen,
  FileEdit,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchCourses,
  fetchUserPurchasedCourses,
  canAccessCourse,
  type Course,
} from '@/services/courses.service';
import {
  fetchCourseLessons,
  fetchCompletedLessonIds,
  toggleLessonCompletion,
  fetchUserBookmarks,
  addBookmark,
  deleteBookmark,
  fetchUserNotes,
  saveNote,
  deleteNote,
  fetchLessonDiscussions,
  postLessonDiscussion,
} from '@/services/learning.service';
import { CheckoutModal } from '@/components/checkout/checkout-modal';
import type {
  Lesson,
  Membership,
  StudentBookmark,
  StudentNote,
  LessonDiscussion,
} from '@/types';
import { toast } from 'sonner';

export default function CoursePlayerPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Tabs state
  const [bookmarks, setBookmarks] = useState<StudentBookmark[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [discussions, setDiscussions] = useState<LessonDiscussion[]>([]);

  // Inputs
  const [noteContent, setNoteContent] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [isPostingQuestion, setIsPostingQuestion] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const membership = (user?.membership || 'starter') as Membership;

  useEffect(() => {
    if (!courseId || !user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [allCourses, courseLessons, userPurchased, userCompleted] = await Promise.all([
          fetchCourses(),
          fetchCourseLessons(courseId),
          fetchUserPurchasedCourses(user.uid),
          fetchCompletedLessonIds(user.uid, courseId),
        ]);

        const found = allCourses.find((c) => c.id === courseId) || null;
        setCourse(found);
        setLessons(courseLessons);
        setPurchased(userPurchased);
        setCompletedLessonIds(userCompleted);

        const pct = courseLessons.length > 0 ? Math.round((userCompleted.length / courseLessons.length) * 100) : 0;
        setProgressPercent(pct);

        // Select first uncompleted lesson, or first lesson
        const uncompleted = courseLessons.find((l) => !userCompleted.includes(l.id));
        setActiveLesson(uncompleted || courseLessons[0] || null);
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, user?.uid]);

  // Load lesson tabs data
  useEffect(() => {
    if (!user?.uid || !courseId || !activeLesson?.id) return;
    (async () => {
      try {
        const [b, n, d] = await Promise.all([
          fetchUserBookmarks(user.uid, courseId),
          fetchUserNotes(user.uid, courseId),
          fetchLessonDiscussions(courseId, activeLesson.id),
        ]);
        setBookmarks(b);
        setNotes(n);
        setDiscussions(d);

        // Fill existing note for current lesson if exists
        const currentNote = n.find((note) => note.lessonId === activeLesson.id);
        setNoteContent(currentNote?.content || '');
      } catch {
        /* best-effort */
      }
    })();
  }, [user?.uid, courseId, activeLesson?.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center">
          <h2 className="font-display text-2xl font-bold">Course Not Found</h2>
          <Button asChild className="mt-4 bg-brand-gradient">
            <Link href="/dashboard/learning">Return to My Learning</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isUnlocked = canAccessCourse(membership, course, purchased);

  // Package Permission Protection
  if (!isUnlocked) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl py-12 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <Badge className="bg-warning/10 text-warning border-transparent mb-2">Package Permission Required</Badge>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{course.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This course is included in the <span className="font-semibold text-foreground">{course.accessLevel.toUpperCase()}</span> Package or higher. Upgrade your membership or purchase access to unlock all lessons.
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <Button variant="outline" asChild className="font-semibold">
              <Link href="/dashboard/learning"><ChevronLeft className="mr-1.5 h-4 w-4" /> Return to Learning</Link>
            </Button>
            <Button onClick={() => setIsCheckoutOpen(true)} className="bg-brand-gradient font-semibold">
              <Sparkles className="mr-1.5 h-4 w-4" /> Unlock Package
            </Button>
          </div>
        </div>

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
      </DashboardLayout>
    );
  }

  const isCurrentLessonCompleted = activeLesson ? completedLessonIds.includes(activeLesson.id) : false;

  const handleToggleComplete = async () => {
    if (!activeLesson || !user) return;
    try {
      const res = await toggleLessonCompletion(
        user.uid,
        course.id,
        activeLesson.id,
        lessons.length,
        course.title,
        user.name
      );
      setCompletedLessonIds(res.completedLessons);
      setProgressPercent(res.progressPercent);

      if (res.isCourseCompleted) {
        toast.success('🎉 Congratulations! You completed 100% of this course! Certificate issued.');
      } else {
        toast.success(!isCurrentLessonCompleted ? 'Lesson marked as complete!' : 'Lesson status updated');
      }
    } catch {
      toast.error('Failed to update lesson status.');
    }
  };

  const handleSaveNote = async () => {
    if (!activeLesson || !user || !noteContent.trim()) return;
    setIsSavingNote(true);
    try {
      const existing = notes.find((n) => n.lessonId === activeLesson.id);
      const saved = await saveNote({
        id: existing?.id,
        uid: user.uid,
        courseId: course.id,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        content: noteContent,
      });
      setNotes((prev) => [saved, ...prev.filter((n) => n.id !== saved.id)]);
      toast.success('Note saved successfully!');
    } catch {
      toast.error('Failed to save note.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleAddBookmark = async () => {
    if (!activeLesson || !user) return;
    setIsAddingBookmark(true);
    try {
      const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
      const newB = await addBookmark({
        uid: user.uid,
        courseId: course.id,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        timestampSeconds: currentTime,
        note: bookmarkNote || undefined,
      });
      setBookmarks((prev) => [newB, ...prev]);
      setBookmarkNote('');
      toast.success('Bookmark added!');
    } catch {
      toast.error('Failed to add bookmark.');
    } finally {
      setIsAddingBookmark(false);
    }
  };

  const handlePostQuestion = async () => {
    if (!activeLesson || !user || !questionText.trim()) return;
    setIsPostingQuestion(true);
    try {
      const newD = await postLessonDiscussion({
        courseId: course.id,
        lessonId: activeLesson.id,
        uid: user.uid,
        authorName: user.name || 'Student',
        authorAvatar: user.photoURL,
        message: questionText,
      });
      setDiscussions((prev) => [newD, ...prev]);
      setQuestionText('');
      toast.success('Question posted to lesson discussion!');
    } catch {
      toast.error('Failed to post question.');
    } finally {
      setIsPostingQuestion(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Breadcrumb & Progress Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/learning" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-1">
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back to My Learning
            </Link>
            <h1 className="font-display text-xl md:text-2xl font-bold">{course.title}</h1>
          </div>

          <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-2xl border border-border min-w-[240px]">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            {progressPercent === 100 && (
              <Badge className="bg-success/10 text-success border-transparent shrink-0">
                <Award className="mr-1 h-3.5 w-3.5" /> Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Main Grid: Player on Left, Playlist on Right */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Lesson Player & Details (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-premium overflow-hidden border-border">
              {/* Media Player Container */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {activeLesson?.type === 'video' ? (
                  <video
                    ref={videoRef}
                    key={activeLesson.id}
                    src={activeLesson.videoUrl}
                    controls
                    autoPlay={false}
                    className="w-full h-full object-contain"
                  />
                ) : activeLesson?.type === 'pdf' ? (
                  <div className="w-full h-full p-6 bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-4">
                    <FileText className="h-16 w-16 text-primary" />
                    <div>
                      <h3 className="font-bold text-lg">{activeLesson.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">PDF Study Guide & Reference Manual</p>
                    </div>
                    <Button asChild size="sm" className="bg-brand-gradient font-semibold">
                      <a href={activeLesson.pdfUrl} target="_blank" rel="noreferrer">
                        <FileText className="mr-1.5 h-4 w-4" /> Open PDF Document
                      </a>
                    </Button>
                  </div>
                ) : activeLesson?.type === 'download' ? (
                  <div className="w-full h-full p-6 bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-4">
                    <Download className="h-16 w-16 text-primary" />
                    <div>
                      <h3 className="font-bold text-lg">{activeLesson.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Project Starter Files & Resources</p>
                    </div>
                    <Button asChild size="sm" className="bg-brand-gradient font-semibold">
                      <a href={activeLesson.downloadUrl || '#'} download>
                        <Download className="mr-1.5 h-4 w-4" /> Download Files
                      </a>
                    </Button>
                  </div>
                ) : (
                  <PlayCircle className="h-16 w-16 text-white/50" />
                )}
              </div>

              {/* Lesson Action Controls */}
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold">{activeLesson?.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{activeLesson?.description}</p>
                  </div>

                  <Button
                    onClick={handleToggleComplete}
                    variant={isCurrentLessonCompleted ? 'outline' : 'default'}
                    className={`shrink-0 font-semibold ${!isCurrentLessonCompleted ? 'bg-brand-gradient' : 'text-success border-success'}`}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isCurrentLessonCompleted ? 'Completed' : 'Mark as Complete'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Tabs: Notes, Bookmarks, Q&A */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50 rounded-2xl p-1">
                <TabsTrigger value="notes" className="text-xs font-semibold">
                  <FileEdit className="mr-1.5 h-3.5 w-3.5" /> Notes
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="text-xs font-semibold">
                  <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Bookmarks
                </TabsTrigger>
                <TabsTrigger value="discussions" className="text-xs font-semibold">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Q&A Discussion
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Notes */}
              <TabsContent value="notes" className="mt-4 space-y-4">
                <Card className="card-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Personal Lesson Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Take personal notes for this lesson..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="min-h-[100px] text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={isSavingNote || !noteContent.trim()}
                      className="bg-brand-gradient font-semibold text-xs"
                    >
                      {isSavingNote ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileEdit className="mr-1.5 h-3.5 w-3.5" />}
                      Save Note
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Bookmarks */}
              <TabsContent value="bookmarks" className="mt-4 space-y-4">
                <Card className="card-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Bookmark Lesson Moment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Bookmark note (optional)..."
                        value={bookmarkNote}
                        onChange={(e) => setBookmarkNote(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddBookmark}
                        disabled={isAddingBookmark}
                        className="bg-brand-gradient font-semibold text-xs shrink-0"
                      >
                        {isAddingBookmark ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1 h-3.5 w-3.5" />} Bookmark
                      </Button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {bookmarks.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No bookmarks saved for this course yet.</p>
                      ) : (
                        bookmarks.map((b) => (
                          <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 text-xs border border-border">
                            <div>
                              <p className="font-semibold">{b.lessonTitle}</p>
                              {b.note && <p className="text-muted-foreground mt-0.5">{b.note}</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={async () => {
                                await deleteBookmark(b.id);
                                setBookmarks((prev) => prev.filter((x) => x.id !== b.id));
                                toast.success('Bookmark removed.');
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Q&A */}
              <TabsContent value="discussions" className="mt-4 space-y-4">
                <Card className="card-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Lesson Questions & Discussion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question about this lesson..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={handlePostQuestion}
                        disabled={isPostingQuestion || !questionText.trim()}
                        className="bg-brand-gradient font-semibold text-xs shrink-0"
                      >
                        {isPostingQuestion ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />} Post
                      </Button>
                    </div>

                    <div className="space-y-3 pt-2">
                      {discussions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No questions posted yet for this lesson. Be the first!</p>
                      ) : (
                        discussions.map((d) => (
                          <div key={d.id} className="p-3.5 rounded-xl bg-secondary/40 text-xs space-y-1.5 border border-border">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground">{d.authorName}</span>
                              <span className="text-[10px] text-muted-foreground">Recently</span>
                            </div>
                            <p className="text-muted-foreground">{d.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Course Playlist Sidebar (1 column) */}
          <div>
            <Card className="card-premium sticky top-24">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Course Playlist</span>
                  <span className="text-xs text-muted-foreground font-normal">{completedLessonIds.length}/{lessons.length} Done</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, idx) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-primary/10 border border-primary/30 text-foreground'
                          : 'hover:bg-secondary/60 text-muted-foreground'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : isActive ? (
                          <PlayCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold line-clamp-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{lesson.duration}</p>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
