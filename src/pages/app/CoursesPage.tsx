import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, Search, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, EmptyState, Spinner, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { fetchCourses, fetchAccessibleCourseIds } from '@/services/courses.service';
import type { Course } from '@/types';

export default function CoursesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [accessIds, setAccessIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const [c, ids] = await Promise.all([
          fetchCourses(true),
          fetchAccessibleCourseIds(user.id),
        ]);
        if (!active) return;
        setCourses(c);
        setAccessIds(ids);
      } catch {
        toast.error('Failed to load courses');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Courses</h1>
        <p className="text-muted-foreground mt-1">Browse and learn from our course library.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search courses..."
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field sm:w-48"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet."
          description={search || category !== 'all' ? 'Try adjusting your search or filters.' : 'Check back soon for new courses.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => {
            const hasAccess = accessIds.includes(course.id);
            return (
              <Card key={course.id} className="flex flex-col p-0 overflow-hidden">
                <div className="h-40 bg-secondary/50 flex items-center justify-center overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {course.category && <Badge variant="secondary">{course.category}</Badge>}
                    {course.level && <Badge variant="outline">{course.level}</Badge>}
                    {hasAccess && <Badge variant="success"><CheckCircle2 className="h-3 w-3 inline mr-1" />Enrolled</Badge>}
                  </div>
                  <h3 className="font-semibold font-display mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{course.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold">{course.price}</span>
                    {hasAccess ? (
                      <Link to={`/app/courses/${course.id}`} className="btn-primary inline-flex items-center gap-1 text-sm">
                        <PlayCircle className="h-4 w-4" /> Continue
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                        <Lock className="h-4 w-4" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
