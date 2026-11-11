import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, CreditsMeResponse } from '../types';

interface AuthContextType {
  user: UserSession | null;
  creditsData: CreditsMeResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone: string, referralCode?: string) => Promise<{ otp_required?: boolean; email?: string }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [creditsData, setCreditsData] = useState<CreditsMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/v1/credits/me');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCreditsData(json.data);
          setUser((prev: UserSession | null) => ({
            id: prev?.id || '01m6rd9vpzwrzh8p8dkvhdbdkt',
            email: prev?.email || 'babaaristote6@gmail.com',
            phone: prev?.phone || '+2250152311124',
            is_admin: json.data.is_admin,
            credits: json.data.credits,
            free_scans: json.data.free_scans,
            created_at: prev?.created_at || '2026-11-06T12:28:26Z',
          }));
        }
      } else if (res.status === 401) {
        setUser(null);
        setCreditsData(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.msg || 'Identifiants incorrects.');
    }
    await fetchCredits();
  };

  const register = async (email: string, password: string, phone: string, referralCode?: string) => {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, phone, referral_code: referralCode }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.msg || 'Erreur lors de la création du compte.');
    }
    await fetchCredits();
    return data || {};
  };

  const verifyOtp = async (email: string, code: string) => {
    const res = await fetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.msg || 'Code OTP invalide.');
    }
    await fetchCredits();
  };

  const resendOtp = async (email: string) => {
    const res = await fetch('/api/v1/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.msg || "Erreur lors de l'envoi de l'OTP.");
    }
  };

  const logout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => null);
    setUser(null);
    setCreditsData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        creditsData,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        refreshUser: fetchCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
