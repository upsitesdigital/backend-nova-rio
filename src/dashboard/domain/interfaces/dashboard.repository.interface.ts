import type { AgendaItem, DashboardFilters, TodayAgendaFilters } from './dashboard.types.js';

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export type { AgendaItem, DashboardFilters, TodayAgendaFilters } from './dashboard.types.js';
export type { TodayAgendaResponse } from './dashboard.types.js';

export interface IDashboardRepository {
  getTodayAppointmentsCount(filters: DashboardFilters): Promise<number>;
  getActiveClientsCount(filters: DashboardFilters): Promise<number>;
  getPendingAppointmentsCount(filters: DashboardFilters): Promise<number>;
  getTodayAgenda(filters: TodayAgendaFilters): Promise<AgendaItem[]>;
  getTodayAgendaTotal(filters: TodayAgendaFilters): Promise<number>;
}
