export type Role = 'superadmin' | 'admin' | 'instructor' | 'student' | 'affiliate' | 'user';
export type Membership = 'starter' | 'pro' | 'lifetime';

export interface BaseUser {
  name: string;
  email: string;
  role: Role;
}

export interface SessionUser extends BaseUser {
  uid: string;
  membership: Membership;
  phone?: string;
  photoURL?: string;
  address?: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: SessionUser;
}

export interface FirestoreProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  role: Role;
  membership: Membership;
  address?: string;
  suspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  title: string;
  instructor: string;
  progress: number;
  lesson: string;
  gradient: string;
  icon: string;
  status: 'in-progress' | 'completed' | 'locked';
}

export interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  instructor: string;
  issueDate: string;
  grade: string;
  gradient: string;
  icon: string;
}

export interface Discussion {
  name: string;
  role: string;
  avatar: string;
  topic: string;
  category: string;
  replies: number;
  likes: number;
  time: string;
  trending?: boolean;
}

export interface LiveClass {
  title: string;
  host: string;
  hostAvatar: string;
  date: string;
  time: string;
  watching: string;
  category: string;
}

// ===== Wallet & Payments =====

export type TransactionType = 'credit' | 'debit' | 'withdrawal' | 'referral' | 'bonus' | 'purchase' | 'refund';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type KycStatus = 'pending' | 'verified' | 'rejected';
export type WithdrawalMethod = 'upi' | 'bank';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface WalletData {
  uid: string;
  balance: number;
  lifetimeEarnings: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  updatedAt?: string;
}

export interface WalletTransaction {
  id: string;
  uid: string;
  type: TransactionType;
  label: string;
  amount: number;
  status: TransactionStatus;
  method?: string;
  date: string;
}

export interface KycInfo {
  uid: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId?: string;
  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface Withdrawal {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  accountHolder?: string;
}

// ===== Pricing =====

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge: string;
  active: boolean;
  sort_order: number;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Affiliate =====

export interface AffiliateStats {
  uid: string;
  referralCode: string;
  clicks: number;
  registrations: number;
  sales: number;
  pendingCommission: number;
  paidCommission: number;
  availableBalance: number;
  updatedAt?: string;
}

export interface Referral {
  id: string;
  referrerUid: string;
  referredUid: string;
  referredName: string;
  referredEmail: string;
  status: 'clicked' | 'registered' | 'purchased';
  commission: number;
  date: string;
}
