// ============================================================
// Auth Context — Manajemen state autentikasi global
// Menyediakan login, register, logout, dan data user
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiPost, apiGet, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api';
import { usePushNotifications } from '../hooks/usePushNotifications';

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
  // Gov-specific fields (optional — only for role 'pemerintah')
  nip?: string;
  jabatan?: string;
  instansi?: string;
  unitKerja?: string;
  golongan?: string;
  tmt?: string;
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

  const normalizeRole = useCallback((value: unknown): UserRole => {
    if (value === 'pemerintah' || value === 'admin' || value === 'user') {
      return value;
    }
    return 'user';
  }, []);

  // Push notification token
  const { registerForPushNotifications } = usePushNotifications();
  const pushTokenRef = useRef<string | null>(null);

  // Fire-and-forget: register push token dan kirim ke backend
  const syncPushToken = useCallback(async () => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        pushTokenRef.current = token;
        // Kirim ke backend (fire-and-forget)
        apiPost('/device-tokens', {
          token,
          platform: Platform.OS,
        }).catch(() => { /* silent */ });
      }
    } catch {
      // Non-blocking: jangan ganggu flow auth
    }
  }, [registerForPushNotifications]);

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
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  // ----------------------------------------------------------
  // Ambil profil user dari backend
  // ----------------------------------------------------------
  const fetchUserProfile = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiGet<any>('/auth/me');

    if (response.success && response.data) {
      const d = response.data;
      const backendRole = normalizeRole(d.role);

      setUser({
        id: d.authId || d.auth_id || d.id,
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
        role: backendRole,
        // Gov-specific
        nip: d.nip || '',
        jabatan: d.jabatan || '',
        instansi: d.instansi || '',
        unitKerja: d.unitKerja || d.unit_kerja || '',
        golongan: d.golongan || '',
        tmt: d.tmt || '',
      });
      setRole(backendRole);

      // Sinkronisasi push token setelah user berhasil dimuat
      syncPushToken();

      return { success: true, message: response.message };
    }

    if (response.statusCode === 401) {
      await clearTokens();
      setRole('user');
    }

    return { success: false, message: response.message || 'Gagal memuat profil pengguna.' };
  }, [normalizeRole]);

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------
  async function login(email: string, password: string, role?: UserRole) {
    const response = await apiPost<any>('/auth/login', { email, password, role }, false);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;

      // Simpan tokens
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }

      const profile = await fetchUserProfile();
      if (!profile.success) {
        await clearTokens();
        setRole('user');
        return { success: false, message: profile.message };
      }

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
      const profile = await fetchUserProfile();
      if (!profile.success) {
        await clearTokens();
        setRole('user');
        return { success: false, message: profile.message };
      }

      return { success: true, message: response.message };
    }

    return { success: false, message: response.message || 'Registrasi gagal.' };
  }

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------
  async function logout() {
    // Nonaktifkan push token di backend sebelum logout
    if (pushTokenRef.current) {
      apiPost('/device-tokens', undefined, true)
        .catch(() => { /* silent */ });
      // Atau bisa pakai DELETE, tapi apiPost lebih simple untuk fire-and-forget
    }
    await apiPost('/auth/logout');
    await clearTokens();
    setUser(null);
    setRole('user');
    pushTokenRef.current = null;
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
    role,
    login,
    register,
    logout,
    refreshUser: async () => {
      await fetchUserProfile();
    },
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
