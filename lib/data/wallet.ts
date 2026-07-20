import type { WalletTransaction } from '@/types';

export const walletBalance = '₹3,199';
export const lifetimeEarnings = '₹18,450';
export const pendingPayouts = '₹2,100';
export const totalWithdrawn = '₹4,500';

export const walletTransactions: WalletTransaction[] = [
  { type: 'in', label: 'Course refund — Content Creation', amount: '+₹2,499', date: '16 Jul 2026' },
  { type: 'out', label: 'Course purchase — AI Tools for Work', amount: '-₹2,999', date: '14 Jul 2026' },
  { type: 'in', label: 'Affiliate payout', amount: '+₹6,000', date: '10 Jul 2026' },
  { type: 'out', label: 'Pro subscription', amount: '-₹999', date: '1 Jul 2026' },
  { type: 'in', label: 'Lifetime upgrade credit', amount: '+₹4,999', date: '28 Jun 2026' },
  { type: 'out', label: 'Withdrawal to UPI · gpay@okicici', amount: '-₹2,500', date: '20 Jun 2026' },
];

export const withdrawalHistory: {
  id: string;
  amount: string;
  method: string;
  status: 'Completed' | 'Pending' | 'Rejected';
  date: string;
}[] = [
  { id: 'WD-2026-0091', amount: '₹2,500', method: 'UPI · gpay@okicici', status: 'Completed', date: '20 Jun 2026' },
  { id: 'WD-2026-0084', amount: '₹2,000', method: 'Bank · HDFC ••8810', status: 'Completed', date: '12 May 2026' },
  { id: 'WD-2026-0072', amount: '₹1,500', method: 'UPI · aarav@okhdfc', status: 'Rejected', date: '28 Apr 2026' },
];

export const paymentMethods: { brand: string; last4: string; exp: string; type: string }[] = [
  { brand: 'Visa', last4: '4242', exp: '08/27', type: 'Credit Card' },
  { brand: 'RuPay', last4: '8810', exp: '11/26', type: 'Debit Card' },
  { brand: 'UPI', last4: 'okicici', exp: '—', type: 'UPI ID' },
];
