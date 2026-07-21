'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, Wallet, UserCircle, Plus, X,
  GraduationCap, UserPlus, DollarSign, Megaphone, CheckCircle, Network, LifeBuoy, Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/learning', label: 'Learn', icon: BookOpen },
  { href: '/dashboard/community', label: 'Community', icon: Users },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const quickActions = isAdmin
    ? [
        { label: 'Add Course', href: '/admin/courses', icon: GraduationCap },
        { label: 'Add User', href: '/admin/users', icon: UserPlus },
        { label: 'Create Plan', href: '/admin/pricing', icon: DollarSign },
        { label: 'Announcements', href: '/admin/content', icon: Megaphone },
        { label: 'Approve Withdrawals', href: '/admin/wallet', icon: CheckCircle },
      ]
    : [
        { label: 'Browse Courses', href: '/courses', icon: BookOpen },
        { label: 'Request Withdrawal', href: '/dashboard/wallet', icon: Wallet },
        { label: 'Support', href: '/dashboard/support', icon: LifeBuoy },
        { label: 'Invite Friends', href: '/dashboard/affiliate', icon: Network },
        { label: 'Redeem Coupon', href: '/dashboard/wallet', icon: Gift },
      ];

  return (
    <>
      {/* Floating + button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <div className={cn('relative', open && 'flex flex-col gap-2 items-end')}>
          {open && (
            <div className="flex flex-col gap-2 mb-2 animate-fade-in">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2 shadow-premium-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <a.icon className="h-4 w-4 text-primary" />
                  {a.label}
                </Link>
              ))}
            </div>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full shadow-premium-lg transition-all duration-300',
              open ? 'bg-destructive text-white rotate-45' : 'bg-brand-gradient text-white'
            )}
            aria-label={open ? 'Close menu' : 'Quick actions'}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
