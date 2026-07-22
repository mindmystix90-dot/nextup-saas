import { supabase } from '@/lib/supabase';
import type { Lead, LeadStatus, SalesRecord, SalesPartnerConfig } from '@/types';
import { getWeekStart } from '@/lib/utils';

// ===== Leads =====

export async function fetchLeads(partnerId?: string): Promise<Lead[]> {
  let q = supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (partnerId) q = q.eq('assigned_to', partnerId);
  const { data } = await q;
  return (data as Lead[] | null) ?? [];
}

export async function fetchUnassignedLeads(): Promise<Lead[]> {
  const { data } = await supabase.from('leads').select('*').is('assigned_to', null).order('created_at', { ascending: false });
  return (data as Lead[] | null) ?? [];
}

export async function adminCreateLead(data: { name: string; email: string; phone: string; source: string; notes: string }): Promise<{ error: string | null }> {
  const { error } = await supabase.from('leads').insert({ ...data, status: 'new' });
  return { error: error?.message ?? null };
}

export async function adminAssignLead(leadId: string, partnerId: string, partnerName: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('leads').update({
    assigned_to: partnerId, assigned_to_name: partnerName,
    updated_at: new Date().toISOString(),
  }).eq('id', leadId);
  if (error) return { error: error.message };

  await supabase.from('notifications').insert({
    user_id: partnerId, title: 'New Lead Assigned',
    message: 'A new lead has been assigned to you. Check your CRM.',
    type: 'info',
  });

  return { error: null };
}

export async function adminBulkAssignLeads(partnerId: string, partnerName: string, count: number): Promise<{ error: string | null; assigned: number }> {
  const unassigned = await fetchUnassignedLeads();
  const toAssign = unassigned.slice(0, count);
  for (const lead of toAssign) {
    await adminAssignLead(lead.id, partnerId, partnerName);
  }
  return { error: null, assigned: toAssign.length };
}

