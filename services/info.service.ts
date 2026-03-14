// ============================================================
// Info Service — API calls untuk Info & Edukasi
// ============================================================

import { apiGet, type ApiResponse } from './api';

// ============================================================
// Tipe Data
// ============================================================

export interface InfoFeedData {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  category: string;
  source: string;
  color: string;
  bg: string;
  gradient: string;
}

export interface InfoDetailData extends InfoFeedData {
  content: string[];
  photoUrls: string[];
  tags: string[];
  tips: { icon: string; title: string; desc: string }[];
  relatedLinks: { title: string; url: string }[];
  author: {
    name: string;
    initials: string;
    role: string;
    organization: string;
  };
  stats: {
    views: number;
    shares: number;
    bookmarks: number;
  };
  verified: boolean;
  verifiedBy: string | null;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  comments?: {
    id: string;
    user: string;
    initials: string;
    text: string;
    time: string;
    likes: number;
  }[];
}

// ============================================================
// API Calls
// ============================================================

/** Ambil daftar info/edukasi dengan filter & pagination */
export async function getInfoList(params?: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<InfoFeedData[]>> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const queryStr = query.toString();
  return apiGet<InfoFeedData[]>(`/info${queryStr ? `?${queryStr}` : ''}`, false);
}

/** Ambil detail artikel berdasarkan ID */
export async function getInfoById(id: string): Promise<ApiResponse<InfoDetailData>> {
  return apiGet<InfoDetailData>(`/info/${id}`, false);
}
