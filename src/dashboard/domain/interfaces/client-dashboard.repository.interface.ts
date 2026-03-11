import type { ClientDashboardSummary } from './client-dashboard.types.js';

export const CLIENT_DASHBOARD_REPOSITORY = Symbol('CLIENT_DASHBOARD_REPOSITORY');

export interface IClientDashboardRepository {
  getClientDashboardSummary(clientId: number): Promise<ClientDashboardSummary>;
}
