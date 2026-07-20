'use client';

import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/site/auth-shell';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { sendPasswordReset } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setSubmitting(true);
    const res = await sendPasswordReset(email);
    setSubmitting(false);
    if (res.ok) {
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } else {
      toast.error(res.error || 'Could not send reset link.');
    }
  }

  return (
    <AuthShell
      title={sent ? 'Check your email' : 'Forgot password'}
      subtitle={
        sent
          ? 'We sent a reset link to your inbox. It expires in 30 minutes.'
          : 'Enter your email and we’ll send you a reset link.'
      }
      footer={
        <>
          Remember your password?{' '}
          <a href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </a>
        </>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center py-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              Didn&apos;t get it? Check your spam folder, or{' '}
              <button onClick={() => setSent(false)} className="font-semibold text-primary hover:underline">
                try a different email
              </button>
              .
            </p>
          </div>
          <Button asChild className="w-full bg-brand-gradient shadow-glow font-semibold h-11">
            <a href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
            </a>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-brand-gradient shadow-glow font-semibold h-11">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send reset link <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
