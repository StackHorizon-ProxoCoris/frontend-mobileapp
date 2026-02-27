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
}

// ============================================================
// API Calls
// ============================================================

/** Ambil data status area (aggregate dari semua laporan) */
export async function getAreaStatus(): Promise<ApiResponse<AreaStatusData>> {
  return apiGet<AreaStatusData>('/area-status', false);
}
