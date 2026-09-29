'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { PublicUser } from '@/lib/types';

interface SessionValue {
  user: PublicUser | null;
  /** 'checking' only ever shows a skeleton: an anonymous flash on a protected page reads as a bug. */
  status: 'checking' | 'anonymous' | 'active';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; displayName: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<SessionValue['status']>('checking');

  useEffect(() => {
    let settled = false;
    api
      .get<{ user: PublicUser }>('auth/me')
      // a stale cookie is not an error worth showing: the sign-in screen is the honest state
      .then((session) => {
        if (settled) return;
        setUser(session.user);
        setStatus('active');
      })
      .catch(() => {
        if (settled) return;
        setUser(null);
        setStatus('anonymous');
      });
    return () => {
      settled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.post<{ user: PublicUser }>('auth/login', { email, password });
    setUser(session.user);
    setStatus('active');
  }, []);

  const signUp = useCallback(async (input: { email: string; displayName: string; password: string }) => {
    const session = await api.post<{ user: PublicUser }>('auth/register', input);
    setUser(session.user);
    setStatus('active');
  }, []);

  const signOut = useCallback(async () => {
    await api.post('auth/logout');
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(() => ({ user, status, signIn, signUp, signOut }), [user, status, signIn, signUp, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
