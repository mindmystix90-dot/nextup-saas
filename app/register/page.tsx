'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthShell } from '@/components/site/auth-shell';
import { useAuth } from '@/hooks/use-auth';

const PW_RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Number', test: (v: string) => /\d/.test(v) },
];

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email || !pw) {
      setError('Please fill in all fields.');
      return;
    }
    if (!agreed) {
      setError('Please accept the Terms and Privacy Policy.');
      return;
    }
    if (pw.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    const res = await register(name, email, pw);
    if (!res.ok) {
      setError(res.error || 'Registration failed.');
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    if (!res.ok) {
      setError(res.error || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start learning in minutes. No credit card required."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name" placeholder="Aarav Sharma" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Create a password"
              className="pl-10 pr-10"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {PW_RULES.map((r) => {
              const ok = r.test(pw);
              return (
                <span key={r.label} className="flex items-center gap-1.5 text-xs">
                  <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${ok ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                    {ok && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{r.label}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="terms" className="mt-0.5" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground cursor-pointer leading-relaxed">
            I agree to the{' '}
            <Link href="#" className="font-medium text-primary hover:underline">Terms</Link> and{' '}
            <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
          </Label>
        </div>
        <Button type="submit" disabled={submitting || googleLoading} className="w-full bg-brand-gradient shadow-glow font-semibold h-11">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or sign up with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 font-medium"
          disabled={submitting || googleLoading}
          onClick={handleGoogle}
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Google'}
        </Button>
      </form>
    </AuthShell>
  );
}
