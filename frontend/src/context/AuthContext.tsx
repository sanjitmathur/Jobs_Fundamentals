'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { loginApi, registerApi } from '../lib/api/auth';
import { getStoredToken, setStoredToken, setUnauthorizedHandler } from '../lib/api/client';
import { decodeJwt, isTokenExpired } from '../lib/utils';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: (message?: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = getStoredToken();
    if (stored && !isTokenExpired(stored)) return stored;
    if (stored) setStoredToken(null);
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = getStoredToken();
    if (stored && !isTokenExpired(stored)) {
      const payload = decodeJwt(stored);
      if (payload) {
        return {
          id: payload.userId,
          email: '',
          role: payload.role,
        };
      }
    }
    return null;
  });

  const [isLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const logout = useCallback(
    (message?: string) => {
      setStoredToken(null);
      setToken(null);
      setUser(null);
      if (message) {
        showToast(message, 'info');
      }
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
    },
    [pathname, router, showToast]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout('Your session has expired. Please log in again.');
    });
  }, [logout]);

  const login = async (credentials: LoginCredentials) => {
    const res = await loginApi(credentials);
    const newToken = res.data.token;
    setStoredToken(newToken);
    setToken(newToken);

    const payload = decodeJwt(newToken);
    if (payload) {
      setUser({
        id: payload.userId,
        email: credentials.email,
        role: payload.role,
      });
    }

    showToast('Logged in successfully', 'success');
    router.push('/jobs');
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerApi(credentials);
    showToast('Account created successfully. Logging you in...', 'success');
    await login(credentials);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
