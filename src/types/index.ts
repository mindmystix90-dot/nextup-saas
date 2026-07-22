// ===== Core Types =====

export type Role = 'superadmin' | 'admin' | 'instructor' | 'student' | 'affiliate' | 'sales_partner' | 'user';
export type AccountType = 'learning' | 'workplace';
export type Membership = 'starter' | 'pro' | 'lifetime' | 'sales_partner';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  photo_url: string;
  role: Role;
  account_type: AccountType;
  membership: Membership;
  membership_status: MembershipStatus;
  membership_start: string | null;
  membership_expiry: string | null;
  suspended: boolean;
  affiliate_enabled: boolean;
  sales_partner_enabled: boolean;
  sales_partner_status: string;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earnings: number;
  pending_withdrawals: number;
  completed_withdrawals: number;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'credit' | 'debit' | 'withdrawal' | 'referral' | 'bonus' | 'purchase' | 'refund' | 'sales_commission';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  label: string;
  amount: number;
  status: TransactionStatus;
  method: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  theme: string;
  language: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  sort_order: number;
  updated_at: string;
}

// ===== Courses =====

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  price: string;
  icon: string;
  gradient: string;
  thumbnail_url: string;
  lessons: number;
  total_lessons: number;
  duration: string;
  status: 'draft' | 'published' | 'Draft' | 'Published';
  is_sales_training: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  video_url: string;
  pdf_url: string;
  zip_url: string;
  duration: number;
  lesson_order: number;
  created_at: string;
}

export interface CourseAccess {
  id: string;
  user_id: string;
  course_id: string;
  access_type: 'membership' | 'purchased';
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

// ===== KYC =====

export interface Kyc {
  id: string;
  user_id: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc: string;
  upi_id: string;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string;
  submitted_at: string;
  reviewed_at: string | null;
}

// ===== Withdrawals =====

export type WithdrawalMethod = 'upi' | 'bank';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface Withdrawal {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  admin_note: string;
  upi_id: string;
  bank_name: string;
  account_number: string;
  ifsc: string;
  account_holder: string;
  requested_at: string;
  processed_at: string | null;
}

// ===== Payments =====

export type PaymentType = 'membership' | 'course' | 'refund';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'manual';

export interface Payment {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  type: PaymentType;
  item_name: string;
  item_id: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  invoice_id: string;
  refund_amount: number;
  created_at: string;
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
  created_at: string;
  updated_at: string;
}

// ===== Affiliate =====

export interface AffiliateStats {
  id: string;
  user_id: string;
  referral_code: string;
  referral_link: string;
  enabled: boolean;
  clicks: number;
  registrations: number;
  sales: number;
  pending_commission: number;
  paid_commission: number;
  available_balance: number;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referred_name: string;
  referred_email: string;
  status: 'clicked' | 'registered' | 'purchased';
  commission: number;
  created_at: string;
}

// ===== Community =====

export interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  pinned: boolean;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

// ===== Sales Partner =====

export type LeadStatus = 'new' | 'called' | 'interested' | 'follow_up' | 'closed' | 'rejected' | 'no_answer';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  assigned_to: string | null;
  assigned_to_name: string;
  notes: string;
  call_notes: string;
  last_contacted_at: string | null;
  closed_amount: number;
  created_at: string;
  updated_at: string;
}

export interface SalesRecord {
  id: string;
  partner_id: string;
  partner_name: string;
  lead_id: string | null;
  lead_name: string;
  amount: number;
  commission: number;
  status: 'pending' | 'verified' | 'paid';
  verified: boolean;
  verified_at: string | null;
  week_start: string;
  created_at: string;
}

export interface SalesPartnerConfig {
  id: string;
  daily_lead_limit: number;
  commission_per_sale: number;
  weekly_payout: boolean;
  no_min_withdrawal: boolean;
  inactivity_reassign_hours: number;
  updated_at: string;
}

// ===== Certificates =====

export interface Certificate {
  id: string;
  user_id: string;
  user_name: string;
  course_id: string;
  course_title: string;
  certificate_id: string;
  issued_at: string;
}

// ===== Contact =====

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}
