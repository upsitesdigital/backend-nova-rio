import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from '../../../domain/interfaces/dashboard.repository.interface.js';
import type { DashboardFiltersQueryDto } from '../../../dto/dashboard/dashboard-filters-query.dto.js';

@Injectable()
export class GetActiveClientsCountUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private dashboardRepository: IDashboardRepository,
  ) {}

  async getActiveClientsCount(query: DashboardFiltersQueryDto): Promise<{ count: number }> {
    const count = await this.dashboardRepository.getActiveClientsCount({
      unitId: query.unitId,
    });
    return { count };
  }
}
