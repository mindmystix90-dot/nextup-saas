import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { GraduationCap, Briefcase, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { AccountType } from '@/types';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('learning');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);

  const refFromUrl = new URLSearchParams(window.location.search).get('ref');
  if (refFromUrl && !refCode) setRefCode(refFromUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name, accountType, refCode || undefined);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success('Account created! Welcome to NextUp.');
    navigate('/app');
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
          <h1 className="text-xl font-bold font-display mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose your path and start your journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">I want to use NextUp for</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('learning')}
                  className={`p-4 rounded-xl border-2 transition-all ${accountType === 'learning' ? 'border-brand-600 bg-brand-50' : 'border-border'}`}
                >
                  <GraduationCap className={`h-6 w-6 mx-auto mb-2 ${accountType === 'learning' ? 'text-brand-600' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-semibold">Learning</p>
                  <p className="text-xs text-muted-foreground mt-1">Access courses & grow skills</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('workplace')}
                  className={`p-4 rounded-xl border-2 transition-all ${accountType === 'workplace' ? 'border-brand-600 bg-brand-50' : 'border-border'}`}
                >
                  <Briefcase className={`h-6 w-6 mx-auto mb-2 ${accountType === 'workplace' ? 'text-brand-600' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-semibold">Workplace</p>
                  <p className="text-xs text-muted-foreground mt-1">Earn as affiliate or sales partner</p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" placeholder="John Doe" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="input-field" placeholder="••••••" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Referral code (optional)</label>
              <input type="text" value={refCode} onChange={(e) => setRefCode(e.target.value)} className="input-field" placeholder="ABC123" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
