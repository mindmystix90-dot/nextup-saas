import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CheckCircle2, Circle, FileText, Video, Package, ArrowLeft, Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Spinner, EmptyState, Button, Badge } from '@/components/ui';
import {
  fetchCourses, fetchLessons, fetchAccessibleCourseIds,
  fetchCourseProgress, markLessonComplete,
} from '@/services/courses.service';
import type { Course, Lesson, CourseProgress } from '@/types';

export default function CourseViewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!user || !courseId) return;
    let active = true;
    (async () => {
      try {
        const [allCourses, ids, les, prog] = await Promise.all([
          fetchCourses(false),
          fetchAccessibleCourseIds(user.id),
          fetchLessons(courseId),
          fetchCourseProgress(user.id, courseId),
        ]);
        if (!active) return;
        const c = allCourses.find((x) => x.id === courseId) ?? null;
        setCourse(c);
        setHasAccess(ids.includes(courseId));
        setLessons(les);
        setProgress(prog);
        setActiveLesson(les[0] ?? null);
      } catch {
        toast.error('Failed to load course');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user, courseId]);

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const handleComplete = async () => {
    if (!user || !courseId || !activeLesson) return;
    setCompleting(true);
    const res = await markLessonComplete(user.id, courseId, activeLesson.id);
    setCompleting(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success('Lesson marked complete!');
    setProgress((prev) => {
      const exists = prev.find((p) => p.lesson_id === activeLesson.id);
      if (exists) return prev.map((p) => p.lesson_id === activeLesson.id ? { ...p, completed: true } : p);
      return [...prev, { id: '', user_id: user.id, course_id: courseId, lesson_id: activeLesson.id, completed: true, completed_at: new Date().toISOString(), created_at: '' }];
    });
    // auto-advance
    const idx = lessons.findIndex((l) => l.id === activeLesson.id);
    if (idx >= 0 && idx < lessons.length - 1) setActiveLesson(lessons[idx + 1]);
  };

  if (loading) return <Spinner />;

  if (!course) {
    return <EmptyState icon={FileText} title="Course not found" description="This course may have been removed." />;
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Link to="/app/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
        <Card className="text-center">
          <div className="p-4 rounded-2xl bg-secondary/50 w-fit mx-auto mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold font-display">You don't have access to this course</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Upgrade your membership or purchase this course to unlock it.</p>
          <Link to="/app/courses" className="btn-primary">Browse Courses</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/app/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {course.category && <Badge variant="secondary">{course.category}</Badge>}
          {course.level && <Badge variant="outline">{course.level}</Badge>}
        </div>
        <h1 className="text-2xl font-bold font-display">{course.title}</h1>
        <p className="text-muted-foreground mt-1">{course.description}</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress: {completedCount}/{lessons.length} lessons</span>
          <span className="text-sm font-bold">{progressPct}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold font-display">Lessons</h2>
          </div>
          {lessons.length === 0 ? (
            <EmptyState icon={Circle} title="No lessons yet" description="Lessons will appear here." />
          ) : (
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {lessons.map((lesson, idx) => {
                const done = completedIds.has(lesson.id);
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-4 flex items-start gap-3 hover:bg-secondary/30 transition ${isActive ? 'bg-secondary/40' : ''}`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                        {idx + 1}. {lesson.title}
                      </p>
                      {lesson.duration > 0 && (
                        <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          {!activeLesson ? (
            <EmptyState icon={Video} title="Select a lesson" description="Choose a lesson from the list to start learning." />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-semibold font-display">{activeLesson.title}</h2>
                {completedIds.has(activeLesson.id) && <Badge variant="success">Completed</Badge>}
              </div>

              {activeLesson.video_url && (
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  <video src={activeLesson.video_url} controls className="w-full h-full" />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {activeLesson.pdf_url && (
                  <a href={activeLesson.pdf_url} target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" /> View PDF
                  </a>
                )}
                {activeLesson.zip_url && (
                  <a href={activeLesson.zip_url} download className="btn-outline inline-flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" /> Download Resources
                  </a>
                )}
              </div>

              {activeLesson.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activeLesson.content}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button onClick={handleComplete} disabled={completing || completedIds.has(activeLesson.id)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {completedIds.has(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
