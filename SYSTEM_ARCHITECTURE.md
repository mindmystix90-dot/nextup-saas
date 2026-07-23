# System Architecture & Component Design

## 1. Architectural Overview

NextUp is engineered as a server-rendered / client-hydrated Next.js 14 App Router application deploying to Docker / Cloud Run containers. The system decouples presentation, client state, business service abstraction, and persistent backend infrastructure.

```
┌────────────────────────────────────────────────────────────────────────┐
│                             BROWSER CLIENT                             │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │   Public Marketing Pages  │      │    Dashboard & Admin Pages  │   │
│   └─────────────┬─────────────┘      └──────────────┬──────────────┘   │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 React Context / Global Hooks                   │   │
│   │        (AuthProvider, useCMS, useSettings, useTheme)           │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVICE ABSTRACTION LAYER                       │
│                                                                        │
│   ┌────────────────┐ ┌──────────────────┐ ┌────────────────────────┐  │
│   │  authService   │ │  coursesService  │ │    affiliateService    │  │
│   ├────────────────┤ ├──────────────────┤ ├────────────────────────┤  │
│   │ walletService  │ │    cmsService    │ │    settingsService     │  │
│   └───────┬────────┘ └────────┬─────────┘ └───────────┬────────────┘  │
└───────────┼───────────────────┼───────────────────────┼────────────────┘
            │                   │                       │
            ▼                   ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FIREBASE SDK / INFRA                           │
│                                                                        │
│   ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐     │
│   │  Firebase Auth  │   │ Cloud Firestore │   │ Firebase Storage │     │
│   └─────────────────┘   └─────────────────┘   └──────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & Responsibilities

```
/
├── app/                      # Next.js App Router (Pages, Layouts, API routes)
│   ├── (public)/             # Landing, Courses, About, Pricing, Contact
│   ├── admin/                # Admin Panel Layout & Sub-views (Users, Content, Analytics, Wallet)
│   ├── dashboard/            # Student/Affiliate Dashboard (Learning, Wallet, KYC, Certificates)
│   ├── api/                  # Server-side API Proxies (Gemini, Payment Handlers)
│   ├── globals.css           # Global Tailwind CSS Styles
│   └── layout.tsx            # Root Layout wrapping AuthProvider & Theme Provider
│
├── components/               # Modular UI Components
│   ├── admin/                # Admin Control Panels, Header, User Tables
│   ├── auth/                 # ProtectedRoute & AdminRoute Guards
│   ├── dashboard/            # Dashboard Layouts, Navbars, Placeholder Skeletons
│   ├── site/                 # Marketing Components (Navbar, Footer, Hero, Cards)
│   └── ui/                   # Reusable Primitive Components (Shadcn UI)
│
├── context/                  # React Context Providers
│   └── auth-context.tsx      # Authentication state, token refresh, Firestore user hydration
│
├── hooks/                    # Custom React Hooks
│   ├── use-auth.ts           # Access Auth Context
│   ├── use-cms.ts            # Dynamic CMS copy hooks
│   └── use-settings.ts       # Platform settings hook
│
├── services/                 # Firebase Service Adapters & Business Logic
│   ├── auth.service.ts       # Auth methods, admin user operations
│   ├── courses.service.ts    # Course CRUD, access resolution
│   ├── wallet.service.ts     # Ledger management, withdrawal requests, KYC
│   ├── affiliate.service.ts  # Tracking referrals and commission calculations
│   ├── cms.service.ts        # Dynamic site CMS fetching & updates
│   └── storage.service.ts    # Firebase Storage upload proxies
│
├── lib/                      # Core Utilities & Helpers
│   ├── firebase/             # Firebase App, Auth, Firestore & Storage initializers
│   └── utils.ts              # Class merger (cn) and formatting functions
│
└── types/                    # System-wide TypeScript Interfaces
    └── index.ts              # Data models and API contract definitions
```

---

## 3. Data Flow & State Hydration Pattern

1. **Authentication Initialization**:
   - `AuthProvider` mounts at root layout.
   - Listens to `onAuthStateChanged` from Firebase Auth.
   - On user login, fetches corresponding profile from Firestore (`users/{uid}`).
   - Sets unified user object in state with `role`, `membership`, `suspended` status.

2. **Access Control Verification**:
   - `ProtectedRoute`: Wraps `/dashboard/*` routes. Redirects unauthenticated users to `/login`.
   - `AdminRoute`: Wraps `/admin/*` routes. Validates `role === 'admin'` or `role === 'superadmin'`. Redirects non-admins to `/dashboard`.

3. **Service Fallback Strategy**:
   - Services implement graceful error handling: if Firebase is unconfigured or unreachable, services fallback to structured static mock data (`lib/data/*`) to maintain full UI operational readiness during development or offline preview.

---

## 4. Storage Architecture
- **Media Uploads**: Course banners, avatar photos, CMS logos, video lectures, and PDF resources use Firebase Storage.
- **Upload Path Conventions**:
  - Logos: `site/logo_{timestamp}`
  - Course Banners: `courses/{courseId}/banner`
  - Course Images: `courses/{courseId}/image`
  - Course Videos: `courses/{courseId}/video_{lessonId}`
  - Course PDFs: `courses/{courseId}/resource_{resourceId}`
