import type { RawClientDashboardData } from './client-dashboard.types.js';

export interface IClientDashboardRepository {
  getClientDashboardData(clientId: number): Promise<RawClientDashboardData>;
}
