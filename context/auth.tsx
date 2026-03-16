// ============================================================
// Auth Context — Manajemen state autentikasi global
// Menyediakan login, register, logout, dan data user
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  apiPost,
  apiGet,
  apiDelete,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearStoredTokens,
  hasStoredSession,
  registerSessionInvalidatedCallback,
  unregisterSessionInvalidatedCallback,
} from '../services/api';
import { usePushNotifications } from '../hooks/usePushNotifications';

const HOME_TUTORIAL_ELIGIBLE_KEY_PREFIX = 'siaga_tutorial_eligible:';

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
  avatarUrl: string;
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

interface FetchUserProfileResult {
  success: boolean;
  message: string;
  user?: AuthUser;
}

// ============================================================
// Context & Provider
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_CACHE_KEY = 'siaga_auth_user';

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

  const persistCachedUser = useCallback(async (nextUser: AuthUser | null) => {
    try {
      if (nextUser) {
        await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(nextUser));
      } else {
        await SecureStore.deleteItemAsync(USER_CACHE_KEY);
      }
    } catch {
      // Non-blocking cache write
    }
  }, []);

  const readCachedUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const cached = await SecureStore.getItemAsync(USER_CACHE_KEY);
      if (!cached) return null;

      const parsed = JSON.parse(cached) as Partial<AuthUser>;
      if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.email) {
        return null;
      }

      return {
        id: parsed.id,
        email: parsed.email,
        fullName: parsed.fullName || '',
        initials: parsed.initials || '',
        phone: parsed.phone || '',
        bio: parsed.bio || '',
        avatarUrl: parsed.avatarUrl || '',
        district: parsed.district || '',
        city: parsed.city || 'Kota Bandung',
        province: parsed.province || 'Jawa Barat',
        ecoPoints: parsed.ecoPoints || 0,
        currentBadge: parsed.currentBadge || 'Warga Baru',
        totalReports: parsed.totalReports || 0,
        totalActions: parsed.totalActions || 0,
        rank: parsed.rank || 0,
        weeklyPoints: parsed.weeklyPoints || 0,
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        badgeCount: parsed.badgeCount || { active: 0, total: 0 },
        settings: parsed.settings || {},
        role: normalizeRole(parsed.role),
        nip: parsed.nip || '',
        jabatan: parsed.jabatan || '',
        instansi: parsed.instansi || '',
        unitKerja: parsed.unitKerja || '',
        golongan: parsed.golongan || '',
        tmt: parsed.tmt || '',
      };
    } catch {
      return null;
    }
  }, [normalizeRole]);

  // Push notification token
  const { registerForPushNotifications } = usePushNotifications();
  const pushTokenRef = useRef<string | null>(null);

  // Fire-and-forget: register push token dan kirim ke backend
  const syncPushToken = useCallback(async () => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        pushTokenRef.current = token;
        apiPost('/device-tokens', {
          token,
          platform: Platform.OS,
        }).catch(() => { /* silent */ });
      }
    } catch {
      // Non-blocking: jangan ganggu flow auth
    }
  }, [registerForPushNotifications]);

  const markTutorialEligibleForNewUser = useCallback(async (userId: string) => {
    try {
      await SecureStore.setItemAsync(`${HOME_TUTORIAL_ELIGIBLE_KEY_PREFIX}${userId}`, 'true');
    } catch {
      // Non-blocking
    }
  }, []);

  const clearAuthState = useCallback(async () => {
    await clearStoredTokens();
    await persistCachedUser(null);
    setUser(null);
    setRole('user');
    pushTokenRef.current = null;
  }, [persistCachedUser]);

  // ----------------------------------------------------------
  // Sinkronisasi invalidasi sesi dari API client
  // ----------------------------------------------------------
  useEffect(() => {
    registerSessionInvalidatedCallback(() => {
      void persistCachedUser(null);
      setUser(null);
      setRole('user');
      pushTokenRef.current = null;
      setIsLoading(false);
    });

    return () => {
      unregisterSessionInvalidatedCallback();
    };
  }, [persistCachedUser]);

  // ----------------------------------------------------------
  // Ambil profil user dari backend
  // ----------------------------------------------------------
  const fetchUserProfile = useCallback(async (): Promise<FetchUserProfileResult> => {
    const response = await apiGet<any>('/auth/me');

    if (response.success && response.data) {
      const d = response.data;
      const backendRole = normalizeRole(d.role);

      const hydratedUser: AuthUser = {
        id: d.authId || d.auth_id || d.id,
        email: d.email,
        fullName: d.fullName || d.full_name || '',
        initials: d.initials || '',
        phone: d.phone || '',
        bio: d.bio || '',
        avatarUrl: d.avatarUrl || d.avatar_url || '',
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
        nip: d.nip || '',
        jabatan: d.jabatan || '',
        instansi: d.instansi || '',
        unitKerja: d.unitKerja || d.unit_kerja || '',
        golongan: d.golongan || '',
        tmt: d.tmt || '',
      };

      setUser(hydratedUser);
      setRole(backendRole);
      persistCachedUser(hydratedUser);

      syncPushToken();

      return { success: true, message: response.message, user: hydratedUser };
    }

    if (response.statusCode === 401) {
      await clearAuthState();
      return { success: false, message: response.message || 'Sesi login telah berakhir.' };
    }

    return { success: false, message: response.message || 'Gagal memuat profil pengguna.' };
  }, [clearAuthState, normalizeRole, persistCachedUser, syncPushToken]);

  // ----------------------------------------------------------
  // Cek token saat app pertama kali dibuka
  // ----------------------------------------------------------
  const restoreSession = useCallback(async () => {
    try {
      const hasSession = await hasStoredSession();
      if (!hasSession) {
        await clearAuthState();
        return;
      }

      const cachedUser = await readCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
        setRole(normalizeRole(cachedUser.role));
      }

      const profile = await fetchUserProfile();
      if (!profile.success) {
        const stillHasSession = await hasStoredSession();
        if (!stillHasSession) {
          await clearAuthState();
          return;
        }

        if (!cachedUser) {
          await clearAuthState();
          return;
        }
      }
    } catch {
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState, fetchUserProfile, normalizeRole, readCachedUser]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------
  async function login(email: string, password: string, role?: UserRole) {
    const response = await apiPost<any>('/auth/login', { email, password, role }, false);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }

      const profile = await fetchUserProfile();
      if (!profile.success) {
        await clearAuthState();
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
      const registeredUserId = response.data.user?.id || response.data.user?.authId || response.data.user?.auth_id;

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
      if (registeredUserId) {
        await markTutorialEligibleForNewUser(registeredUserId);
      }

      const profile = await fetchUserProfile();
      if (!profile.success) {
        await clearAuthState();
        return { success: false, message: profile.message };
      }

      if (profile.user?.id && profile.user.id !== registeredUserId) {
        await markTutorialEligibleForNewUser(profile.user.id);
      }

      return { success: true, message: response.message };
    }

    return { success: false, message: response.message || 'Registrasi gagal.' };
  }

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------
  async function logout() {
    const deviceToken = pushTokenRef.current;

    if (deviceToken) {
      apiDelete('/device-tokens', { token: deviceToken }, true)
        .catch(() => { /* silent */ });
    }

    await apiPost('/auth/logout');
    await clearAuthState();
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
