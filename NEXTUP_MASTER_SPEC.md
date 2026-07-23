# NextUp SaaS — Master Technical Specification

## 1. Executive Summary
NextUp is an all-in-one digital learning, affiliate marketing, and community platform built as a modern full-stack SaaS application. The platform provides structured course delivery, verifiable digital certificates, multi-tier affiliate referral tracking, wallet payout processing, KYC compliance verification, and real-time community engagement.

---

## 2. Platform Vision & Objectives
- **Target Audience**: Digital creators, professionals, marketers, and continuous learners in emerging technical and business disciplines.
- **Core Value Proposition**: Practical skill acceleration paired with native referral monetization and verifiable proof-of-completion credentials.
- **Scalability Target**: Capable of supporting 100,000+ active learners with zero-downtime serverless auto-scaling on Cloud Run and Google Cloud / Firebase infrastructure.

---

## 3. Technology Stack Overview

| Layer | Component | Technology / Library |
| :--- | :--- | :--- |
| **Frontend Framework** | React / SSR / SSG | Next.js 14 (App Router, React 18) |
| **Language** | Static Typing | TypeScript 5 (Strict Mode) |
| **Styling & UI** | Utility-first CSS | Tailwind CSS, Radix UI Primitives, Lucide Icons |
| **State & Auth Context** | Client State | React Context API (`AuthProvider`), Custom Hooks |
| **Database & Persistence** | NoSQL Document Store | Firebase Firestore |
| **Authentication** | Identity Provider | Firebase Authentication (Email/Password, Google OAuth) |
| **File Storage** | Object Storage | Firebase Storage (Course Banners, Logos, PDFs, Videos) |
| **Notifications & Toasts** | UI Feedback | Sonner Toast Notifications |
| **Data Visualization** | Analytics & Charts | Recharts |

---

## 4. Key Functional Modules

### 4.1 Authentication & Profile Engine
- Email/Password authentication with optional social sign-in.
- User profile synchronization in Firestore (`users/{uid}`).
- Dynamic role assignment (`superadmin`, `admin`, `instructor`, `student`, `affiliate`, `user`).
- Membership tiering (`starter`, `pro`, `lifetime`).

### 4.2 Course Catalog & Learning Management
- Flexible access controls based on membership tier or explicit dynamic purchases (`courseAccess/{uid}`).
- Video lecture rendering, downloadable PDF resources, and lesson progress tracking.
- Admin CMS for course publishing, pricing configuration, and media uploads.

### 4.3 Verifiable Certificate System
- Automated certificate generation upon course completion.
- Unique cryptographically-tagged ID format (e.g., `NX-2024-XXXXXX`).
- Public verification endpoint at `/certificates` and `/dashboard/certificates`.

### 4.4 Multi-Tier Affiliate Engine
- Unique referral code assignment per user upon signup (`ref={code}`).
- Automated tracking of clicks, registrations, sales conversions, and multi-tier commission accrual.
- Direct integration with user Wallet for instant balance crediting.

### 4.5 Financial Engine, Wallet & KYC
- Dual ledger tracking available balance, pending commissions, and total lifetime earnings.
- Bank account & UPI details submission via KYC module (`kyc/{uid}`).
- Payout request lifecycle (`pending` → `approved` → `paid` / `rejected`) managed in Admin Wallet panel.

### 4.6 Content Management System (CMS)
- Real-time editable public copy (Hero, About, Features, Pricing, FAQs, Footer, Legal).
- Direct site logo uploading and live published copy updates without redeployment.

### 4.7 Community & Discussions
- Threaded discussion topics, mentor broadcasts, and student QA feeds.
- Content moderation controls including post pinning, flagging, and deletion.

---

## 5. Non-Functional Requirements
- **Performance**: First Contentful Paint (FCP) < 1.2s; Time to Interactive (TTI) < 2.5s.
- **Availability**: 99.9% uptime powered by serverless infrastructure.
- **Security**: Strict Firestore security rules, client sanitization, and server-side secret isolation.
- **Accessibility**: WCAG 2.1 AA compliant color contrast and keyboard navigation.
