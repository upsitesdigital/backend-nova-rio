import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import type {
  ExportFilters,
  ExportRow,
  IReportRepository,
} from '../../../domain/interfaces/report.repository.interface.js';
import type { SalesSummaryQueryDto } from '../../../dto/report/sales-summary-query.dto.js';

@Injectable()
export class ExportTransactionsCsvUseCase {
  constructor(@Inject(DiTokens.reportRepository) private reportRepository: IReportRepository) {}

  async exportTransactionsCsv(query: SalesSummaryQueryDto): Promise<StreamableFile> {
    const filters: ExportFilters = {};

    if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom);
    if (query.dateTo) filters.dateTo = new Date(query.dateTo);
    if (query.unitId) filters.unitId = query.unitId;
    if (query.serviceId) filters.serviceId = query.serviceId;

    const rows = await this.reportRepository.getExportRows(filters);
    const csv = this.buildCsv(rows);

    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  private buildCsv(rows: ExportRow[]): string {
    const header =
      'ID Pagamento,Data Pagamento,Hora Pagamento,Valor,Forma de Pagamento,Status,Cliente,Servico,Data Agendamento';
    const lines = rows.map((r) => {
      const paidDate = r.paidAt ? r.paidAt.toISOString().split('T')[0] : '';
      const paidTime = r.paidAt ? r.paidAt.toISOString().split('T')[1].slice(0, 8) : '';
      const appointmentDate = r.appointmentDate.toISOString().split('T')[0];
      return [
        r.paymentId,
        paidDate,
        paidTime,
        r.amount,
        r.method,
        r.status,
        this.escapeCsvField(r.clientName),
        this.escapeCsvField(r.serviceName),
        appointmentDate,
      ].join(',');
    });

    return [header, ...lines].join('\n');
  }

  private escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
