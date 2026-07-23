# Firestore Collections & Security Indexing Specification

## 1. Overview of Collections

| Collection Name | Document ID Pattern | Purpose / Content | Security Level |
| :--- | :--- | :--- | :--- |
| `users` | `{uid}` | User profiles, roles, and membership status | Owner read/update, Admin read/write |
| `courses` | `{courseId}` | Course metadata, pricing, video/resource links | Public read, Admin write |
| `pricing_plans` | `{planId}` | Membership tiers and package feature lists | Public read, Admin write |
| `coupons` | `{couponId}` | Discount coupons and usage restrictions | Public read, Admin write |
| `orders` | `{orderId}` | Order records, manual payment refs, approval state | Owner read, Admin read/write |
| `payments` | `{paymentId}` | Payment records and gateway IDs | Owner read, Admin write |
| `invoices` | `{invoiceId}` | Tax invoices generated upon order approval | Owner read, Admin write |
| `course_access` / `courseAccess` | `{accessId}` | User course access grants | Owner/Admin read, Admin write |
| `wallets` | `{userId}` | User affiliate earnings balance & bank details | Owner/Admin read, Owner/Admin write |
| `transactions` | `{txnId}` | Financial credit/debit/commission transaction log | Owner/Admin read, Admin write |
| `withdrawals` | `{reqId}` | Payout requests (UPI / Bank transfer) | Owner read/create, Admin full |
| `kyc` | `{userId}` | Bank account & UPI verification info | Owner read/write, Admin full |
| `affiliates` | `{userId}` | Affiliate codes, stats, and commission tier | Authenticated read, Owner/Admin write |
| `referrals` | `{refId}` | Individual referred user logs and conversions | Owner/Admin read, Authenticated write |
| `affiliate_applications` | `{appId}` | Public partner applications for affiliate program | Owner read/create, Admin full |
| `crm_leads` | `{leadId}` | CRM lead pipeline records, notes, and task lists | Admin read/write |
| `notifications` | `{notifId}` | Platform notifications and alerts | Target user/Admin read, Auth write |
| `activityLogs` | `{logId}` | User platform activity audit logs | Authenticated read/write |
| `auditLogs` | `{logId}` | Sensitive admin action audit records | Admin read/write |
| `email_logs` | `{logId}` | Outbound email notification log | Admin read/write |
| `reminders` | `{remId}` | Scheduled follow-ups and class alerts | Authenticated read/write |
| `cms` | `{sectionName}` | Dynamic marketing page content | Public read, Admin write |
| `settings` | `general` | Global site configurations | Public read, Admin write |

---

## 2. Active Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
        (request.auth.token.role == 'admin' ||
         request.auth.token.role == 'superadmin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin']);
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Courses Collection
    match /courses/{courseId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Course Access
    match /course_access/{accessId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Pricing Plans
    match /pricing_plans/{planId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Coupons
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders
    match /orders/{orderId} {
      allow read: if isAuthenticated() && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // Payments
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && (resource.data.uid == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    // Invoices
    match /invoices/{invoiceId} {
      allow read: if isAuthenticated() && (resource.data.uid == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    // Wallets & Transactions
    match /wallets/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) || isAdmin();
    }

    match /transactions/{txnId} {
      allow read: if isAuthenticated() && (resource.data.uid == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    match /withdrawals/{reqId} {
      allow read: if isAuthenticated() && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // Affiliates & Referrals
    match /affiliates/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
    }

    match /referrals/{refId} {
      allow read: if isAuthenticated() && (resource.data.referrerUid == request.auth.uid || isAdmin());
      allow write: if isAuthenticated();
    }

    match /affiliate_applications/{appId} {
      allow read: if isAuthenticated() && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // CRM Leads
    match /crm_leads/{leadId} {
      allow read, write: if isAdmin();
    }

    // Notifications
    match /notifications/{notifId} {
      allow read: if isAuthenticated() && (resource.data.targetUid == request.auth.uid || resource.data.targetRole == 'all' || isAdmin());
      allow write: if isAuthenticated();
    }

    // Activity Logs & Audit Logs
    match /activityLogs/{logId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    match /auditLogs/{logId} {
      allow read, write: if isAdmin();
    }

    // Email Logs & Reminders
    match /email_logs/{logId} {
      allow read, write: if isAdmin();
    }

    match /reminders/{remId} {
      allow read, write: if isAuthenticated();
    }

    // Default deny
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 3. Required Firestore Composite Indexes
To ensure optimized query performance at scale, the following composite indexes are recommended:

1. **`orders`**: `uid` ASC, `createdAt` DESC
2. **`courses`**: `status` ASC, `sortOrder` ASC
3. **`transactions`**: `uid` ASC, `createdAt` DESC
4. **`withdrawals`**: `status` ASC, `createdAt` DESC
5. **`referrals`**: `referrerUid` ASC, `createdAt` DESC
6. **`crm_leads`**: `stage` ASC, `updatedAt` DESC

