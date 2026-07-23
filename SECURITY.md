# Security Model & Policy Specification

## 1. Threat Model & Key Assets

NextUp safeguards the following sensitive assets:
1. **User Identity & PII**: Passwords, email addresses, phone numbers, and profile photos.
2. **Financial Data**: Bank account numbers, IFSC codes, UPI IDs, transaction ledgers, and wallet balances.
3. **Intellectual Property**: Video lesson URLs, downloadable PDF materials, and course curricula.
4. **API Keys & Administrative Credentials**: Gemini API key, Firebase service credentials, payment secrets.

---

## 2. Authentication & Authorization Security

- **Password Standards**: Enforced minimum length of 8 characters, requiring uppercase, lowercase, numbers, and special characters.
- **Session Tokens**: Firebase Auth JSON Web Tokens (JWT) signed by Google infrastructure.
- **Role Isolation**: Admin APIs check `role === 'admin' || role === 'superadmin'` both on client wrappers (`AdminRoute`) and within service method executions.

---

## 3. Secret Management & Server Isolation

- **Zero Client Secret Leakage**:
  - `GEMINI_API_KEY`, Firebase private keys, and payment gateway secrets are strictly restricted to server environment variables (`process.env`).
  - No secret variables use `NEXT_PUBLIC_` prefixes.
- **Environment Declaration**:
  - Non-sensitive defaults and key placeholders declared in `.env.example`.

---

## 4. Data Protection & Sanitization

- **XSS Prevention**: React automatically escapes rendering values. Markdown content renders via `react-markdown` with strict HTML parsing controls.
- **CSRF Mitigation**: Next.js App Router API routes enforce Origin and SameSite cookie headers.
- **Storage Security**: Firebase Storage security rules restrict file upload mime types and limit write permissions to authenticated account owners.

---

## 5. Financial Ledger & Wallet Integrity

- **Double-Entry Balance Verification**: Payout withdrawals check `availableBalance >= requestedAmount` prior to document insertion.
- **Immutable Transaction Logs**: Completed `transactions` documents cannot be edited or deleted by non-superadmin accounts.
- **KYC Verification**: Bank and UPI accounts must achieve `status === 'verified'` prior to withdrawal processing.

---

## 6. Security Incident Response Plan

1. **Credential Compromise**: Immediately revoke compromised API keys in GCP Secret Manager / Firebase Console and redeploy container.
2. **Account Breach**: Administrative suspension flag (`suspended: true`) in Firestore `users/{uid}` halts all session authorization calls.
3. **Vulnerability Reporting**: Report security findings directly to the lead security architect.
