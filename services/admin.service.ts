import { apiGet, apiPatch, apiPost, type ApiResponse } from './api';

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
  settings?: {
    suspended?: boolean;
  } | null;
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

export interface AdminSystemStatusItem {
  key: 'backend' | 'database' | 'accounts' | 'moderation';
  label: string;
  status: string;
  value: string;
  sub: string;
}

export interface AdminModerationQueueItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Menunggu' | 'Diverifikasi' | 'Ditangani' | 'Selesai';
  severity: 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
  urgency: number;
  time: string;
  createdAt: string;
  district: string;
  city: string;
  votesCount: number;
  verifiedCount: number;
  commentsCount: number;
  photoCount: number;
  reporterName: string;
  reporterInitials: string;
  reporterEmail: string;
}

export interface AdminActivityLogItem {
  id: string;
  type: 'report' | 'action' | 'user' | 'status' | 'support' | 'verify' | 'comment' | 'badge';
  icon: string;
  bgColor: string;
  color: string;
  title: string;
  desc: string;
  time: string;
  date: string;
  points: number;
  status?: string;
  statusColor?: string;
  refId?: string;
  targetType?: 'report' | 'action' | 'user';
}

export interface AdminDashboardData {
  summary: {
    totalUsers: number;
    totalReports: number;
    pendingReports: number;
    verifiedReports: number;
    inProgressReports: number;
    resolvedReports: number;
    totalActions: number;
    unreadNotifications: number;
  };
  userStats: UserStats;
  reportStats: AnalyticsData['reportStats'];
  systemStatus: AdminSystemStatusItem[];
  moderationQueue: AdminModerationQueueItem[];
  recentActivities: AdminActivityLogItem[];
}

export interface CreateAdminUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'pemerintah' | 'admin';
  district?: string;
  city?: string;
  province?: string;
  instansi?: string;
  jabatan?: string;
  nip?: string;
  unitKerja?: string;
  golongan?: string;
  tmt?: string;
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

export async function getAdminDashboard(): Promise<ApiResponse & { data?: AdminDashboardData }> {
  return apiGet('/admin/dashboard');
}

export async function getAdminAnalytics(): Promise<ApiResponse & { data?: AnalyticsData }> {
  return apiGet('/admin/analytics');
}

export async function getAdminActivityLog(params?: {
  limit?: number;
  type?: 'all' | 'report' | 'action' | 'user' | 'status';
}): Promise<ApiResponse & { data?: AdminActivityLogItem[] }> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.type) query.set('type', params.type);
  const qs = query.toString();
  return apiGet(`/admin/activity-log${qs ? `?${qs}` : ''}`);
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<ApiResponse> {
  return apiPost('/admin/users', payload);
}

export async function updateUserRole(userId: string, role: string): Promise<ApiResponse> {
  return apiPatch(`/admin/users/${userId}/role`, { role });
}

export async function toggleUserSuspend(userId: string, suspended: boolean): Promise<ApiResponse> {
  return apiPatch(`/admin/users/${userId}/suspend`, { suspended });
}
