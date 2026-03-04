import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ExportTransactionsCsvUseCase } from './application/use-cases/report/export-transactions-csv.use-case.js';
import { GetActiveClientsUseCase } from './application/use-cases/report/get-active-clients.use-case.js';
import { GetHoursByServiceUseCase } from './application/use-cases/report/get-hours-by-service.use-case.js';
import { GetSalesSummaryUseCase } from './application/use-cases/report/get-sales-summary.use-case.js';
import { GetTransactionsUseCase } from './application/use-cases/report/get-transactions.use-case.js';
import { ActiveClientsQueryDto } from './dto/report/active-clients-query.dto.js';
import { HoursByServiceQueryDto } from './dto/report/hours-by-service-query.dto.js';
import { SalesSummaryQueryDto } from './dto/report/sales-summary-query.dto.js';
import { TransactionsQueryDto } from './dto/report/transactions-query.dto.js';

@ApiTags('Admin Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('admin/reports')
export class AdminReportsController {
  constructor(
    private getSalesSummaryUseCase: GetSalesSummaryUseCase,
    private getActiveClientsUseCase: GetActiveClientsUseCase,
    private getHoursByServiceUseCase: GetHoursByServiceUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private exportTransactionsCsvUseCase: ExportTransactionsCsvUseCase,
  ) {}

  @Get('sales-summary')
  @ApiOperation({ summary: 'Get revenue summary with filters' })
  @ApiOkResponse({ description: 'Returns revenue summary' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getSalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.getSalesSummaryUseCase.getSalesSummary(query);
  }

  @Get('active-clients')
  @ApiOperation({ summary: 'Get active clients count with per-unit breakdown' })
  @ApiOkResponse({ description: 'Returns active clients count' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getActiveClients(@Query() query: ActiveClientsQueryDto) {
    return this.getActiveClientsUseCase.getActiveClients(query);
  }

  @Get('hours-by-service')
  @ApiOperation({ summary: 'Get hours sold grouped by service' })
  @ApiOkResponse({ description: 'Returns hours by service' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getHoursByService(@Query() query: HoursByServiceQueryDto) {
    return this.getHoursByServiceUseCase.getHoursByService(query);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get chart data grouped by day/week/month' })
  @ApiOkResponse({ description: 'Returns transaction groups' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getTransactions(@Query() query: TransactionsQueryDto) {
    return this.getTransactionsUseCase.getTransactions(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export transactions as CSV file' })
  @ApiOkResponse({ description: 'Returns CSV file download' })
  @ApiProduces('text/csv')
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async exportTransactionsCsv(@Query() query: SalesSummaryQueryDto, @Res() res: Response) {
    const now = new Date();
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = now.getUTCFullYear();
    const filename = `transacoes-${dd}-${mm}-${yyyy}.csv`;

    const file = await this.exportTransactionsCsvUseCase.exportTransactionsCsv(query);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    file.getStream().pipe(res);
  }
}
