# Role-Based Access Control (RBAC) & Permission Matrix

## 1. System Roles Overview

NextUp enforces fine-grained Role-Based Access Control across all application modules.

- **`superadmin`**: Complete root access to system settings, user role assignment, financial ledger edits, and administrative overrides.
- **`admin`**: Access to Admin Dashboard, course publishing, withdrawal processing, user management, and CMS editing.
- **`instructor`**: Access to course creation, lesson media upload, student feedback, and course-level analytics.
- **`affiliate`**: Access to affiliate link generation, referral metrics, and commission wallet payouts.
- **`student` / `user`**: Default user role upon registration. Access to enrolled courses, community discussions, wallet, and personal KYC profile.

---

## 2. Feature & Endpoint Permission Matrix

| Feature / Action | `guest` | `student` / `user` | `affiliate` | `instructor` | `admin` | `superadmin` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| View Public Marketing Pages & Catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register & Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access Student Dashboard (`/dashboard`) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Enrolled Courses & Lessons | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Request Withdrawal Payout | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit KYC Details | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Generate Certificate | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access Admin Panel (`/admin`) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Courses (Create/Edit/Delete) | ❌ | ❌ | ❌ | ✅ (Own) | ✅ | ✅ |
| Manage CMS Content | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Process Withdrawal Payouts | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Verify User KYC Submissions | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit User Roles & Suspend Users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Modify Platform Financial Ledgers | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Implementation in Code

### 3.1 Client-side Route Guard (`components/auth/admin-route.tsx`)
```tsx
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
```

### 3.2 Service-side Enforcement Example
```typescript
export async function approveWithdrawal(withdrawalId: string, adminUid: string) {
  const adminProfile = await getUserProfile(adminUid);
  if (!adminProfile || (adminProfile.role !== 'admin' && adminProfile.role !== 'superadmin')) {
    throw new Error('Unauthorized: Admin privilege required.');
  }
  // Proceed with processing...
}
```
