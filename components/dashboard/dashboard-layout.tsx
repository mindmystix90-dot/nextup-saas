'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Wallet,
  Network,
  LifeBuoy,
  UserCircle,
  GraduationCap,
  Menu,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { cn, homeFor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Learning', href: '/dashboard/learning', icon: BookOpen },
  { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { label: 'Community', href: '/dashboard/community', icon: Users },
  { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { label: 'Affiliate', href: '/dashboard/affiliate', icon: Network },
  { label: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { label: 'Profile', href: '/dashboard/profile', icon: UserCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const displayName = user?.name || 'Guest';
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const isAdmin = user?.role === 'admin';
  const home = homeFor(user?.role);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <Link href={home} className="flex items-center gap-2.5 px-5 h-16 shrink-0 border-b border-border">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
          <GraduationCap className="h-4 w-4 text-white" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">NextUp</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-brand-gradient text-white shadow-glow'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className={cn(
              'mt-2 flex items-center gap-3 rounded-xl border border-primary/20 bg-brand-gradient-soft px-3 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-brand-gradient hover:text-white hover:border-transparent',
              pathname === '/admin' && 'bg-brand-gradient text-white shadow-glow'
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-2xl bg-brand-gradient-soft p-4">
          <p className="text-sm font-semibold text-foreground">Upgrade to Lifetime</p>
          <p className="mt-1 text-xs text-muted-foreground">Pay once, learn forever.</p>
          <Button asChild size="sm" className="mt-3 w-full bg-brand-gradient font-semibold">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card shadow-premium-lg animate-fade-in">
            {Sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 glass border-b border-white/40">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <button
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden md:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search courses, lessons…"
                className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-xl border border-border bg-card pl-1.5 pr-3 py-1.5 hover:bg-secondary transition-colors">
                    <Avatar>
                      <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block leading-tight text-left">
                      <p className="text-sm font-semibold max-w-[140px] truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Pro member'}</p>
                    </div>
                    <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile"><UserCircle className="mr-2 h-4 w-4" /> My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing"><ShieldCheck className="mr-2 h-4 w-4" /> Membership</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => { await logout(); router.push('/login'); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
