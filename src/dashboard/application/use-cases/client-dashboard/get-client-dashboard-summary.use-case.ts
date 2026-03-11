import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_DASHBOARD_REPOSITORY,
  type IClientDashboardRepository,
} from '../../../domain/interfaces/client-dashboard.repository.interface.js';
import type { ClientDashboardSummary } from '../../../domain/interfaces/client-dashboard.types.js';

@Injectable()
export class GetClientDashboardSummaryUseCase {
  constructor(
    @Inject(CLIENT_DASHBOARD_REPOSITORY)
    private clientDashboardRepository: IClientDashboardRepository,
  ) {}

  async getClientDashboardSummary(clientId: number): Promise<ClientDashboardSummary> {
    return this.clientDashboardRepository.getClientDashboardSummary(clientId);
  }
}
