import { supabase } from '@/lib/supabase';
import type { Course, Lesson, CourseAccess, CourseProgress } from '@/types';

export async function fetchCourses(publishedOnly = false): Promise<Course[]> {
  let q = supabase.from('courses').select('*').order('created_at', { ascending: false });
  if (publishedOnly) q = q.in('status', ['published', 'Published']);
  const { data } = await q;
  return (data as Course[] | null) ?? [];
}

export async function fetchCourse(courseId: string): Promise<Course | null> {
  const { data } = await supabase.from('courses').select('*').eq('id', courseId).maybeSingle();
  return data as Course | null;
}

export async function fetchLessons(courseId: string): Promise<Lesson[]> {
  const { data } = await supabase
    .from('lessons').select('*').eq('course_id', courseId).order('lesson_order', { ascending: true });
  return (data as Lesson[] | null) ?? [];
}

export async function fetchCourseAccess(userId: string): Promise<CourseAccess[]> {
  const { data } = await supabase.from('course_access').select('*').eq('user_id', userId);
  return (data as CourseAccess[] | null) ?? [];
}

export async function fetchAccessibleCourseIds(userId: string): Promise<string[]> {
  const access = await fetchCourseAccess(userId);
  return access.map((a) => a.course_id);
}

export async function fetchCourseProgress(userId: string, courseId: string): Promise<CourseProgress[]> {
  const { data } = await supabase
    .from('course_progress').select('*').eq('user_id', userId).eq('course_id', courseId);
  return (data as CourseProgress[] | null) ?? [];
}

export async function fetchAllCourseProgress(userId: string): Promise<CourseProgress[]> {
  const { data } = await supabase
    .from('course_progress').select('*').eq('user_id', userId);
  return (data as CourseProgress[] | null) ?? [];
}

export async function markLessonComplete(
  userId: string, courseId: string, lessonId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('course_progress').upsert({
    user_id: userId, course_id: courseId, lesson_id: lessonId,
    completed: true, completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' });
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    user_id: userId, action: 'lesson_completed', description: 'Completed a lesson',
    metadata: { course_id: courseId, lesson_id: lessonId },
  });

  return { error: null };
}

export async function resetLessonProgress(
  userId: string, lessonId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('course_progress')
    .update({ completed: false, completed_at: null })
    .eq('user_id', userId).eq('lesson_id', lessonId);
  return { error: error?.message ?? null };
}

export async function adminCreateCourse(
  data: { title: string; subtitle?: string; description?: string; instructor: string; category: string; level?: string; price?: string; thumbnail_url?: string; status?: string; is_sales_training?: boolean },
): Promise<{ error: string | null; id: string | null }> {
  const { data: result, error } = await supabase.from('courses').insert({
    title: data.title, subtitle: data.subtitle ?? '', description: data.description ?? '',
    instructor: data.instructor, category: data.category, level: data.level ?? 'Beginner',
    price: data.price ?? '₹0', thumbnail_url: data.thumbnail_url ?? '',
    status: data.status ?? 'Draft', is_sales_training: data.is_sales_training ?? false,
  }).select('id').maybeSingle();
  if (error) return { error: error.message, id: null };
  return { error: null, id: (result as { id: string }).id };
}

export async function adminUpdateCourse(courseId: string, data: Partial<Course>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('courses').update({ ...data, updated_at: new Date().toISOString() }).eq('id', courseId);
  return { error: error?.message ?? null };
}

export async function adminDeleteCourse(courseId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  return { error: error?.message ?? null };
}

export async function adminCreateLesson(
  data: Pick<Lesson, 'course_id' | 'title' | 'content' | 'video_url' | 'pdf_url' | 'zip_url' | 'duration' | 'lesson_order'>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lessons').insert(data);
  if (error) return { error: error.message };

  await supabase.from('courses').update({
    total_lessons: (await supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('course_id', data.course_id)).count ?? 0,
    updated_at: new Date().toISOString(),
  }).eq('id', data.course_id);

  return { error: null };
}

export async function adminUpdateLesson(lessonId: string, data: Partial<Lesson>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lessons').update(data).eq('id', lessonId);
  return { error: error?.message ?? null };
}

export async function adminDeleteLesson(lessonId: string, courseId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) return { error: error.message };

  await supabase.from('courses').update({
    total_lessons: (await supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('course_id', courseId)).count ?? 0,
    updated_at: new Date().toISOString(),
  }).eq('id', courseId);

  return { error: null };
}

export async function grantCourseAccess(userId: string, courseId: string, accessType: 'membership' | 'purchased' = 'purchased'): Promise<{ error: string | null }> {
  const { error } = await supabase.from('course_access').upsert({
    user_id: userId, course_id: courseId, access_type: accessType,
  }, { onConflict: 'user_id,course_id' });
  return { error: error?.message ?? null };
}

export async function revokeCourseAccess(userId: string, courseId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('course_access').delete()
    .eq('user_id', userId).eq('course_id', courseId).eq('access_type', 'purchased');
  return { error: error?.message ?? null };
}

export async function syncMembershipAccess(userId: string, membership: string): Promise<void> {
  if (membership === 'pro' || membership === 'lifetime') {
    const { data: courses } = await supabase.from('courses').select('id').in('status', ['published', 'Published']);
    for (const c of (courses ?? [])) {
      await supabase.from('course_access').upsert({
        user_id: userId, course_id: (c as { id: string }).id, access_type: 'membership',
      }, { onConflict: 'user_id,course_id' });
    }
  } else {
    await supabase.from('course_access').delete()
      .eq('user_id', userId).eq('access_type', 'membership');
  }
}

export async function issueCertificate(
  userId: string, userName: string, courseId: string, courseTitle: string,
): Promise<{ error: string | null }> {
  const certId = `NU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const { error } = await supabase.from('certificates').insert({
    user_id: userId, user_name: userName, course_id: courseId,
    course_title: courseTitle, certificate_id: certId,
  });
  if (error) return { error: error.message };

  await supabase.from('notifications').insert({
    user_id: userId, title: 'Certificate Issued!',
    message: `You've earned a certificate for completing "${courseTitle}".`,
    type: 'success',
  });

  return { error: null };
}
