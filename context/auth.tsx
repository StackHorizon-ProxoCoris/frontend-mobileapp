// ============================================================
// Auth Context — Manajemen state autentikasi global
// Menyediakan login, register, logout, dan data user
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiPost, apiGet, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api';

// Key untuk menyimpan role di SecureStore
const ROLE_KEY = 'siaga_user_role';

// ============================================================
// Tipe Data
// ============================================================

/** Tipe role pengguna */
export type UserRole = 'user' | 'pemerintah' | 'admin';

/** Data user yang tersedia di seluruh app */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  phone: string;
  bio: string;
  district: string;
  city: string;
  province: string;
  ecoPoints: number;
  currentBadge: string;
  totalReports: number;
  totalActions: number;
  rank: number;
  weeklyPoints: number;
  badges: { icon: string; color: string; bg: string; border: string; label: string; active: boolean; threshold: number }[];
  badgeCount: { active: number; total: number };
  settings: Record<string, boolean>;
  role: UserRole;
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
  role: UserRole;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
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
  const [role, setRole] = useState<UserRole>('user');

  // ----------------------------------------------------------
  // Cek token saat app pertama kali dibuka
  // ----------------------------------------------------------
  useEffect(() => {
    checkExistingToken();
  }, []);

  async function checkExistingToken() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const savedRole = await SecureStore.getItemAsync(ROLE_KEY);
      if (savedRole) setRole(savedRole as UserRole);
      if (token) {
        await fetchUserProfile(savedRole as UserRole || 'user');
      }
    } catch {
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  // ----------------------------------------------------------
  // Ambil profil user dari backend
  // ----------------------------------------------------------
  const fetchUserProfile = useCallback(async (userRole: UserRole = 'user') => {
    const response = await apiGet<any>('/auth/me');

    if (response.success && response.data) {
      const d = response.data;
      setUser({
        id: d.id || d.authId,
        email: d.email,
        fullName: d.fullName || d.full_name || '',
        initials: d.initials || '',
        phone: d.phone || '',
        bio: d.bio || '',
        district: d.district || d.location?.district || '',
        city: d.city || d.location?.city || 'Kota Bandung',
        province: d.province || d.location?.province || 'Jawa Barat',
        ecoPoints: d.ecoPoints || d.eco_points || 0,
        currentBadge: d.currentBadge || d.current_badge || 'Warga Baru',
        totalReports: d.totalReports || d.total_reports || 0,
        totalActions: d.totalActions || d.total_actions || 0,
        rank: d.rank || 0,
        weeklyPoints: d.weeklyPoints || 0,
        badges: d.badges || [],
        badgeCount: d.badgeCount || { active: 0, total: 0 },
        settings: d.settings || {},
        role: userRole,
      });
    } else {
      await clearTokens();
    }
  }, []);

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------
  async function login(email: string, password: string, selectedRole: UserRole = 'user') {
    const response = await apiPost<any>('/auth/login', { email, password }, false);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;

      // Simpan tokens + role ke SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(ROLE_KEY, selectedRole);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }

      setRole(selectedRole);
      await fetchUserProfile(selectedRole);

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
    setRole('user');
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  async function clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(ROLE_KEY);
    setUser(null);
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    role,
    login,
    register,
    logout,
    refreshUser: () => fetchUserProfile(role),
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
