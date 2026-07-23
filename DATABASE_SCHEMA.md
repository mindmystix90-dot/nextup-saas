# Database Schema & Entity Specification

## 1. Overview
NextUp uses Firebase Firestore as its primary NoSQL document store. Data entities are designed to balance normalization for strict transactional consistency (such as wallet balances and KYC verification) with document embedding for low-latency client reads.

---

## 2. Entity Relationship Diagram (Logical)

```
[Users] (1) <---> (1) [Wallets]
   |                     |
   | (1:N)               | (1:N)
   +---> [CourseAccess]  +---> [Transactions]
   |                     |
   +---> [KYC]           +---> [Withdrawals]
   |
   +---> [Referrals]
```

---

## 3. Detailed Data Models & TypeScript Specs

### 3.1 Collection: `users`
**Path**: `users/{uid}`  
**Primary Key**: Firebase Auth `uid`

```typescript
interface FirestoreProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  role: 'superadmin' | 'admin' | 'instructor' | 'student' | 'affiliate' | 'user';
  membership: 'starter' | 'pro' | 'lifetime';
  suspended?: boolean;
  createdAt: string; // ISO 8601 Timestamp
  updatedAt?: string;
  bio?: string;
  phone?: string;
}
```

### 3.2 Collection: `courses`
**Path**: `courses/{courseId}`  
**Primary Key**: `courseId` (auto-generated or slug)

```typescript
interface Course {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: string; // e.g. "₹2,999" or "Free"
  icon: string;
  gradient: string;
  lessons: number;
  duration: string;
  status: 'Published' | 'Draft' | 'Archived';
  sort_order: number;
  image?: string;
  banner?: string;
  videoUrl?: string;
  resourceUrl?: string;
  accessLevel: 'starter' | 'pro' | 'lifetime' | 'public';
  purchaseType: 'free' | 'included' | 'paid_add_on';
  created_at?: string;
  updated_at?: string;
}
```

### 3.3 Collection: `pricing_plans`
**Path**: `pricing_plans/{planId}`

```typescript
interface PricingPlan {
  id: string;
  name: string;
  price: number; // In INR
  period: string; // e.g. "/month" or "one-time"
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge?: string;
  active: boolean;
  sort_order: number;
}
```

### 3.4 Collection: `courseAccess`
**Path**: `courseAccess/{docId}`  
**Document ID Pattern**: `{uid}_{courseId}`

```typescript
interface CourseAccessDoc {
  id: string;
  uid: string;
  courseId: string;
  grantedAt: string;
  grantedBy: 'membership' | 'purchase' | 'admin';
}
```

### 3.5 Collection: `purchases`
**Path**: `purchases/{purchaseId}`

```typescript
interface CoursePurchaseDoc {
  id: string;
  uid: string;
  courseId: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}
```

### 3.6 Collection: `wallets`
**Path**: `wallets/{uid}`

```typescript
interface WalletData {
  uid: string;
  balance: number;
  pendingCommission: number;
  paidOut: number;
  lifetimeEarnings: number;
  updatedAt: string;
}
```

### 3.7 Collection: `transactions`
**Path**: `transactions/{txnId}`

```typescript
interface WalletTransaction {
  id: string;
  uid: string;
  type: 'referral_commission' | 'course_sale' | 'withdrawal' | 'bonus' | 'refund';
  amount: number; // positive for credit, negative for debit
  status: 'completed' | 'pending' | 'failed';
  label: string;
  date: string;
  referenceId?: string;
}
```

### 3.8 Collection: `withdrawals`
**Path**: `withdrawals/{withdrawalId}`

```typescript
interface Withdrawal {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: 'bank' | 'upi';
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  upiId?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}
```

### 3.9 Collection: `kyc`
**Path**: `kyc/{uid}`

```typescript
interface KycInfo {
  uid: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId?: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
}
```

### 3.10 Collection: `affiliateStats`
**Path**: `affiliateStats/{uid}`

```typescript
interface AffiliateStats {
  uid: string;
  referralCode: string;
  clicks: number;
  registrations: number;
  sales: number;
  availableBalance: number;
  pendingCommission: number;
  paidCommission: number;
}
```

### 3.11 Collection: `referrals`
**Path**: `referrals/{refId}`

```typescript
interface Referral {
  id: string;
  referrerUid: string;
  referredUid: string;
  referredName: string;
  referredEmail: string;
  status: 'registered' | 'converted' | 'expired';
  commission: number;
  date: string;
}
```

### 3.12 Collection: `cms`
**Path**: `cms/{sectionName}`  
**Supported Sections**: `site`, `hero`, `about`, `features`, `stats`, `pricing`, `faq`, `footer`, `contact`, `social`, `legal`, `company`.
