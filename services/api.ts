// ============================================================
// API Client — Base HTTP client untuk komunikasi dengan backend
// Menggunakan fetch() bawaan React Native
// ============================================================

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── Flexible Base URL ────────────────────────────────────────────────────────
// Prioritas:
// 1. app.json > expo.extra.apiUrl  (production .apk/.ipa)
// 2. Auto-detect dari Expo debuggerHost (physical device dev)
// 3. Platform-specific fallback    (emulator/simulator)
//
// Tidak perlu set manual saat development!
// Untuk production: set "apiUrl" di app.json > expo.extra
// ──────────────────────────────────────────────────────────────────────────────

const BACKEND_PORT = 3000;

function getBaseUrl(): string {
  // 1. Production: pakai apiUrl dari app.json extra
  const envUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (envUrl) return envUrl;

  // 2. Web: selalu localhost
  if (Platform.OS === 'web') return `http://localhost:${BACKEND_PORT}/api`;

  // 3. Auto-detect IP dari Expo dev server (works di Expo Go & physical device)
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0]; // "192.168.1.5:8081" → "192.168.1.5"
    return `http://${ip}:${BACKEND_PORT}/api`;
  }

  // 4. Fallback: Android emulator → 10.0.2.2, iOS → localhost
  return Platform.select({
    android: `http://10.0.2.2:${BACKEND_PORT}/api`,
    default: `http://localhost:${BACKEND_PORT}/api`,
  }) as string;
}

const BASE_URL = getBaseUrl();

// Key untuk menyimpan token di SecureStore
export const TOKEN_KEY = 'siaga_auth_token';
export const REFRESH_TOKEN_KEY = 'siaga_refresh_token';

let refreshSessionPromise: Promise<boolean> | null = null;

// ============================================================
// Tipe Response dari Backend
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// HTTP Methods — Wrapper fetch() dengan auth header
// ============================================================

/**
 * Ambil token dari SecureStore
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearStoredTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function hasStoredSession(): Promise<boolean> {
  const [accessToken, refreshToken] = await Promise.all([
    getAuthToken(),
    getRefreshToken(),
  ]);
  return Boolean(accessToken || refreshToken);
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...(headers as Record<string, string>) };
}

// ─── Global Error / Session Callbacks ────────────────────────────────────────

type NetworkErrorCallback = (message: string, errorDetail?: string) => void;
let _onNetworkError: NetworkErrorCallback | null = null;

type ForbiddenErrorCallback = (message: string) => void;
let _onForbiddenError: ForbiddenErrorCallback | null = null;

type SessionInvalidatedCallback = (reason?: string) => void;
let _onSessionInvalidated: SessionInvalidatedCallback | null = null;

export function registerNetworkErrorCallback(cb: NetworkErrorCallback) {
  _onNetworkError = cb;
}

export function unregisterNetworkErrorCallback() {
  _onNetworkError = null;
}

export function registerForbiddenCallback(cb: ForbiddenErrorCallback) {
  _onForbiddenError = cb;
}

export function unregisterForbiddenCallback() {
  _onForbiddenError = null;
}

export function registerSessionInvalidatedCallback(cb: SessionInvalidatedCallback) {
  _onSessionInvalidated = cb;
}

export function unregisterSessionInvalidatedCallback() {
  _onSessionInvalidated = null;
}

async function clearSessionState(reason?: string): Promise<void> {
  await clearStoredTokens();
  _onSessionInvalidated?.(reason);
}

async function refreshAuthSession(): Promise<boolean> {
  if (refreshSessionPromise) {
    return refreshSessionPromise;
  }

  refreshSessionPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearSessionState('missing_refresh_token');
      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      let data: ApiResponse<{ accessToken: string; refreshToken?: string }>;
      try {
        data = await response.json();
      } catch {
        data = {
          success: false,
          message: 'Gagal memperbarui sesi login.',
        };
      }

      if (response.ok && data.success && data.data?.accessToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, data.data.accessToken);
        if (data.data.refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.data.refreshToken);
        }
        return true;
      }

      if (response.status === 400 || response.status === 401) {
        await clearSessionState('refresh_rejected');
      }

      return false;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshSessionPromise;
  } finally {
    refreshSessionPromise = null;
  }
}

/**
 * Bangun headers dengan otorisasi
 */
async function buildHeaders(
  includeAuth = true,
  contentType: string | null = 'application/json'
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Request handler utama — menangani response & error secara konsisten
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  config: { includeAuth?: boolean; retryOnUnauthorized?: boolean } = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: options.headers as Record<string, string>,
    });

    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      data = {
        success: response.ok,
        message: response.ok ? 'OK' : 'Terjadi kesalahan pada server.',
      };
    }

    data.statusCode = response.status;

    if (response.status === 401 && config.includeAuth && config.retryOnUnauthorized !== false) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        const retryHeaders = normalizeHeaders(options.headers);
        const latestToken = await getAuthToken();

        if (latestToken) {
          retryHeaders['Authorization'] = `Bearer ${latestToken}`;
        } else {
          delete retryHeaders['Authorization'];
        }

        return request<T>(
          endpoint,
          {
            ...options,
            headers: retryHeaders,
          },
          {
            ...config,
            retryOnUnauthorized: false,
          }
        );
      }
    }

    if (response.status === 403 && _onForbiddenError) {
      _onForbiddenError(data.message || 'Akun Anda bukan pemerintah');
    }

    return data;
  } catch (error) {
    // Network error (server mati, no internet, dll)
    const errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    const errorDetail = error instanceof Error ? error.message : 'Unknown error';

    // Fire global callback jika terdaftar
    if (_onNetworkError) {
      _onNetworkError(errorMessage, errorDetail);
    }

    return {
      success: false,
      message: errorMessage,
      error: errorDetail,
    };
  }
}

// ============================================================
// Public API Methods
// ============================================================

/** GET request */
export async function apiGet<T>(endpoint: string, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, { method: 'GET', headers }, { includeAuth });
}

/** POST request dengan JSON body */
export async function apiPost<T>(endpoint: string, body?: any, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }, { includeAuth });
}

/** PATCH request dengan JSON body */
export async function apiPatch<T>(endpoint: string, body: any, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  }, { includeAuth });
}

/** DELETE request */
export async function apiDelete<T>(endpoint: string, body?: any, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, {
    method: 'DELETE',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }, { includeAuth });
}

/** POST request dengan FormData (untuk file upload) */
export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  // Untuk FormData, jangan set Content-Type — browser/RN akan set boundary otomatis
  const headers = await buildHeaders(true, null);
  return request<T>(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  }, { includeAuth: true });
}
