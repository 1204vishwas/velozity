import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { authApi } from '../api/auth.api';
import { setAccessToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: Role) => Promise<void>;
  socialLogin: (
    provider: 'google' | 'facebook',
    email: string,
    name: string,
    avatarUrl?: string,
    role?: Role
  ) => Promise<void>;
  quickLogin: (preset: 'ADMIN' | 'PM1' | 'PM2' | 'DEV1' | 'DEV2') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PRESET_ACCOUNTS = {
  ADMIN: { email: 'admin@velozity.com', password: 'Password123!', label: 'Admin (Ravi Sharma)' },
  PM1: { email: 'pm1@velozity.com', password: 'Password123!', label: 'PM 1 (Sarah Jenkins)' },
  PM2: { email: 'pm2@velozity.com', password: 'Password123!', label: 'PM 2 (Michael Chang)' },
  DEV1: { email: 'dev1@velozity.com', password: 'Password123!', label: 'Dev 1 (Alex Rivera)' },
  DEV2: { email: 'dev2@velozity.com', password: 'Password123!', label: 'Dev 2 (Elena Rostova)' },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial auth check via HttpOnly refresh cookie
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { accessToken, user: currentUser } = await authApi.refresh();
        if (isMounted) {
          setToken(accessToken);
          setUser(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { accessToken, user: loggedUser } = await authApi.login(email, password);
      setToken(accessToken);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role?: Role) => {
    setIsLoading(true);
    try {
      const { accessToken, user: registeredUser } = await authApi.signup({
        name,
        email,
        password,
        role,
      });
      setToken(accessToken);
      setUser(registeredUser);
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (
    provider: 'google' | 'facebook',
    email: string,
    name: string,
    avatarUrl?: string,
    role?: Role
  ) => {
    setIsLoading(true);
    try {
      const { accessToken, user: socialUser } = await authApi.socialLogin({
        provider,
        email,
        name,
        avatarUrl,
        role,
      });
      setToken(accessToken);
      setUser(socialUser);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (presetKey: 'ADMIN' | 'PM1' | 'PM2' | 'DEV1' | 'DEV2') => {
    const preset = PRESET_ACCOUNTS[presetKey];
    if (preset) {
      await login(preset.email, preset.password);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        socialLogin,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
