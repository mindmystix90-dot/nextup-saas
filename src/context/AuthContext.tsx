import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, AccountType } from '@/types';
import { generateReferralCode } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, accountType: AccountType, referralCode?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await loadProfile(session.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const signUp = useCallback(async (
    email: string, password: string, name: string, accountType: AccountType, referralCode?: string,
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Registration failed. Please try again.' };

    const uid = data.user.id;
    const myReferralCode = generateReferralCode(name);

    // Find referrer if code provided
    let referrerId: string | null = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('profiles').select('id').eq('referral_code', referralCode).maybeSingle();
      referrerId = referrer?.id ?? null;
    }

    // Create profile
    await supabase.from('profiles').insert({
      id: uid, email, name, role: 'user', account_type: accountType,
      membership: 'starter', membership_status: 'active',
      referral_code: myReferralCode, referred_by: referrerId,
    });

    // Create wallet
    await supabase.from('wallets').insert({ user_id: uid });

    // Create settings
    await supabase.from('settings').insert({ user_id: uid });

    // Create affiliate stats
    await supabase.from('affiliate_stats').insert({
      user_id: uid, referral_code: myReferralCode, enabled: accountType === 'workplace',
    });

    // Create welcome notification
    await supabase.from('notifications').insert({
      user_id: uid, title: 'Welcome to NextUp!', message: 'Your account has been created. Explore courses and start learning!',
      type: 'success',
    });

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: uid, action: 'registration', description: 'Account created',
    });

    // If referred, create referral record
    if (referrerId) {
      await supabase.from('referrals').insert({
        referrer_id: referrerId, referred_id: uid,
        referred_name: name, referred_email: email, status: 'registered',
      });

      // Increment referrer's registration count
      await supabase.rpc('increment_affiliate_registrations', { referrer_uid: referrerId });

      // Notify referrer
      await supabase.from('notifications').insert({
        user_id: referrerId, title: 'New Referral!',
        message: `${name} registered using your referral code.`, type: 'info',
      });
    }

    await loadProfile(uid);
    return { error: null };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
