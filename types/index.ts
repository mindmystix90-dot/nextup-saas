export type Role = 'superadmin' | 'admin' | 'instructor' | 'student' | 'affiliate' | 'user';
export type Membership = 'starter' | 'pro' | 'lifetime';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type CourseAccessLevel = 'public' | 'starter' | 'pro' | 'lifetime';
export type PurchaseType = 'free' | 'membership_only' | 'one_time' | 'both';

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
  membershipStatus?: MembershipStatus;
  membershipStart?: string;
  membershipExpiry?: string;
  address?: string;
  suspended?: boolean;
  purchasedCourses?: string[];
  accessibleCourses?: string[];
  completedCourses?: string[];
  affiliateEnabled?: boolean;
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
  recipientUid?: string;
  courseName: string;
  courseId?: string;
  instructor: string;
  issueDate: string;
  grade: string;
  gradient: string;
  icon: string;
  status?: 'issued' | 'revoked' | 'active';
  certificateUrl?: string;
}

export interface Discussion {
  id?: string;
  name?: string;
  role?: string;
  avatar?: string;
  topic?: string;
  category: string;
  replies: number;
  likes: number;
  time?: string;
  timeAgo?: string;
  trending?: boolean;
  title?: string;
  content?: string;
  authorName?: string;
  authorAvatar?: string;
  authorUid?: string;
  isPinned?: boolean;
  repliesCount?: number;
  likesCount?: number;
  createdAt?: string;
}

export interface MentorPost {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  authorName: string;
  authorAvatar?: string;
  likes?: number;
  comments?: number;
  createdAt?: string;
}

