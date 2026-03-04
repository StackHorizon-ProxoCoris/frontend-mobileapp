// ============================================================
// Area Status Service — API calls untuk status area
// ============================================================

import { apiGet, type ApiResponse } from './api';

// ============================================================
// Tipe Data
// ============================================================

export interface AreaStatusData {
  level: string;
  levelColor: string;
  levelBg: string;
  activeReports: number;
  totalReports: number;
  responseRate: number;
  avgResponseHours: number;
  criticalCount: number;
  warningType: string;
  warningMessage: string;
  hasWarning: boolean;
  isGlobal: boolean;
}

// ============================================================
// API Calls
// ============================================================

/** Ambil data status area — filter by district jika tersedia */
export async function getAreaStatus(district?: string): Promise<ApiResponse<AreaStatusData>> {
  const params = district ? `?district=${encodeURIComponent(district)}` : '';
  return apiGet<AreaStatusData>(`/area-status${params}`, false);
}
