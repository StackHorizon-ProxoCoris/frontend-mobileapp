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

// ============================================================
// Tipe Response dari Backend
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
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
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: options.headers as Record<string, string>,
    });

    const data: ApiResponse<T> = await response.json();

    // Jika token expired, hapus dari storage
    if (response.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }

    return data;
  } catch (error) {
    // Network error (server mati, no internet, dll)
    return {
      success: false,
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// Public API Methods
// ============================================================

/** GET request */
export async function apiGet<T>(endpoint: string, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, { method: 'GET', headers });
}

/** POST request dengan JSON body */
export async function apiPost<T>(endpoint: string, body?: any, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** PATCH request dengan JSON body */
export async function apiPatch<T>(endpoint: string, body: any, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
}

/** DELETE request */
export async function apiDelete<T>(endpoint: string, includeAuth = true): Promise<ApiResponse<T>> {
  const headers = await buildHeaders(includeAuth);
  return request<T>(endpoint, { method: 'DELETE', headers });
}

/** POST request dengan FormData (untuk file upload) */
export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  // Untuk FormData, jangan set Content-Type — browser/RN akan set boundary otomatis
  const headers = await buildHeaders(true, null);
  return request<T>(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });
}
