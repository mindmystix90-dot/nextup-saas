import { supabase } from '@/lib/supabase/client';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: string;
  icon: string;
  gradient: string;
  lessons: number;
  duration: string;
  status: 'Published' | 'Draft';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CourseInput = Omit<Course, 'id' | 'created_at' | 'updated_at'>;

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as Course[];
}

export async function fetchPublishedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'Published')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as Course[];
}

export async function createCourse(input: CourseInput): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Course;
}

export async function updateCourse(id: string, updates: Partial<CourseInput>): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}
