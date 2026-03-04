import { Module } from '@nestjs/common';
import { ExportTransactionsCsvUseCase } from './application/use-cases/report/export-transactions-csv.use-case.js';
import { GetActiveClientsUseCase } from './application/use-cases/report/get-active-clients.use-case.js';
import { GetHoursByServiceUseCase } from './application/use-cases/report/get-hours-by-service.use-case.js';
import { GetSalesSummaryUseCase } from './application/use-cases/report/get-sales-summary.use-case.js';
import { GetTransactionsUseCase } from './application/use-cases/report/get-transactions.use-case.js';
import { REPORT_REPOSITORY } from './domain/interfaces/report.repository.interface.js';
import { PrismaReportRepository } from './infrastructure/repositories/prisma-report.repository.js';
import { AdminReportsController } from './admin-reports.controller.js';

@Module({
  controllers: [AdminReportsController],
  providers: [
    { provide: REPORT_REPOSITORY, useClass: PrismaReportRepository },
    GetSalesSummaryUseCase,
    GetActiveClientsUseCase,
    GetHoursByServiceUseCase,
    GetTransactionsUseCase,
    ExportTransactionsCsvUseCase,
  ],
})
export class ReportsModule {}
