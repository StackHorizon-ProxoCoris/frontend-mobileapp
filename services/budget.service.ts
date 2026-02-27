// ============================================================
// Service — Budget
// ============================================================

import { apiGet } from './api';

export interface BudgetProject {
  id: string;
  title: string;
  org: string;
  kec: string;
  icon: string;
  icon_color: string;
  bg_color: string;
  status: 'Normal' | 'Anomali' | 'Selesai' | 'Tunda';
  budget: number;
  realisasi: number;
  fisik: number;
  deadline: string;
  anomali_note: string | null;
}

export interface BudgetSummary {
  totalApbd: number;
  totalTerserap: number;
  totalSisa: number;
  pctSerap: number;
  anomaliCount: number;
  totalProjects: number;
}

export interface FilterCounts {
  Semua: number;
  Normal: number;
  Anomali: number;
  Selesai: number;
}

export interface BudgetProjectsResponse {
  projects: BudgetProject[];
  summary: BudgetSummary;
  filterCounts: FilterCounts;
}

export interface BudgetDinas {
  id: string;
  name: string;
  short: string;
  budget: string;
  serap: number;
  color: string;
  bg: string;
  status: string;
}

/**
 * GET /api/budget/projects — Daftar proyek anggaran
 */
export async function getBudgetProjects(): Promise<{ success: boolean; data?: BudgetProjectsResponse; message?: string }> {
  return apiGet<BudgetProjectsResponse>('/budget/projects');
}

/**
 * GET /api/budget/dinas — Serapan per dinas
 */
export async function getBudgetDinas(): Promise<{ success: boolean; data?: BudgetDinas[]; message?: string }> {
  return apiGet<BudgetDinas[]>('/budget/dinas');
}