export async function updateLeadStatus(
  leadId: string, status: LeadStatus, callNotes: string, partnerId: string,
): Promise<{ error: string | null }> {
  const updates: Record<string, unknown> = {
    status, call_notes: callNotes,
    last_contacted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('leads').update(updates).eq('id', leadId);
  if (error) return { error: error.message };

  if (status === 'closed') {
    await supabase.from('notifications').insert({
      user_id: partnerId, title: 'Lead Closed!',
      message: 'A lead has been marked as closed. Awaiting admin verification.',
      type: 'success',
    });
  }

  return { error: null };
}

export async function adminReassignLead(leadId: string, newPartnerId: string, newPartnerName: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('leads').update({
    assigned_to: newPartnerId, assigned_to_name: newPartnerName,
    updated_at: new Date().toISOString(),
  }).eq('id', leadId);
  return { error: error?.message ?? null };
}

export async function adminDeleteLead(leadId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('leads').delete().eq('id', leadId);
  return { error: error?.message ?? null };
}

// ===== Sales Records =====

export async function fetchSalesRecords(partnerId: string): Promise<SalesRecord[]> {
  const { data } = await supabase.from('sales_records').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
  return (data as SalesRecord[] | null) ?? [];
}

export async function fetchAllSalesRecords(): Promise<SalesRecord[]> {
  const { data } = await supabase.from('sales_records').select('*').order('created_at', { ascending: false });
  return (data as SalesRecord[] | null) ?? [];
}

export async function createSalesRecord(
  partnerId: string, partnerName: string, leadId: string, leadName: string, amount: number, commission: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('sales_records').insert({
    partner_id: partnerId, partner_name: partnerName,
    lead_id: leadId, lead_name: leadName, amount, commission,
    status: 'pending', verified: false, week_start: getWeekStart(),
  });
  return { error: error?.message ?? null };
}

export async function adminVerifySales(salesId: string, commission: number): Promise<{ error: string | null }> {
  const { data: sale } = await supabase.from('sales_records').select('*').eq('id', salesId).maybeSingle();
  if (!sale) return { error: 'Sales record not found' };
  const s = sale as SalesRecord;

  const { error } = await supabase.from('sales_records').update({
    verified: true, verified_at: new Date().toISOString(), status: 'verified', commission,
  }).eq('id', salesId);
  if (error) return { error: error.message };

  // Credit commission to wallet
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', s.partner_id).maybeSingle();
  if (wallet) {
    const w = wallet as { balance: number; lifetime_earnings: number; updated_at: string };
    await supabase.from('wallets').update({
      balance: w.balance + commission,
      lifetime_earnings: w.lifetime_earnings + commission,
      updated_at: new Date().toISOString(),
    }).eq('user_id', s.partner_id);
  }

  await supabase.from('transactions').insert({
    user_id: s.partner_id, type: 'sales_commission', label: `Sales commission for ${s.lead_name}`,
    amount: commission, status: 'completed',
  });

  await supabase.from('notifications').insert({
    user_id: s.partner_id, title: 'Commission Credited!',
    message: `₹${commission} commission has been credited to your wallet for closing ${s.lead_name}.`,
    type: 'success',
  });

  await supabase.from('activity_log').insert({
    user_id: s.partner_id, action: 'sales_commission', description: `Commission of ₹${commission} credited`,
  });

  return { error: null };
}

// ===== Sales Partner Config =====

export async function fetchSalesConfig(): Promise<SalesPartnerConfig | null> {
  const { data } = await supabase.from('sales_partner_config').select('*').eq('id', 'default').maybeSingle();
  return data as SalesPartnerConfig | null;
}

export async function updateSalesConfig(data: Partial<SalesPartnerConfig>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('sales_partner_config').update({
    ...data, updated_at: new Date().toISOString(),
  }).eq('id', 'default');
  return { error: error?.message ?? null };
}

// ===== Sales Partner Dashboard Stats =====

export async function fetchSalesDashboardStats(partnerId: string) {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getWeekStart();

  const [leadsRes, todayLeadsRes, closedRes, rejectedRes, salesRes, followUpRes] = await Promise.all([
    supabase.from('leads').select('*').eq('assigned_to', partnerId),
    supabase.from('leads').select('*').eq('assigned_to', partnerId).gte('created_at', today),
    supabase.from('leads').select('*').eq('assigned_to', partnerId).eq('status', 'closed'),
    supabase.from('leads').select('*').eq('assigned_to', partnerId).eq('status', 'rejected'),
    supabase.from('sales_records').select('*').eq('partner_id', partnerId).gte('week_start', weekStart),
    supabase.from('leads').select('*').eq('assigned_to', partnerId).eq('status', 'follow_up'),
  ]);

  const allLeads = (leadsRes.data ?? []) as Lead[];
  const todayLeads = (todayLeadsRes.data ?? []) as Lead[];
  const closed = (closedRes.data ?? []) as Lead[];
  const rejected = (rejectedRes.data ?? []) as Lead[];
  const sales = (salesRes.data ?? []) as SalesRecord[];
  const followUps = (followUpRes.data ?? []) as Lead[];

  const calledToday = allLeads.filter((l) => l.last_contacted_at && l.last_contacted_at.startsWith(today) && l.status !== 'new').length;
  const weeklyEarnings = sales.filter((s) => s.verified).reduce((sum, s) => sum + Number(s.commission), 0);
  const performanceScore = allLeads.length > 0 ? Math.round((closed.length / allLeads.length) * 100) : 0;

  return {
    totalLeads: allLeads.length,
    todayLeads: todayLeads.length,
    todayCalls: calledToday,
    followUps: followUps.length,
    closedSales: closed.length,
    rejectedLeads: rejected.length,
    weeklyEarnings,
    performanceScore,
    recentLeads: allLeads.slice(0, 5),
  };
}
