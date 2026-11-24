'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  type User,
  type UserRole,
} from '@/client/lib/auth';
import { fetchAdminLogin, fetchLogout } from '@/client/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  loading: boolean;
  login: (role: 'guest') => void;
  loginAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function initAuth() {
      const currentUser = getCurrentUser();
      if (currentUser?.role === 'admin') {
        try {
          const res = await fetch('/api/auth/session', { cache: 'no-store' });
          const data = (await res.json()) as { admin?: boolean };
          if (!cancelled && !data.admin) {
            authLogout();
            setUser(null);
            setLoading(false);
            return;
          }
        } catch {
          // Keep current state if session check fails due to transient network error
        }
      }
      if (!cancelled) {
        setUser(currentUser);
        setLoading(false);
      }
    }
    void initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = (role: UserRole) => {
    const loggedInUser = authLogin(role);
    setUser(loggedInUser);
    if (role === 'admin') {
      router.push('/');
    } else {
      router.push('/directory');
    }
  };

  const handleAdminLogin = async (username: string, password: string) => {
    await fetchAdminLogin(username, password);
    const loggedInUser = authLogin('admin');
    setUser(loggedInUser);
    router.push('/');
  };

  const handleLogout = () => {
    void fetchLogout().catch(() => {});
    authLogout();
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isGuest: user?.role === 'guest',
    loading,
    login: (role: 'guest') => handleLogin(role),
    loginAdmin: handleAdminLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}