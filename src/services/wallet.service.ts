import { supabase } from '@/lib/supabase';
import type { Wallet, Transaction, Withdrawal, WithdrawalMethod, Kyc } from '@/types';

export async function fetchWallet(userId: string): Promise<Wallet | null> {
  const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
  return data as Wallet | null;
}

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const { data } = await supabase
    .from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data as Transaction[] | null) ?? [];
}

export async function fetchWithdrawals(userId: string): Promise<Withdrawal[]> {
  const { data } = await supabase
    .from('withdrawals').select('*').eq('user_id', userId).order('requested_at', { ascending: false });
  return (data as Withdrawal[] | null) ?? [];
}

export async function fetchAllWithdrawals(): Promise<Withdrawal[]> {
  const { data } = await supabase.from('withdrawals').select('*').order('requested_at', { ascending: false });
  return (data as Withdrawal[] | null) ?? [];
}

export async function requestWithdrawal(
  userId: string, userName: string, userEmail: string, amount: number,
  method: WithdrawalMethod, kyc: Kyc,
): Promise<{ error: string | null }> {
  const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle();
  if (!wallet || (wallet as Wallet).balance < amount) {
    return { error: 'Insufficient wallet balance' };
  }

  const withdrawalData: Record<string, unknown> = {
    user_id: userId, user_name: userName, user_email: userEmail,
    amount, method, status: 'pending',
    upi_id: kyc.upi_id, bank_name: kyc.bank_name,
    account_number: kyc.account_number, ifsc: kyc.ifsc, account_holder: kyc.account_holder,
  };

  const { error: wErr } = await supabase.from('withdrawals').insert(withdrawalData);
  if (wErr) return { error: wErr.message };

  await supabase.from('wallets').update({
    balance: (wallet as Wallet).balance - amount,
    pending_withdrawals: ((wallet as Wallet).pending_withdrawals ?? 0) + amount,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);

  await supabase.from('transactions').insert({
    user_id: userId, type: 'withdrawal', label: 'Withdrawal request',
    amount: -amount, status: 'pending', method,
  });

  await supabase.from('activity_log').insert({
    user_id: userId, action: 'withdrawal_requested', description: `Withdrawal of ₹${amount} requested`,
  });

  return { error: null };
}

export async function adminUpdateWithdrawalStatus(
  withdrawalId: string, status: 'approved' | 'rejected' | 'paid', adminNote: string,
): Promise<{ error: string | null }> {
  const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('id', withdrawalId).maybeSingle();
  if (!withdrawal) return { error: 'Withdrawal not found' };
  const w = withdrawal as Withdrawal;

  await supabase.from('withdrawals').update({
    status, admin_note: adminNote,
    processed_at: new Date().toISOString(),
  }).eq('id', withdrawalId);

  if (status === 'rejected') {
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', w.user_id).maybeSingle();
    if (wallet) {
      const wl = wallet as Wallet;
      await supabase.from('wallets').update({
        balance: wl.balance + w.amount,
        pending_withdrawals: Math.max(0, wl.pending_withdrawals - w.amount),
        updated_at: new Date().toISOString(),
      }).eq('user_id', w.user_id);
    }
    await supabase.from('transactions').insert({
      user_id: w.user_id, type: 'credit', label: 'Withdrawal rejected - refund',
      amount: w.amount, status: 'completed',
    });
  } else if (status === 'paid') {
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', w.user_id).maybeSingle();
    if (wallet) {
      const wl = wallet as Wallet;
      await supabase.from('wallets').update({
        pending_withdrawals: Math.max(0, wl.pending_withdrawals - w.amount),
        completed_withdrawals: wl.completed_withdrawals + w.amount,
        updated_at: new Date().toISOString(),
      }).eq('user_id', w.user_id);
    }
    await supabase.from('transactions').update({ status: 'completed' })
      .eq('user_id', w.user_id).eq('type', 'withdrawal').eq('amount', -w.amount);
  }

  await supabase.from('notifications').insert({
    user_id: w.user_id, title: 'Withdrawal Update',
    message: `Your withdrawal of ₹${w.amount} has been ${status}.`,
    type: status === 'paid' ? 'success' : status === 'rejected' ? 'error' : 'info',
  });

  return { error: null };
}

export async function adminCreditWallet(
  userId: string, amount: number, reason: string,
): Promise<{ error: string | null }> {
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
  if (!wallet) return { error: 'Wallet not found' };
  const wl = wallet as Wallet;

  await supabase.from('wallets').update({
    balance: wl.balance + amount,
    lifetime_earnings: wl.lifetime_earnings + (amount > 0 ? amount : 0),
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);

  await supabase.from('transactions').insert({
    user_id: userId, type: 'credit', label: reason,
    amount, status: 'completed',
  });

  return { error: null };
}

export async function adminDebitWallet(
  userId: string, amount: number, reason: string,
): Promise<{ error: string | null }> {
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
  if (!wallet) return { error: 'Wallet not found' };
  const wl = wallet as Wallet;
  if (wl.balance < amount) return { error: 'Insufficient balance' };

  await supabase.from('wallets').update({
    balance: wl.balance - amount,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);

  await supabase.from('transactions').insert({
    user_id: userId, type: 'debit', label: reason,
    amount: -amount, status: 'completed',
  });

  return { error: null };
}

// ===== KYC =====

export async function fetchKyc(userId: string): Promise<Kyc | null> {
  const { data } = await supabase.from('kyc').select('*').eq('user_id', userId).maybeSingle();
  return data as Kyc | null;
}

export async function fetchAllKyc(): Promise<(Kyc & { user_email: string; user_name: string })[]> {
  const { data } = await supabase
    .from('kyc').select('*, profiles!inner(email, name)').order('submitted_at', { ascending: false });
  return ((data ?? []) as unknown as (Kyc & { user_email: string; user_name: string })[]);
}

export async function submitKyc(
  userId: string, accountHolder: string, bankName: string, accountNumber: string,
  ifsc: string, upiId: string,
): Promise<{ error: string | null }> {
  const existing = await fetchKyc(userId);
  if (existing) {
    const { error } = await supabase.from('kyc').update({
      account_holder: accountHolder, bank_name: bankName, account_number: accountNumber,
      ifsc, upi_id: upiId, status: 'pending', rejection_reason: '',
      submitted_at: new Date().toISOString(), reviewed_at: null,
    }).eq('user_id', userId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('kyc').insert({
      user_id: userId, account_holder: accountHolder, bank_name: bankName,
      account_number: accountNumber, ifsc, upi_id: upiId, status: 'pending',
    });
    if (error) return { error: error.message };
  }

  await supabase.from('activity_log').insert({
    user_id: userId, action: 'kyc_submitted', description: 'KYC details submitted for review',
  });

  return { error: null };
}

export async function adminUpdateKycStatus(
  userId: string, status: 'verified' | 'rejected', rejectionReason: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('kyc').update({
    status, rejection_reason: rejectionReason,
    reviewed_at: new Date().toISOString(),
  }).eq('user_id', userId);
  if (error) return { error: error.message };

  await supabase.from('notifications').insert({
    user_id: userId, title: 'KYC Update',
    message: status === 'verified' ? 'Your KYC has been approved! You can now withdraw funds.'
      : `Your KYC was rejected: ${rejectionReason}`,
    type: status === 'verified' ? 'success' : 'error',
  });

  return { error: null };
}

export async function adminUpdateKyc(
  userId: string, data: Partial<Pick<Kyc, 'account_holder' | 'bank_name' | 'account_number' | 'ifsc' | 'upi_id' | 'status'>>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('kyc').update(data).eq('user_id', userId);
  if (error) return { error: error.message };
  return { error: null };
}
