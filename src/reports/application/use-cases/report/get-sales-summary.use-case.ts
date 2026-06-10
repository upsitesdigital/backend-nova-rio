import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
  IReportRepository,
  SalesSummaryFilters,
  SalesSummaryResponse,
} from '../../../domain/interfaces/report.repository.interface.js';
import type { SalesSummaryQueryDto } from '../../../dto/report/sales-summary-query.dto.js';

@Injectable()
export class GetSalesSummaryUseCase {
  constructor(@Inject(DiTokens.reportRepository) private reportRepository: IReportRepository) {}

  async getSalesSummary(query: SalesSummaryQueryDto): Promise<SalesSummaryResponse> {
    const filters: SalesSummaryFilters = {};

    if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom);
    if (query.dateTo) filters.dateTo = new Date(query.dateTo);
    if (query.unitId) filters.unitId = query.unitId;
    if (query.serviceId) filters.serviceId = query.serviceId;

    return this.reportRepository.getSalesSummary(filters);
  }
}
