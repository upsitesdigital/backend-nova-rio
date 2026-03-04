import { Inject, Injectable } from '@nestjs/common';
import { REPORT_REPOSITORY } from '../../../domain/interfaces/report.repository.interface.js';
import type {
  IReportRepository,
  TransactionGroupItem,
  TransactionsFilters,
} from '../../../domain/interfaces/report.repository.interface.js';
import type { TransactionsQueryDto } from '../../../dto/report/transactions-query.dto.js';

@Injectable()
export class GetTransactionsUseCase {
  constructor(@Inject(REPORT_REPOSITORY) private reportRepository: IReportRepository) {}

  async getTransactions(query: TransactionsQueryDto): Promise<TransactionGroupItem[]> {
    const filters: TransactionsFilters = {
      groupBy: query.groupBy ?? 'month',
    };

    if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom);
    if (query.dateTo) filters.dateTo = new Date(query.dateTo);
    if (query.unitId) filters.unitId = query.unitId;
    if (query.serviceId) filters.serviceId = query.serviceId;

    return this.reportRepository.getTransactions(filters);
  }
}
