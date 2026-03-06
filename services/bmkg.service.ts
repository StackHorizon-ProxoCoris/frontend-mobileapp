// ============================================================
// Service — BMKG Earthquake Data
// Fetch data gempa terkini dari backend
// ============================================================

import { apiGet, type ApiResponse } from './api';

export interface GempaData {
  tanggal: string;
  jam: string;
  dateTime: string;
  magnitude: number;
  kedalaman: string;
  wilayah: string;
  potensi: string;
  dirasakan: string;
  lintang: string;
  bujur: string;
  coordinates: { lat: number; lng: number };
  shakemapUrl: string | null;
}

/**
 * Ambil data gempa terkini dari BMKG via backend
 * Endpoint: GET /api/bmkg/gempa-terkini
 */
export async function getGempaTerkini(): Promise<ApiResponse<GempaData>> {
  return apiGet<GempaData>('/bmkg/gempa-terkini');
}
