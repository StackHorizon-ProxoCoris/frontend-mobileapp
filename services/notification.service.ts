// ============================================================
// Service — Notification
// ============================================================

import { apiGet, apiPatch } from './api';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  ref_type?: string;
  ref_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

/**
 * GET /api/notifications — Ambil notifikasi user
 */
export async function getNotifications(): Promise<{ success: boolean; data?: NotificationResponse; message?: string }> {
  return apiGet<NotificationResponse>('/notifications');
}

/**
 * PATCH /api/notifications/:id/read — Tandai sudah dibaca
 */
export async function markNotificationRead(id: string): Promise<{ success: boolean; message?: string }> {
  return apiPatch(`/notifications/${id}/read`, {});
}

/**
 * PATCH /api/notifications/read-all — Tandai semua sudah dibaca
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean; message?: string }> {
  return apiPatch('/notifications/read-all', {});
}
