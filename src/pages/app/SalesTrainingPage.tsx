import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BookMarked, Play, CheckCircle, Clock } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCourses, fetchAllCourseProgress, fetchAccessibleCourseIds,
} from '@/services/courses.service';
import type { Course, CourseProgress } from '@/types';

export default function SalesTrainingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [accessIds, setAccessIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [all, access, prog] = await Promise.all([
          fetchCourses(true),
          fetchAccessibleCourseIds(user.id),
          fetchAllCourseProgress(user.id),
        ]);
        setCourses(all.filter((c) => c.is_sales_training));
        setAccessIds(access);
        setProgress(prog);
      } catch { toast.error('Failed to load training'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <Spinner />;

  const completedLessons = (courseId: string) => progress.filter((p) => p.course_id === courseId && p.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Sales Training</h1>
        <p className="text-muted-foreground mt-1">Courses to sharpen your sales skills.</p>
      </div>

      {courses.length === 0 ? (
        <Card><EmptyState icon={BookMarked} title="No training courses" description="Sales training courses will appear here." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((c) => {
            const hasAccess = accessIds.includes(c.id);
            const done = completedLessons(c.id);
            const pct = c.total_lessons > 0 ? Math.round((done / c.total_lessons) * 100) : 0;
            return (
              <Card key={c.id}>
                <div className="flex gap-4">
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt="" className="h-20 w-28 rounded object-cover shrink-0" />
                  ) : (
                    <div className="h-20 w-28 rounded bg-secondary flex items-center justify-center shrink-0">
                      <BookMarked className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary">{c.level}</Badge>
                      <Badge variant="outline">{c.total_lessons} lessons</Badge>
                      {pct === 100 ? (
                        <Badge variant="success"><CheckCircle className="h-3 w-3 inline mr-1" />Completed</Badge>
                      ) : pct > 0 ? (
                        <Badge variant="warning">{pct}% done</Badge>
                      ) : hasAccess ? (
                        <Badge variant="default">Not started</Badge>
                      ) : null}
                    </div>
                    {hasAccess && pct > 0 && pct < 100 && (
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                </div>
                {hasAccess && (
                  <Link to={`/app/courses/${c.id}`}>
                    <Button variant="outline" className="w-full mt-3"><Play className="h-3 w-3 mr-1" /> Continue</Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
