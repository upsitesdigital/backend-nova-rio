import { Inject, Injectable } from '@nestjs/common';
import { REPORT_REPOSITORY } from '../../../domain/interfaces/report.repository.interface.js';
import type {
  ActiveClientsFilters,
  ActiveClientsResponse,
  IReportRepository,
} from '../../../domain/interfaces/report.repository.interface.js';
import type { ActiveClientsQueryDto } from '../../../dto/report/active-clients-query.dto.js';

@Injectable()
export class GetActiveClientsUseCase {
  constructor(@Inject(REPORT_REPOSITORY) private reportRepository: IReportRepository) {}

  async getActiveClients(query: ActiveClientsQueryDto): Promise<ActiveClientsResponse> {
    const filters: ActiveClientsFilters = {};

    if (query.unitId) filters.unitId = query.unitId;

    return this.reportRepository.getActiveClients(filters);
  }
}
