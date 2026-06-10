import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import { type IDashboardRepository } from '../../../domain/interfaces/dashboard.repository.interface.js';
import type { DashboardFiltersQueryDto } from '../../../dto/dashboard/dashboard-filters-query.dto.js';

@Injectable()
export class GetPendingAppointmentsCountUseCase {
  constructor(
    @Inject(DiTokens.dashboardRepository)
    private dashboardRepository: IDashboardRepository,
  ) {}

  async getPendingAppointmentsCount(query: DashboardFiltersQueryDto): Promise<{ count: number }> {
    const count = await this.dashboardRepository.getPendingAppointmentsCount({
      unitId: query.unitId,
    });
    return { count };
  }
}
