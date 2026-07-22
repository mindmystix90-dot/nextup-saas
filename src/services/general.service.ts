import { supabase } from '@/lib/supabase';
import type { Notification, UserSettings, ActivityLog, FeatureFlag, PricingPlan, ContactSubmission } from '@/types';

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data } = await supabase
    .from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data as Notification[] | null) ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}

export async function fetchSettings(userId: string): Promise<UserSettings | null> {
  const { data } = await supabase.from('settings').select('*').eq('user_id', userId).maybeSingle();
  return data as UserSettings | null;
}

export async function updateSettings(userId: string, data: Partial<UserSettings>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('settings').update({ ...data, updated_at: new Date().toISOString() }).eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function fetchActivityLog(userId: string): Promise<ActivityLog[]> {
  const { data } = await supabase
    .from('activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
  return (data as ActivityLog[] | null) ?? [];
}

export async function fetchAllFeatureFlags(): Promise<FeatureFlag[]> {
  const { data } = await supabase.from('feature_flags').select('*').order('sort_order');
  return (data as FeatureFlag[] | null) ?? [];
}

export async function updateFeatureFlag(id: string, enabled: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('feature_flags').update({ enabled, updated_at: new Date().toISOString() }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const { data } = await supabase.from('pricing_plans').select('*').eq('active', true).order('sort_order');
  return (data as PricingPlan[] | null) ?? [];
}

export async function submitContact(data: { name: string; email: string; subject: string; message: string }): Promise<{ error: string | null }> {
  const { error } = await supabase.from('contact_submissions').insert(data);
  return { error: error?.message ?? null };
}

export async function fetchContactSubmissions(): Promise<ContactSubmission[]> {
  const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
  return (data as ContactSubmission[] | null) ?? [];
}
