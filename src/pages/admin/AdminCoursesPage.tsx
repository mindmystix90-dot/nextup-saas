import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, Plus, Pencil, Trash2, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner, Button, Input, Textarea, Select, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  fetchCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
} from '@/services/courses.service';
import type { Course, Lesson } from '@/types';

export default function AdminCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [showCourse, setShowCourse] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showLesson, setShowLesson] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '₹0', category: '', level: 'Beginner', thumbnail_url: '', status: 'Draft', is_sales_training: false });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', video_url: '', pdf_url: '', zip_url: '', duration: '0', lesson_order: '1' });
  const [lessonCourseId, setLessonCourseId] = useState('');

  const load = async () => {
    try { setCourses(await fetchCourses()); }
    catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditCourse(null);
    setCourseForm({ title: '', description: '', price: '₹0', category: '', level: 'Beginner', thumbnail_url: '', status: 'Draft', is_sales_training: false });
    setShowCourse(true);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    setCourseForm({ title: c.title, description: c.description, price: String(c.price), category: c.category, level: c.level, thumbnail_url: c.thumbnail_url || '', status: c.status, is_sales_training: c.is_sales_training });
    setShowCourse(true);
  };

  const saveCourse = async () => {
    setSaving(true);
    const data = { title: courseForm.title, subtitle: '', description: courseForm.description, price: courseForm.price, category: courseForm.category, level: courseForm.level, thumbnail_url: courseForm.thumbnail_url, status: courseForm.status as 'draft' | 'published' | 'Draft' | 'Published', is_sales_training: courseForm.is_sales_training, instructor: 'Admin' };
    if (editCourse) {
      const { error } = await adminUpdateCourse(editCourse.id, data);
      if (error) { toast.error(error); setSaving(false); return; }
      toast.success('Course updated');
    } else {
      const { error } = await adminCreateCourse(data);
      if (error) { toast.error(error); setSaving(false); return; }
      toast.success('Course created');
    }
    setShowCourse(false); setSaving(false); load();
  };

  const deleteCourse = async (c: Course) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    const { error } = await adminDeleteCourse(c.id);
    if (error) { toast.error(error); return; }
    toast.success('Course deleted'); load();
  };

  const toggleExpand = async (c: Course) => {
    if (expanded === c.id) { setExpanded(null); return; }
    setExpanded(c.id);
    if (!lessons[c.id]) {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('lessons').select('*').eq('course_id', c.id).order('lesson_order', { ascending: true });
      setLessons({ ...lessons, [c.id]: (data as Lesson[]) || [] });
    }
  };

  const openCreateLesson = (courseId: string) => {
    setEditLesson(null); setLessonCourseId(courseId);
    setLessonForm({ title: '', content: '', video_url: '', pdf_url: '', zip_url: '', duration: '0', lesson_order: String((lessons[courseId]?.length ?? 0) + 1) });
    setShowLesson(true);
  };

  const openEditLesson = (l: Lesson) => {
    setEditLesson(l); setLessonCourseId(l.course_id);
    setLessonForm({ title: l.title, content: l.content || '', video_url: l.video_url || '', pdf_url: l.pdf_url || '', zip_url: l.zip_url || '', duration: String(l.duration || 0), lesson_order: String(l.lesson_order) });
    setShowLesson(true);
  };

  const saveLesson = async () => {
    setSaving(true);
    const data = { course_id: lessonCourseId, title: lessonForm.title, content: lessonForm.content, video_url: lessonForm.video_url, pdf_url: lessonForm.pdf_url, zip_url: lessonForm.zip_url, duration: Number(lessonForm.duration), lesson_order: Number(lessonForm.lesson_order) };
    if (editLesson) {
      const { error } = await adminUpdateLesson(editLesson.id, data);
      if (error) { toast.error(error); setSaving(false); return; }
      toast.success('Lesson updated');
    } else {
      const { error } = await adminCreateLesson(data);
      if (error) { toast.error(error); setSaving(false); return; }
      toast.success('Lesson added');
    }
    setShowLesson(false); setSaving(false);
    const { supabase } = await import('@/lib/supabase');
    const { data: fresh } = await supabase.from('lessons').select('*').eq('course_id', lessonCourseId).order('lesson_order', { ascending: true });
    setLessons({ ...lessons, [lessonCourseId]: (fresh as Lesson[]) || [] });
    load();
  };

  const deleteLesson = async (l: Lesson) => {
    if (!confirm('Delete this lesson?')) return;
    const { error } = await adminDeleteLesson(l.id, l.course_id);
    if (error) { toast.error(error); return; }
    toast.success('Lesson deleted');
    const { supabase } = await import('@/lib/supabase');
    const { data: fresh } = await supabase.from('lessons').select('*').eq('course_id', l.course_id).order('lesson_order', { ascending: true });
    setLessons({ ...lessons, [l.course_id]: (fresh as Lesson[]) || [] });
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage courses and lessons.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Course</Button>
      </div>

      {courses.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to get started." /></Card>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button onClick={() => toggleExpand(c)} className="mt-1 text-muted-foreground hover:text-foreground">
                    {expanded === c.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt="" className="h-12 w-16 rounded object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-16 rounded bg-secondary flex items-center justify-center shrink-0"><BookOpen className="h-5 w-5 text-muted-foreground" /></div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{c.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={c.status === 'published' ? 'success' : 'warning'}>{c.status}</Badge>
                      <Badge variant="secondary">{c.category}</Badge>
                      <Badge variant="outline">{c.price}</Badge>
                      {c.is_sales_training && <Badge variant="default">Sales Training</Badge>}
                      <span className="text-xs text-muted-foreground">{c.total_lessons} lessons · {formatDate(c.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="danger" onClick={() => deleteCourse(c)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>

              {expanded === c.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Lessons</h3>
                    <Button variant="outline" onClick={() => openCreateLesson(c.id)}><Plus className="h-3 w-3 mr-1" /> Add Lesson</Button>
                  </div>
                  {(lessons[c.id] || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No lessons yet.</p>
                  ) : (
                    lessons[c.id].map((l, i) => (
                      <div key={l.id} className="flex items-center gap-3 text-sm py-2 px-3 bg-secondary/30 rounded-lg">
                        <Play className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground w-6">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{l.duration || 0} min</p>
                        </div>
                        <Button variant="outline" onClick={() => openEditLesson(l)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="danger" onClick={() => deleteLesson(l)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCourse} onClose={() => setShowCourse(false)} title={editCourse ? 'Edit Course' : 'New Course'}>
        <div className="space-y-4">
          <Input label="Title" value={courseForm.title} onChange={(v) => setCourseForm({ ...courseForm, title: v })} />
          <Textarea label="Description" value={courseForm.description} onChange={(v) => setCourseForm({ ...courseForm, description: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹)" value={courseForm.price} onChange={(v) => setCourseForm({ ...courseForm, price: v })} />
            <Input label="Category" value={courseForm.category} onChange={(v) => setCourseForm({ ...courseForm, category: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Level" value={courseForm.level} onChange={(v) => setCourseForm({ ...courseForm, level: v })} options={[
              { value: 'Beginner', label: 'Beginner' }, { value: 'Intermediate', label: 'Intermediate' }, { value: 'Advanced', label: 'Advanced' }]} />
            <Select label="Status" value={courseForm.status} onChange={(v) => setCourseForm({ ...courseForm, status: v })} options={[
              { value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
          </div>
          <Input label="Thumbnail URL" value={courseForm.thumbnail_url} onChange={(v) => setCourseForm({ ...courseForm, thumbnail_url: v })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={courseForm.is_sales_training} onChange={(e) => setCourseForm({ ...courseForm, is_sales_training: e.target.checked })} />
            Sales Training Course
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCourse(false)}>Cancel</Button>
            <Button onClick={saveCourse} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showLesson} onClose={() => setShowLesson(false)} title={editLesson ? 'Edit Lesson' : 'Add Lesson'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <Input label="Title" value={lessonForm.title} onChange={(v) => setLessonForm({ ...lessonForm, title: v })} />
          <Textarea label="Content" value={lessonForm.content} onChange={(v) => setLessonForm({ ...lessonForm, content: v })} />
          <Input label="Video URL" value={lessonForm.video_url} onChange={(v) => setLessonForm({ ...lessonForm, video_url: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="PDF URL" value={lessonForm.pdf_url} onChange={(v) => setLessonForm({ ...lessonForm, pdf_url: v })} />
            <Input label="ZIP URL" value={lessonForm.zip_url} onChange={(v) => setLessonForm({ ...lessonForm, zip_url: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (min)" type="number" value={lessonForm.duration} onChange={(v) => setLessonForm({ ...lessonForm, duration: v })} />
            <Input label="Order" type="number" value={lessonForm.lesson_order} onChange={(v) => setLessonForm({ ...lessonForm, lesson_order: v })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowLesson(false)}>Cancel</Button>
            <Button onClick={saveLesson} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
