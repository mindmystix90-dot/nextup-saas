'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthResult, FirestoreProfile, SessionUser } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  profile: FirestoreProfile | null;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updateProfile: (updates: Partial<Pick<FirestoreProfile, 'name' | 'phone' | 'photoURL' | 'address'>>) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<FirestoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((sessionUser) => {
      setUser(sessionUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }
    const unsubscribe = authService.subscribeProfile(user.uid, setProfile);
    return unsubscribe;
  }, [user?.uid]);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const res = await authService.register(name, email, password);
      if (res.ok && res.user) {
        setUser(res.user);
        router.push('/dashboard');
      }
      return res;
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const res = await authService.login(email, password);
      if (res.ok && res.user) {
        setUser(res.user);
        router.push(res.user.role === 'admin' ? '/admin' : '/dashboard');
      }
      return res;
    },
    [router]
  );

  const loginWithGoogle = useCallback(
    async (): Promise<AuthResult> => {
      const res = await authService.loginWithGoogle();
      if (res.ok && res.user) {
        setUser(res.user);
        router.push(res.user.role === 'admin' ? '/admin' : '/dashboard');
      }
      return res;
    },
    [router]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  const sendPasswordReset = useCallback(
    (email: string) => authService.sendPasswordReset(email),
    []
  );

  const updateProfile = useCallback(
    async (updates: Partial<Pick<FirestoreProfile, 'name' | 'phone' | 'photoURL' | 'address'>>): Promise<AuthResult> => {
      const res = await authService.updateProfile(updates);
      if (res.ok && res.user) setUser(res.user);
      return res;
    },
    []
  );

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string) => authService.changePassword(currentPassword, newPassword),
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      profile,
      register,
      login,
      loginWithGoogle,
      logout,
      sendPasswordReset,
      updateProfile,
      changePassword,
    }),
    [user, loading, profile, register, login, loginWithGoogle, logout, sendPasswordReset, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
