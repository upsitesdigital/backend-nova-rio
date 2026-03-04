import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
  type TodayAgendaResponse,
} from '../../../domain/interfaces/dashboard.repository.interface.js';
import type { TodayAgendaQueryDto } from '../../../dto/dashboard/today-agenda-query.dto.js';

@Injectable()
export class GetTodayAgendaUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private dashboardRepository: IDashboardRepository,
  ) {}

  async getTodayAgenda(query: TodayAgendaQueryDto): Promise<TodayAgendaResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filters = {
      serviceId: query.serviceId,
      unitId: query.unitId,
      page,
      limit,
    };

    const [items, total] = await Promise.all([
      this.dashboardRepository.getTodayAgenda(filters),
      this.dashboardRepository.getTodayAgendaTotal(filters),
    ]);

    return { items, total, page, limit };
  }
}
