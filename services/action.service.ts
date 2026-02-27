// ============================================================
// Action Service — API calls untuk aksi positif
// ============================================================

import { apiGet, apiPost, apiDelete, type ApiResponse } from './api';

// ============================================================
// Tipe Data
// ============================================================

export interface ActionData {
  id: string;
  userId: string;
  category: string;
  type: string;
  title: string;
  description: string;
  address: string;
  district: string;
  city: string;
  lat: number | null;
  lng: number | null;
  status: string;
  date: string | null;
  duration: string | null;
  points: number;
  maxParticipants: number;
  totalParticipants: number;
  verified: boolean;
  verifiedBy: string | null;
  commentsCount: number;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  organizer?: {
    fullName: string;
    initials: string;
    currentBadge: string;
    totalActions: number;
  };
  comments?: any[];
}

export interface CreateActionPayload {
  category: string;
  type: string;
  title: string;
  description: string;
  address: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;
  date?: string;
  duration?: string;
  points?: number;
  maxParticipants?: number;
  photoUrls?: string[];
}

// ============================================================
// API Calls
// ============================================================

/** Ambil daftar aksi dengan filter & pagination */
export async function getActions(params?: {
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ActionData[]>> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const queryStr = query.toString();
  return apiGet<ActionData[]>(`/actions${queryStr ? `?${queryStr}` : ''}`, false);
}

/** Ambil detail aksi berdasarkan ID */
export async function getActionById(id: string): Promise<ApiResponse<ActionData>> {
  return apiGet<ActionData>(`/actions/${id}`);
}

/** Buat aksi positif baru */
export async function createAction(data: CreateActionPayload): Promise<ApiResponse<ActionData>> {
  return apiPost<ActionData>('/actions', data);
}

/** Bergabung ke aksi positif */
export async function joinAction(actionId: string): Promise<ApiResponse> {
  return apiPost(`/actions/${actionId}/join`);
}

/** Keluar dari aksi positif */
export async function leaveAction(actionId: string): Promise<ApiResponse> {
  return apiDelete(`/actions/${actionId}/join`);
}
