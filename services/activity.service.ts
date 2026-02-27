// ============================================================
// Service — Activity (User Activity History)
// ============================================================

import { apiGet } from './api';

export interface ActivityItem {
  id: string;
  type: 'report' | 'action' | 'support' | 'verify' | 'comment' | 'badge';
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
}

/**
 * GET /api/activities — Riwayat aktivitas user
 */
export async function getActivities(): Promise<{ success: boolean; data?: ActivityItem[]; message?: string }> {
  const result = await apiGet<ActivityItem[]>('/activities');
  return result;
}
