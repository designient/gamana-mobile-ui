import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Session } from '../types';

const SESSION_KEY = 'gamana_session';

export interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  login: (session: Session) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (new Date(session.expiresAt) <= new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function persistSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(loadSession());
    setIsLoading(false);
  }, []);

  const login = useCallback((newSession: Session) => {
    persistSession(newSession);
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    persistSession(null);
    setSession(null);
    localStorage.removeItem('gamana_selected_org');
    localStorage.removeItem('gamana_org_memberships');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
