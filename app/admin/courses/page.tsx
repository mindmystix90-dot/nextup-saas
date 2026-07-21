'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Plus, Pencil, Trash2, Filter, Star, Loader2, MoreHorizontal, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { getIcon } from '@/lib/icons';
import { toast } from 'sonner';
import { fetchCourses, createCourse, updateCourse, deleteCourse, type Course, type CourseInput } from '@/services/courses.service';
import { uploadCourseImage, uploadCourseBanner, uploadCourseVideo, uploadCoursePdf } from '@/services/storage.service';

const ICON_OPTIONS = ['Megaphone', 'Bot', 'Briefcase', 'PenTool', 'MessageSquare', 'ShoppingBag', 'Laptop', 'UserCircle', 'BookOpen', 'GraduationCap', 'TrendingUp', 'Rocket'];
const GRADIENT_OPTIONS = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-400',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-400',
  'from-indigo-500 to-blue-500',
  'from-teal-500 to-emerald-400',
  'from-fuchsia-500 to-purple-500',
];

const EMPTY_FORM: CourseInput = {
  title: '',
  subtitle: '',
  instructor: '',
  category: 'Marketing',
  level: 'Beginner',
  price: '₹0',
  icon: 'BookOpen',
  gradient: 'from-blue-500 to-cyan-400',
  lessons: 0,
  duration: '',
  status: 'Draft',
  sort_order: 0,
  image: '',
  banner: '',
  videoUrl: '',
  resourceUrl: '',
  accessLevel: 'public',
  purchaseType: 'free',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState<CourseInput>(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => Array.from(new Set(courses.map((c) => c.category))), [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchQuery =
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.instructor.toLowerCase().includes(query.toLowerCase()) ||
        c.id.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === 'all' || c.category === category;
      const matchLevel = level === 'all' || c.level === level;
      const matchStatus = status === 'all' || c.status === status;
      return matchQuery && matchCategory && matchLevel && matchStatus;
    });
  }, [courses, query, category, level, status]);

  function openCreate() {
    setEditCourse(null);
    setForm({ ...EMPTY_FORM, sort_order: courses.length + 1 });
    setDialogOpen(true);
  }

  function openEdit(c: Course) {
    setEditCourse(c);
    setForm({
      title: c.title,
      subtitle: c.subtitle,
      instructor: c.instructor,
      category: c.category,
      level: c.level,
      price: c.price,
      icon: c.icon,
      gradient: c.gradient,
      lessons: c.lessons,
      duration: c.duration,
      status: c.status,
      sort_order: c.sort_order,
      image: c.image || '',
      banner: c.banner || '',
      videoUrl: c.videoUrl || '',
      resourceUrl: c.resourceUrl || '',
      accessLevel: c.accessLevel || 'public',
      purchaseType: c.purchaseType || 'free',
    });
    setDialogOpen(true);
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const tempId = editCourse?.id || `temp-${Date.now()}`;
      const url = await uploadCourseBanner(tempId, file);
      setForm((f) => ({ ...f, banner: url }));
      toast.success('Banner uploaded');
    } catch { toast.error('Failed to upload banner'); } finally { setUploadingImage(false); }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const tempId = editCourse?.id || `temp-${Date.now()}`;
      const url = await uploadCourseVideo(tempId, 'intro', file);
      setForm((f) => ({ ...f, videoUrl: url }));
      toast.success('Video uploaded');
    } catch { toast.error('Failed to upload video'); } finally { setUploadingImage(false); }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const tempId = editCourse?.id || `temp-${Date.now()}`;
      const url = await uploadCoursePdf(tempId, 'resource', file);
      setForm((f) => ({ ...f, resourceUrl: url }));
      toast.success('PDF uploaded');
    } catch { toast.error('Failed to upload PDF'); } finally { setUploadingImage(false); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const tempId = editCourse?.id || `temp-${Date.now()}`;
      const url = await uploadCourseImage(tempId, file);
      setForm((f) => ({ ...f, image: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.instructor.trim()) {
      toast.error('Title and instructor are required');
      return;
    }
    setSaving(true);
    try {
      if (editCourse) {
        await updateCourse(editCourse.id, form);
        toast.success(`${form.title} updated`);
      } else {
        await createCourse(form);
        toast.success(`${form.title} created`);
      }
      setDialogOpen(false);
      await load();
    } catch {
      toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCourse(deleteTarget.id);
      toast.success(`${deleteTarget.title} deleted`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Failed to delete course');
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={BookOpen}
        title="Courses"
        subtitle="Add, edit and manage the course catalogue."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add course
          </Button>
        }
      />

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All courses ({filtered.length})</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title, instructor, ID…"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead className="hidden md:table-cell">ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Level</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Lessons</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const Icon = getIcon(c.icon);
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{c.title}</p>
                              <p className="text-xs text-muted-foreground">{c.instructor}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{c.id.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{c.level}</Badge></TableCell>
                        <TableCell className="hidden lg:table-cell text-right">{c.lessons}</TableCell>
                        <TableCell className="font-medium">{c.price}</TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => openEdit(c)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(c)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No courses match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCourse ? 'Edit course' : 'New course'}</DialogTitle>
            <DialogDescription>
              {editCourse ? `Updating ${editCourse.title}` : 'Add a new course to the catalogue.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="c-title">Title *</Label>
              <Input id="c-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-sub">Subtitle</Label>
              <Input id="c-sub" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Short tagline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instructor *</Label>
                <Input value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v as CourseInput['level'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as CourseInput['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="₹2,499" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gradient</Label>
                <Select value={form.gradient} onValueChange={(v) => setForm((f) => ({ ...f, gradient: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADIENT_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g.replace(/from-|to-/g, '')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Lessons</Label>
                <Input type="number" value={form.lessons} onChange={(e) => setForm((f) => ({ ...f, lessons: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="12 hours" />
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Access level</Label>
                <Select value={form.accessLevel} onValueChange={(v) => setForm((f) => ({ ...f, accessLevel: v as Course['accessLevel'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Purchase type</Label>
                <Select value={form.purchaseType} onValueChange={(v) => setForm((f) => ({ ...f, purchaseType: v as Course['purchaseType'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="membership_only">Membership Only</SelectItem>
                    <SelectItem value="one_time">One-Time Purchase</SelectItem>
                    <SelectItem value="both">Both Membership + Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course image / thumbnail</Label>
              <div className="flex items-center gap-4">
                {form.image ? (
                  <img src={form.image} alt="Course" className="h-16 w-24 rounded-lg object-cover border border-border" />
                ) : (
                  <span className="flex h-16 w-24 items-center justify-center rounded-lg bg-secondary text-muted-foreground text-xs">No image</span>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload image
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
                {form.image && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setForm((f) => ({ ...f, image: '' }))}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course banner (optional)</Label>
              <div className="flex items-center gap-4">
                {form.banner ? (
                  <img src={form.banner} alt="Banner" className="h-16 w-32 rounded-lg object-cover border border-border" />
                ) : (
                  <span className="flex h-16 w-32 items-center justify-center rounded-lg bg-secondary text-muted-foreground text-xs">No banner</span>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload banner
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingImage} />
                </label>
                {form.banner && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setForm((f) => ({ ...f, banner: '' }))}>Remove</Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Intro video (optional)</Label>
              <div className="flex items-center gap-4">
                {form.videoUrl ? (
                  <span className="text-xs text-success truncate max-w-32">Video uploaded</span>
                ) : (
                  <span className="text-xs text-muted-foreground">No video</span>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload video
                  </span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploadingImage} />
                </label>
                {form.videoUrl && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setForm((f) => ({ ...f, videoUrl: '' }))}>Remove</Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>PDF resource (optional)</Label>
              <div className="flex items-center gap-4">
                {form.resourceUrl ? (
                  <span className="text-xs text-success truncate max-w-32">PDF uploaded</span>
                ) : (
                  <span className="text-xs text-muted-foreground">No PDF</span>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload PDF
                  </span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={uploadingImage} />
                </label>
                {form.resourceUrl && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setForm((f) => ({ ...f, resourceUrl: '' }))}>Remove</Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              {form.image ? (
                <img src={form.image} alt="Preview" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${form.gradient} text-white`}>
                  {(() => { const Icon = getIcon(form.icon); return <Icon className="h-5 w-5" />; })()}
                </span>
              )}
              <div>
                <p className="text-sm font-medium">{form.title || 'Course title'}</p>
                <p className="text-xs text-muted-foreground">{form.instructor || 'Instructor'} · {form.price}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-gradient font-semibold">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editCourse ? 'Save changes' : 'Create course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.title}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
