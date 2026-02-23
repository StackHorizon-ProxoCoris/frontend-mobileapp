// ============================================================
// Comment Service — API calls untuk komentar polymorphic
// ============================================================

import { apiGet, apiPost, type ApiResponse } from './api';

// ============================================================
// Tipe Data
// ============================================================

export interface CommentData {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'report' | 'action';
  text: string;
  likes: number;
  createdAt: string;
  user?: {
    fullName: string;
    initials: string;
  };
}

// ============================================================
// API Calls
// ============================================================

/** Ambil daftar komentar untuk report atau action */
export async function getComments(
  targetType: 'report' | 'action',
  targetId: string,
): Promise<ApiResponse<CommentData[]>> {
  return apiGet<CommentData[]>(`/comments/${targetType}/${targetId}`);
}

/** Tambah komentar baru */
export async function addComment(
  targetId: string,
  targetType: 'report' | 'action',
  text: string,
): Promise<ApiResponse<CommentData>> {
  return apiPost<CommentData>('/comments', { targetId, targetType, text });
}
