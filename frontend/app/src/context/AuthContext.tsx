import React from 'react';
import {
  getSession,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  SessionPayload,
} from '../lib/api';

type AuthContextType = {
  session: SessionPayload;
  loading: boolean;
  refreshSession: () => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: {
    email: string;
    password: string;
    password_confirm: string;
    display_name: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const EMPTY_SESSION: SessionPayload = {
  authenticated: false,
  account: null,
  is_admin: false,
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<SessionPayload>(EMPTY_SESSION);
  const [loading, setLoading] = React.useState(true);

  const refreshSession = React.useCallback(async () => {
    const result = await getSession();
    if (result.ok) {
      setSession(result.data);
    } else {
      setSession(EMPTY_SESSION);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      const result = await getSession();
      if (!active) {
        return;
      }
      if (result.ok) {
        setSession(result.data);
      } else {
        setSession(EMPTY_SESSION);
      }
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (payload: { email: string; password: string }) => {
    const result = await apiLogin(payload);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    setSession(result.data);
    return { ok: true };
  }, []);

  const register = React.useCallback(async (payload: {
    email: string;
    password: string;
    password_confirm: string;
    display_name: string;
  }) => {
    const result = await apiRegister(payload);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    setSession(result.data);
    return { ok: true };
  }, []);

  const logout = React.useCallback(async () => {
    await apiLogout();
    setSession(EMPTY_SESSION);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, refreshSession, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
