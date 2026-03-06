import { apiGet, apiPatch, type ApiResponse } from './api';

// ── Types ──

export interface AdminUser {
  id: string;
  role: 'user' | 'pemerintah' | 'admin';
  full_name: string;
  email: string;
  phone: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  instansi: string | null;
  jabatan: string | null;
  eco_points: number;
  current_badge: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total: number;
  byRole: { user: number; pemerintah: number; admin: number };
}

export interface AnalyticsData {
  reportStats: {
    total: number;
    pending: number;
    verified: number;
    inProgress: number;
    resolved: number;
  };
  categories: Record<string, number>;
  topDistricts: { name: string; count: number }[];
  userStats: UserStats;
  actionStats: {
    total: number;
    totalParticipants: number;
    totalPoints: number;
  };
  avgResponseHours: number;
}

// ── API Calls ──

export async function getAdminUsers(params?: {
  role?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse & { data?: AdminUser[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params?.role) query.set('role', params.role);
  if (params?.search) query.set('search', params.search);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGet(`/admin/users${qs ? `?${qs}` : ''}`);
}

export async function getAdminUserStats(): Promise<ApiResponse & { data?: UserStats }> {
  return apiGet('/admin/users/stats');
}

export async function getAdminAnalytics(): Promise<ApiResponse & { data?: AnalyticsData }> {
  return apiGet('/admin/analytics');
}

export async function updateUserRole(userId: string, role: string): Promise<ApiResponse> {
  return apiPatch(`/admin/users/${userId}/role`, { role });
}

export async function toggleUserSuspend(userId: string, suspended: boolean): Promise<ApiResponse> {
  return apiPatch(`/admin/users/${userId}/suspend`, { suspended });
}
