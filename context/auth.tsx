// ============================================================
// Auth Context — Manajemen state autentikasi global
// Menyediakan login, register, logout, dan data user
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiPost, apiGet, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api';

// ============================================================
// Tipe Data
// ============================================================

/** Data user yang tersedia di seluruh app */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  phone: string;
  district: string;
  city: string;
  province: string;
  ecoPoints: number;
  currentBadge: string;
  totalReports: number;
  totalActions: number;
}

/** Data yang dibutuhkan untuk register */
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  district?: string;
  city?: string;
}

/** State dan methods yang di-expose ke seluruh app */
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================
// Context & Provider
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ----------------------------------------------------------
  // Cek token saat app pertama kali dibuka
  // ----------------------------------------------------------
  useEffect(() => {
    checkExistingToken();
  }, []);

  async function checkExistingToken() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        await fetchUserProfile();
      }
    } catch {
      // Token tidak valid atau expired
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  // ----------------------------------------------------------
  // Ambil profil user dari backend
  // ----------------------------------------------------------
  const fetchUserProfile = useCallback(async () => {
    const response = await apiGet<any>('/auth/me');

    if (response.success && response.data) {
      const d = response.data;
      setUser({
        id: d.id || d.authId,
        email: d.email,
        fullName: d.fullName || d.full_name || '',
        initials: d.initials || '',
        phone: d.phone || '',
        district: d.district || '',
        city: d.city || 'Kota Bandung',
        province: d.province || 'Jawa Barat',
        ecoPoints: d.ecoPoints || d.eco_points || 0,
        currentBadge: d.currentBadge || d.current_badge || 'Warga Baru',
        totalReports: d.totalReports || d.total_reports || 0,
        totalActions: d.totalActions || d.total_actions || 0,
      });
    } else {
      // Token expired atau invalid
      await clearTokens();
    }
  }, []);

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------
  async function login(email: string, password: string) {
    const response = await apiPost<any>('/auth/login', { email, password }, false);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;

      // Simpan tokens ke SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }

      // Ambil profil user
      await fetchUserProfile();

      return { success: true, message: response.message };
    }

    return { success: false, message: response.message || 'Login gagal.' };
  }

  // ----------------------------------------------------------
  // Register
  // ----------------------------------------------------------
  async function register(data: RegisterData) {
    const response = await apiPost<any>('/auth/register', data, false);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;

      // Simpan tokens
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }

      // Ambil profil user
      await fetchUserProfile();

      return { success: true, message: response.message };
    }

    return { success: false, message: response.message || 'Registrasi gagal.' };
  }

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------
  async function logout() {
    await apiPost('/auth/logout');
    await clearTokens();
    setUser(null);
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  async function clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setUser(null);
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser: fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook — Akses auth dari komponen manapun
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  }
  return context;
}
