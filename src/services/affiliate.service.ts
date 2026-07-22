import { supabase } from '@/lib/supabase';
import type { AffiliateStats, Referral, Profile } from '@/types';
import { generateReferralCode } from '@/lib/utils';

export async function fetchAffiliateStats(userId: string): Promise<AffiliateStats | null> {
  const { data } = await supabase.from('affiliate_stats').select('*').eq('user_id', userId).maybeSingle();
  return data as AffiliateStats | null;
}

export async function fetchReferrals(userId: string): Promise<Referral[]> {
  const { data } = await supabase
    .from('referrals').select('*').eq('referrer_id', userId).order('created_at', { ascending: false });
  return (data as Referral[] | null) ?? [];
}

export async function fetchAllAffiliateStats(): Promise<(AffiliateStats & { user_email: string; user_name: string })[]> {
  const { data } = await supabase
    .from('affiliate_stats').select('*, profiles!inner(email, name)').order('updated_at', { ascending: false });
  return ((data ?? []) as unknown as (AffiliateStats & { user_email: string; user_name: string })[]);
}

export async function enableAffiliate(userId: string): Promise<{ error: string | null }> {
  const existing = await fetchAffiliateStats(userId);
  let code = existing?.referral_code;
  if (!code) {
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
    code = generateReferralCode((profile as { name: string })?.name ?? 'USR');
  }
  const link = `${window.location.origin}/register?ref=${code}`;

  if (existing) {
    const { error } = await supabase.from('affiliate_stats').update({
      enabled: true, referral_code: code, referral_link: link, updated_at: new Date().toISOString(),
    }).eq('user_id', userId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('affiliate_stats').insert({
      user_id: userId, referral_code: code, referral_link: link, enabled: true,
    });
    if (error) return { error: error.message };
  }

  await supabase.from('profiles').update({ affiliate_enabled: true }).eq('id', userId);
  await supabase.from('activity_log').insert({
    user_id: userId, action: 'affiliate_enabled', description: 'Affiliate program enabled',
  });

  return { error: null };
}

export async function disableAffiliate(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('affiliate_stats').update({
    enabled: false, updated_at: new Date().toISOString(),
  }).eq('user_id', userId);
  if (error) return { error: error.message };
  await supabase.from('profiles').update({ affiliate_enabled: false }).eq('id', userId);
  return { error: null };
}

export async function trackReferralClick(referralCode: string): Promise<{ referrerId: string | null }> {
  const { data } = await supabase.from('profiles').select('id').eq('referral_code', referralCode).maybeSingle();
  const referrerId = (data as { id: string } | null)?.id ?? null;
  if (referrerId) {
    await supabase.rpc('increment_affiliate_clicks', { referrer_uid: referrerId });
    await supabase.from('referrals').insert({
      referrer_id: referrerId, referred_name: 'Anonymous', referred_email: '',
      status: 'clicked', commission: 0,
    });
  }
  return { referrerId };
}

export async function adminSetCommissionRate(userId: string, rate: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from('affiliate_stats').update({
    commission_rate: rate, updated_at: new Date().toISOString(),
  }).eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function adminMarkCommissionPaid(userId: string, amount: number): Promise<{ error: string | null }> {
  const stats = await fetchAffiliateStats(userId);
  if (!stats) return { error: 'Affiliate stats not found' };

  const { error: uErr } = await supabase.from('affiliate_stats').update({
    pending_commission: Math.max(0, stats.pending_commission - amount),
    paid_commission: stats.paid_commission + amount,
    available_balance: Math.max(0, stats.available_balance - amount),
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);
  if (uErr) return { error: uErr.message };

  const { error: wErr } = await supabase.from('transactions').insert({
    user_id: userId, type: 'referral', label: 'Affiliate commission payout',
    amount, status: 'completed',
  });
  if (wErr) return { error: wErr.message };

  return { error: null };
}

export async function fetchReferredUsers(referrerId: string): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*').eq('referred_by', referrerId);
  return (data as Profile[] | null) ?? [];
}
