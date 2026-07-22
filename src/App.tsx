import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { Spinner } from '@/components/ui';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ContactPage from '@/pages/ContactPage';
import PricingPage from '@/pages/PricingPage';

import AppLayout from '@/pages/app/AppLayout';
import DashboardPage from '@/pages/app/DashboardPage';
import CoursesPage from '@/pages/app/CoursesPage';
import CourseViewPage from '@/pages/app/CourseViewPage';
import WalletPage from '@/pages/app/WalletPage';
import AffiliatePage from '@/pages/app/AffiliatePage';
import KycPage from '@/pages/app/KycPage';
import CommunityPage from '@/pages/app/CommunityPage';
import CertificatesPage from '@/pages/app/CertificatesPage';
import SettingsPage from '@/pages/app/SettingsPage';
import ProfilePage from '@/pages/app/ProfilePage';
import NotificationsPage from '@/pages/app/NotificationsPage';

import SalesDashboardPage from '@/pages/app/SalesDashboardPage';
import SalesLeadsPage from '@/pages/app/SalesLeadsPage';
import SalesTrainingPage from '@/pages/app/SalesTrainingPage';
import SalesEarningsPage from '@/pages/app/SalesEarningsPage';

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage';
import AdminWalletPage from '@/pages/admin/AdminWalletPage';
import AdminWithdrawalsPage from '@/pages/admin/AdminWithdrawalsPage';
import AdminKycPage from '@/pages/admin/AdminKycPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import AdminAffiliatePage from '@/pages/admin/AdminAffiliatePage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminLeadsPage from '@/pages/admin/AdminLeadsPage';
import AdminSalesPartnersPage from '@/pages/admin/AdminSalesPartnersPage';
import AdminFeaturesPage from '@/pages/admin/AdminFeaturesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <Spinner size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <FeatureFlagsProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* App routes (authenticated) */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseViewPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="affiliate" element={<AffiliatePage />} />
          <Route path="kyc" element={<KycPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="sales" element={<SalesDashboardPage />} />
          <Route path="sales/leads" element={<SalesLeadsPage />} />
          <Route path="sales/training" element={<SalesTrainingPage />} />
          <Route path="sales/earnings" element={<SalesEarningsPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="wallet" element={<AdminWalletPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="kyc" element={<AdminKycPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="affiliate" element={<AdminAffiliatePage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="sales-partners" element={<AdminSalesPartnersPage />} />
          <Route path="features" element={<AdminFeaturesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FeatureFlagsProvider>
  );
}
