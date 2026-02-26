// ============================================================
// Report Service — API calls untuk laporan masalah
// ============================================================

import { apiGet, apiPost, apiPatch, type ApiResponse } from './api';

// ============================================================
// Tipe Data
// ============================================================

export interface ReportData {
  id: string;
  userId: string;
  category: string;
  type: string;
  title: string;
  description: string;
  address: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  status: 'Menunggu' | 'Diverifikasi' | 'Ditangani' | 'Selesai';
  urgency: number;
  votesCount: number;
  verifiedCount: number;
  photosCount: number;
  commentsCount: number;
  respondedBy: string | null;
  estimatedCompletion: string | null;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  reporter?: {
    fullName: string;
    initials: string;
    currentBadge: string;
    totalReports: number;
  };
  comments?: any[];
  hasVoted?: boolean;
}

export interface CreateReportPayload {
  category: string;
  type: string;
  title: string;
  description: string;
  address: string;
  district?: string;
  city?: string;
  lat: number;
  lng: number;
  urgency?: number;
  photoUrls?: string[];
}

// ============================================================
// API Calls
// ============================================================

/** Ambil daftar laporan dengan filter & pagination */
export async function getReports(params?: {
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ReportData[]>> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const queryStr = query.toString();
  return apiGet<ReportData[]>(`/reports${queryStr ? `?${queryStr}` : ''}`, false);
}

/** Ambil detail laporan berdasarkan ID */
export async function getReportById(id: string): Promise<ApiResponse<ReportData>> {
  return apiGet<ReportData>(`/reports/${id}`);
}

/** Ambil laporan terdekat berdasarkan koordinat */
export async function getNearbyReports(
  lat: number,
  lng: number,
  radius = 5,
): Promise<ApiResponse<ReportData[]>> {
  return apiGet<ReportData[]>(`/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, false);
}

/** Buat laporan baru */
export async function createReport(data: CreateReportPayload): Promise<ApiResponse<ReportData>> {
  return apiPost<ReportData>('/reports', data);
}

/** Toggle dukungan (vote/unvote) pada laporan */
export async function toggleReportVote(reportId: string): Promise<ApiResponse> {
  return apiPost(`/reports/${reportId}/vote`);
}

/** Update status laporan */
export async function updateReportStatus(
  reportId: string,
  status: string,
  respondedBy?: string,
): Promise<ApiResponse> {
  return apiPatch(`/reports/${reportId}/status`, { status, respondedBy });
}
