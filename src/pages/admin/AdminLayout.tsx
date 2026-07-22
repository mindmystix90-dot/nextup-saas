import { Outlet, NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, BookOpen, Wallet, ArrowDownToLine, ShieldCheck,
  CreditCard, Users2, BarChart3, Target, Briefcase, ToggleLeft, Menu, X,
  ArrowLeft, LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/admin/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
  { to: '/admin/kyc', icon: ShieldCheck, label: 'KYC' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/affiliate', icon: Users2, label: 'Affiliate' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/leads', icon: Target, label: 'Leads' },
  { to: '/admin/sales-partners', icon: Briefcase, label: 'Sales Partners' },
  { to: '/admin/features', icon: ToggleLeft, label: 'Features' },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="flex flex-col h-full">
      <Link to="/app" className="flex items-center gap-2 px-4 h-16 border-b border-border shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to App</span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <button
          onClick={async () => { await signOut(); window.location.href = '/login'; }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="border-t border-border p-3 flex items-center gap-2">
        <Avatar name={profile?.name || ''} src={profile?.photo_url || undefined} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{profile?.name || 'Admin'}</p>
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 flex-col">
        {Sidebar}
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-card border-r border-border flex flex-col animate-slide-in-right">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-border bg-card flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} className="text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-bold font-display">Admin</span>
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