export interface StudentQuestion {
  id?: string;
  question: string;
  courseTitle: string;
  authorName: string;
  authorAvatar?: string;
  replies?: number;
  createdAt?: string;
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

export type TransactionType =
  | 'credit'
  | 'debit'
  | 'withdrawal'
  | 'referral'
  | 'referral_commission'
  | 'purchase'
  | 'microtask'
  | 'daily_reward'
  | 'admin_credit'
  | 'bonus'
  | 'cashback'
  | 'penalty'
  | 'refund';

export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type KycStatus = 'pending' | 'verified' | 'rejected';
export type WithdrawalMethod = string;
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'failed';

export interface PaymentMethodField {
  key: string;
  label: string;
  placeholder?: string;
  required: boolean;
  type?: 'text' | 'email' | 'number';
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  minimumWithdraw: number;
  maximumWithdraw: number;
  withdrawFee: number;
  withdrawFeeType: 'fixed' | 'percentage';
  processingTime: string;
  instructions: string;
  requiredFields: PaymentMethodField[];
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletData {
  uid: string;
  balance: number;
  pendingBalance?: number;
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
  referenceId?: string;
  date: string;
  source?: string;
  beforeBalance?: number;
  afterBalance?: number;
  timestamp?: string;
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
  fee?: number;
  netAmount?: number;
  method: WithdrawalMethod;
  methodName?: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  paidAt?: string;
  adminNote?: string;
  paymentDetails?: Record<string, string>;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  accountHolder?: string;
  // Payment Proof Fields
  transactionId?: string;
  referenceNumber?: string;
  paymentNotes?: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
}

export interface GlobalWithdrawalSettings {
  withdrawalsEnabled: boolean;
  maintenanceMode: boolean;
  globalMinimumWithdrawal: number;
  globalMaximumWithdrawal: number;
  dailyWithdrawalLimit: number;
  weeklyWithdrawalLimit: number;
  maximumPendingWithdrawals: number;
  withdrawalCooldownHours: number;
  requireKYC: boolean;
  autoApprove: boolean;
  allowWeekendWithdrawals: boolean;
  allowHolidayWithdrawals: boolean;
  adminMessage: string;
  updatedAt?: string;
}

export interface PlatformFinance {
  currentPlatformBalance: number;
  pendingWithdrawalAmount: number;
  reservedBalance: number;
  totalPaidOut: number;
  totalWithdrawalFees: number;
  platformProfit: number;
  affiliateProfit: number;
  microtaskProfit: number;
  monthlyProfit: number;
  dailyProfit: number;
  updatedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  adminUid: string;
  adminName: string;
  adminEmail?: string;
  action: string;
  targetCollection: string;
  targetDocument: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

// ===== Payments =====

export type PaymentType = 'membership' | 'course' | 'refund';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'manual';

export interface Payment {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  type: PaymentType;
  itemName: string;
  itemId?: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  invoiceId?: string;
  date: string;
  refundAmount?: number;
}

// ===== Course Progress =====

export interface CourseProgressRecord {
  uid: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  updatedAt?: string;
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
  referralLink?: string;
  enabled: boolean;
  clicks: number;
  registrations: number;
  sales: number;
  pendingCommission: number;
  paidCommission: number;
  availableBalance: number;
  commissionRate?: number;
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

// ===== Coupons =====

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  applicablePlan?: string;
  createdAt?: string;
}

// ===== Live Classes =====

export interface LiveClassSession {
  id: string;
  title: string;
  instructor: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string;
  status: 'Scheduled' | 'Live' | 'Ended' | 'Cancelled';
  enrolledCount: number;
  category: string;
  description?: string;
  recordingUrl?: string;
  createdAt?: string;
}

// ===== Support Tickets =====

export interface SupportTicketReply {
  id: string;
  sender: 'user' | 'support' | 'admin';
  senderName?: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'General' | 'Billing' | 'Courses' | 'Technical' | 'Affiliate';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  replies?: SupportTicketReply[];
}

// ===== Notifications =====

export interface NotificationItem {
  id: string;
  uid?: string;
  title: string;
  message: string;
  targetRole?: 'all' | 'student' | 'affiliate' | 'instructor' | 'admin';
  type: 'info' | 'success' | 'warning' | 'alert';
  createdAt: string;
  sentBy?: string;
  readCount?: number;
}

// ===== Sales Partners =====

export interface SalesPartner {
  id: string;
  uid?: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  status: 'Active' | 'Pending' | 'Suspended';
  createdAt: string;
}

// ===== Commerce (Orders, Payments, Invoices) =====

export type OrderStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';

export interface Order {
  id: string; // ORD-YYMMDD-XXXX
  uid: string;
  userName: string;
  userEmail: string;
  packageId?: string;
  packageName: string;
  courseId?: string;
  amount: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentId?: string;
  invoiceId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paymentProofRef?: string;
  paymentProofNotes?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string; // INV-YYMMDD-XXXX
  orderId: string;
  paymentId: string;
  uid: string;
  userName: string;
  userEmail: string;
  itemName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'void' | 'refunded';
  createdAt: string;
}

// ===== Learning Platform =====

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  duration: string;
  type: 'video' | 'pdf' | 'download' | 'quiz';
  videoUrl?: string;
  pdfUrl?: string;
  downloadUrl?: string;
  downloadName?: string;
  sortOrder: number;
  isFreePreview?: boolean;
}

export interface StudentBookmark {
  id: string;
  uid: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  timestampSeconds?: number;
  note?: string;
  createdAt: string;
}

export interface StudentNote {
  id: string;
  uid: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LessonDiscussion {
  id: string;
  courseId: string;
  lessonId: string;
  uid: string;
  authorName: string;
  authorAvatar?: string;
  message: string;
  createdAt: string;
  replies?: {
    id: string;
    uid: string;
    authorName: string;
    authorAvatar?: string;
    message: string;
    createdAt: string;
  }[];
}

export interface ActivityLog {
  id: string;
  uid: string;
  userName?: string;
  userEmail?: string;
  type: 'login' | 'purchase' | 'lesson_completed' | 'course_completed' | 'certificate_issued' | 'withdrawal_requested' | 'profile_updated';
  message: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface SystemSettings {
  walletEnabled: boolean;
  rewards: {
    referralSignupBonus: number;
    affiliatePurchasePercent: number;
    dailyReward: number;
  };
  withdrawals: {
    minimumWithdraw: number;
    maximumWithdraw: number;
    withdrawalFee: number;
    withdrawalFeeType: 'fixed' | 'percentage';
    autoApprove: boolean;
  };
  affiliate: {
    enabled: boolean;
    cookieDurationDays: number;
    attribution: 'first_click' | 'last_click';
    commissionPercent: number;
  };
  microtasks: {
    enabled: boolean;
    minimumWithdraw: number;
    profitMarginPercent: number;
    defaultPendingDays: number;
  };
}


export interface MembershipPackage {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  features: string[];
  affiliateCommissionPercent: number;
  affiliateCommissionFlat?: number;
  bonusReward: number;
  displayOrder: number;
  salesBadge?: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface PackageAffiliateOrder {
  id: string;
  affiliateUid: string;
  affiliateCode: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  commissionRate: number;
  commissionAmount: number;
  bonusAmount: number;
  orderId: string;
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  purchaseTime: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface MicrotaskProvider {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  apiSecret?: string;
  webhookSecret: string;
  enabled: boolean;
  syncIntervalMinutes: number;
  profitMarginPercent: number;
  status: 'active' | 'inactive' | 'error';
  lastSyncAt?: string;
  lastError?: string;
  totalSyncedTasks?: number;
  createdAt: string;
  updatedAt: string;
}

export type MicrotaskCategory = 'social' | 'survey' | 'app_download' | 'signup' | 'review' | 'video' | 'other';
export type MicrotaskDifficulty = 'easy' | 'medium' | 'hard';
export type ProofType = 'text' | 'url' | 'screenshot';

export interface Microtask {
  id: string;
  providerId: string;
  providerName: string;
  externalTaskId: string;
  title: string;
  description: string;
  instructions: string;
  requirements: string[];
  category: MicrotaskCategory;
  difficulty: MicrotaskDifficulty;
  estimatedMinutes: number;
  originalReward: number;
  reward: number;
  platformFee: number;
  proofTypes: ProofType[];
  externalUrl?: string;
  maxSubmissions: number;
  completedCount: number;
  status: 'active' | 'paused' | 'completed' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export type MicrotaskSubmissionStatus = 'submitted' | 'pending_provider' | 'approved' | 'rejected';

export interface MicrotaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  providerId: string;
  providerName: string;
  uid: string;
  userName: string;
  userEmail: string;
  proofText?: string;
  proofUrl?: string;
  proofScreenshots?: string[];
  status: MicrotaskSubmissionStatus;
  rejectionReason?: string;
  reward: number;
  platformFee: number;
  submittedAt: string;
  validatedAt?: string;
  processedAt?: string;
  transactionId?: string;
}

export interface MicrotaskAnalytics {
  totalTasks: number;
  totalSubmissions: number;
  completedSubmissions: number;
  rejectedSubmissions: number;
  pendingSubmissions: number;
  approvalRatePercent: number;
  totalUserPayout: number;
  totalPlatformProfit: number;
  totalProviderVolume: number;
  topWorkers: Array<{ uid: string; name: string; completed: number; totalEarned: number }>;
  dailyEarnings: Array<{ date: string; earnings: number; profit: number; tasksCompleted: number }>;
}

export interface RolePermission {
  id: string;
  role: Role;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
  updatedAt: string;
}



