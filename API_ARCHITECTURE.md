# API Architecture & Integration Specifications

## 1. Overview

NextUp employs a hybrid API design combining Firebase Client SDK direct data listeners (for low-latency real-time state synchronization) with server-side Next.js API Routes (`app/api/*`) for privileged, secret-dependent, or webhook-based interactions.

---

## 2. Server-Side API Endpoints (`app/api/*`)

### 2.1 Gemini AI Assistance Proxy
- **Endpoint**: `POST /api/gemini/generate`
- **Purpose**: Proxies requests to Google Gemini 1.5/3.5 models server-side, insulating `GEMINI_API_KEY` from client bundle inspection.
- **Request Body**:
  ```json
  {
    "prompt": "Summarize key concepts from Module 3",
    "model": "gemini-3.5-flash"
  }
  ```
- **Response**:
  ```json
  {
    "text": "Generated response string..."
  }
  ```

### 2.2 Payment Orders Proxy (Planned)
- **Endpoint**: `POST /api/checkout/create-order`
- **Purpose**: Generates signed payment gateway order tokens (e.g. Razorpay / Stripe).
- **Request Body**:
  ```json
  {
    "planId": "pro",
    "currency": "INR"
  }
  ```
- **Response**:
  ```json
  {
    "orderId": "order_Nz192831",
    "amount": 299900,
    "currency": "INR",
    "key": "rzp_live_xxx"
  }
  ```

### 2.3 Payment Webhook Handler (Planned)
- **Endpoint**: `POST /api/webhooks/payment`
- **Purpose**: Asynchronous server-to-server payment status notification handler.
- **Verification**: Validates cryptographic signature against webhook secret before granting membership or course access in Firestore.

---

## 3. Client Service Layer Interfaces

All client interactions are encapsulated within service adapters located in `/services`:

### 3.1 `authService` (`services/auth.service.ts`)
- `register(data)`: Creates Firebase Auth account + initialized Firestore user profile.
- `login(data)`: Authenticates credentials & sets session.
- `getUsers()`: Admin method to query paginated user records.
- `updateUserRole(uid, role)`: Superadmin method for role elevation.

### 3.2 `coursesService` (`services/courses.service.ts`)
- `getCourses()`: Retrieves published course catalog.
- `getCourseById(id)`: Fetches complete lesson outline & media links.
- `checkCourseAccess(uid, courseId)`: Resolves membership or dynamic purchase access.
- `saveCourse(courseData)`: Admin CRUD method.

### 3.3 `walletService` (`services/wallet.service.ts`)
- `getWalletData(uid)`: Retrieves balance, pending commissions, and total earnings.
- `getTransactions(uid)`: Returns transaction log ledger.
- `requestWithdrawal(data)`: Creates payout request entry.
- `processWithdrawal(id, status, reason)`: Admin payout resolution.
- `saveKyc(uid, kycData)`: Submits bank/UPI details for verification.

### 3.4 `cmsService` (`services/cms.service.ts`)
- `getCmsData(section)`: Retrieves editable site copy or hero banners.
- `updateCmsData(section, content)`: Admin publishing method.

---

## 4. Error Handling & Standard Responses

All server API routes and client service methods return typed standard error structures:

```typescript
interface ApiErrorResponse {
  success: false;
  code: string; // e.g., 'auth/invalid-credential', 'permission-denied'
  message: string;
  details?: Record<string, unknown>;
}
```
