import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success('Password reset email sent');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-10 w-10 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-2xl font-bold font-display">NextUp</span>
        </Link>

        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <h1 className="text-xl font-bold font-display mb-2">Check your email</h1>
              <p className="text-sm text-muted-foreground mb-4">We've sent a password reset link to {email}</p>
              <Link to="/login" className="text-brand-600 font-medium hover:underline">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold font-display mb-1">Reset password</h1>
              <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
              </form>
              <p className="text-sm text-center text-muted-foreground mt-4">
                <Link to="/login" className="text-brand-600 font-medium hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
