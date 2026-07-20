'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, GraduationCap, UserCircle, Settings, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
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
import { navLinks, siteConfig } from '@/lib/data/site';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const home = homeFor(user?.role);
  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass shadow-premium border-b border-white/40'
          : 'bg-transparent'
      )}
    >
      <nav className="container flex h-16 md:h-20 items-center justify-between">
        <Link href={home} className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-px h-px bg-brand-gradient" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 rounded-lg bg-secondary animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-border bg-card pl-1.5 pr-3 py-1.5 hover:bg-secondary transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name?.split(' ')[0] || 'Account'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold leading-none">{user.name || 'Member'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user.role === 'admin' ? '/admin' : '/dashboard/profile'}>
                    <UserCircle className="mr-2 h-4 w-4" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={user.role === 'admin' ? '/admin/settings' : '/dashboard/settings'}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Membership
                  </Link>
                </DropdownMenuItem>
                {user.role !== 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
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
          ) : (
            <>
              <Button variant="ghost" asChild className="font-medium">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-brand-gradient shadow-glow font-semibold">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden glass border-t border-white/40 animate-fade-in">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary bg-primary/5'
                    : 'text-foreground hover:bg-secondary'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-border">
              {user ? (
                <>
                  <Button asChild className="w-full bg-brand-gradient font-semibold">
                    <Link href={home}>{user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}</Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={async () => { await logout(); router.push('/login'); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-brand-gradient">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
