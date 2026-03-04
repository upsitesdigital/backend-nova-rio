import { Inject, Injectable } from '@nestjs/common';
import { REPORT_REPOSITORY } from '../../../domain/interfaces/report.repository.interface.js';
import type {
  HoursByServiceFilters,
  HoursByServiceItem,
  IReportRepository,
} from '../../../domain/interfaces/report.repository.interface.js';
import type { HoursByServiceQueryDto } from '../../../dto/report/hours-by-service-query.dto.js';

@Injectable()
export class GetHoursByServiceUseCase {
  constructor(@Inject(REPORT_REPOSITORY) private reportRepository: IReportRepository) {}

  async getHoursByService(query: HoursByServiceQueryDto): Promise<HoursByServiceItem[]> {
    const filters: HoursByServiceFilters = {};

    if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom);
    if (query.dateTo) filters.dateTo = new Date(query.dateTo);
    if (query.unitId) filters.unitId = query.unitId;

    return this.reportRepository.getHoursByService(filters);
  }
}
