import type { RawClientDashboardData } from './client-dashboard.types.js';

export const CLIENT_DASHBOARD_REPOSITORY = Symbol('CLIENT_DASHBOARD_REPOSITORY');

export interface IClientDashboardRepository {
  getClientDashboardData(clientId: number): Promise<RawClientDashboardData>;
}
