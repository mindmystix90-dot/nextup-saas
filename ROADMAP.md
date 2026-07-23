# NextUp SaaS — Production Engineering Roadmap

## Version 1.0 Complete Launch Milestone

### Phase 1: Core Stability, Admin Control Center & Security Hardening (✓ Completed)
- [x] Configure standalone Next.js build setup for Cloud Run deployment.
- [x] Implement robust fallback initialization in Firebase config.
- [x] Establish role-based routing (`ProtectedRoute`, `AdminRoute`).
- [x] Integrate full Firestore service adapters for Users, Courses, Wallet, KYC, Affiliate, CRM, CMS, Live Classes, Support, Certificates, Notifications, Coupons, Packages, and Sales Partners.
- [x] Complete Admin Control Center (Dashboard, Users, Roles, Packages, Permissions, Courses, Community, Live Classes, Payments, Coupons, Affiliates, Sales Partners, CMS, Reports, Notifications, Support, CRM, Orders).
- [x] Deploy strict server-authoritative Firestore Security Rules (`firestore.rules`).

---

### Phase 2: Manual Payment Architecture & Commerce Engine (✓ Completed)
- [x] **Manual Payment Approval Flow**:
  - Direct UPI / Bank Transfer / NetBanking manual payment proof submission modal with UTR reference tracking.
  - Student order tracking page (`/dashboard/orders`) with live status indicators.
  - Admin Order Approval Workspace (`/app/admin/orders/page.tsx`) with 1-click automated approval and rejection workflows.
  - End-to-end automated sequence upon approval: Order completion, Payment record creation, Tax-compliant GST Invoice generation, Instant Membership & Course Access activation, Activity & Audit logging, and User notification dispatch.
- [x] **Automated Affiliate & Partner Attribution**:
  - Global `?ref=...` URL parameter capture with 90-day cookie storage and click tracking (`ReferralTracker`).
  - Automated referral commission calculation and wallet balance crediting upon manual payment approval.
  - Comprehensive Affiliate Portal (`/app/affiliate/page.tsx` & `/app/dashboard/affiliate/page.tsx`) with interactive earnings calculator and application workflow.

---

### Phase 3: Sales Workspace & CRM (✓ Completed)
- [x] **Full Sales Workspace (`/app/admin/crm/page.tsx`)**:
  - Pipeline metrics (Total Value, Won Revenue, Win Rate).
  - 6-Stage Kanban Board & Table views (New Lead -> Contacted -> Qualified -> Proposal Sent -> Won -> Lost).
  - Lead management, activity timeline notes history, follow-up task scheduler, and sales partner attribution.

---

### Phase 4: Automation, Audit & Compliance (✓ Completed)
- [x] **Audit Service (`services/audit.service.ts`)**: Server-side admin action logging.
- [x] **Email Dispatch Architecture (`services/email.service.ts`)**: Structured notification logging and dispatch ready for SMTP/Nodemailer.
- [x] **Reminders & Scheduled Jobs (`services/reminders.service.ts`)**: Follow-up task and class alerts system.
