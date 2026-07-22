import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Wallet, Users, ShieldCheck, MessageSquare,
  Award, Settings, Bell, User, LogOut, Menu, X, Briefcase, Target, TrendingUp, BookMarked,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { Avatar } from '@/components/ui';
import { initials } from '@/lib/utils';

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
  const isSalesPartner = profile?.sales_partner_enabled || profile?.membership === 'sales_partner';

  const navItems = [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
    isEnabled('learning') && { to: '/app/courses', icon: BookOpen, label: 'Courses' },
    isEnabled('wallet') && { to: '/app/wallet', icon: Wallet, label: 'Wallet' },
    isEnabled('affiliate') && profile?.affiliate_enabled && { to: '/app/affiliate', icon: Users, label: 'Affiliate' },
    isEnabled('kyc') && { to: '/app/kyc', icon: ShieldCheck, label: 'KYC' },
    isEnabled('community') && { to: '/app/community', icon: MessageSquare, label: 'Community' },
    isEnabled('certificates') && { to: '/app/certificates', icon: Award, label: 'Certificates' },
    { to: '/app/notifications', icon: Bell, label: 'Notifications' },
  ].filter(Boolean) as { to: string; icon: React.ElementType; label: string; end?: boolean }[];

  const salesItems = isSalesPartner ? [
    { to: '/app/sales', icon: Briefcase, label: 'Sales Dashboard', end: true },
    { to: '/app/sales/leads', icon: Target, label: 'Leads CRM' },
    { to: '/app/sales/training', icon: BookMarked, label: 'Training' },
    { to: '/app/sales/earnings', icon: TrendingUp, label: 'Earnings' },
  ] : [];

  const bottomItems = [
    { to: '/app/profile', icon: User, label: 'Profile' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const Sidebar = (
    <div className="flex flex-col h-full">
      <Link to="/app" className="flex items-center gap-2 px-4 h-16 border-b border-border shrink-0">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <span className="font-bold font-display">NextUp</span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </NavLink>
        ))}

        {salesItems.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sales Partner</div>
            {salesItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors">
            <ShieldCheck className="h-4 w-4" /> Admin Panel
          </Link>
        )}

        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="border-t border-border p-3 flex items-center gap-2">
        <Avatar name={profile?.name || ''} src={profile?.photo_url || undefined} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{profile?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 flex-col">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-card border-r border-border flex flex-col animate-slide-in-right">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden h-14 border-b border-border bg-card flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/app" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-bold font-display">NextUp</span>
          </Link>
          <div className="ml-auto">
            <Avatar name={profile?.name || ''} src={profile?.photo_url || undefined} size="sm" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
