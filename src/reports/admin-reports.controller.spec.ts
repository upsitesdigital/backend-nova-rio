import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AdminReportsController } from './admin-reports.controller.js';
import { ExportTransactionsCsvUseCase } from './application/use-cases/report/export-transactions-csv.use-case.js';
import { GetActiveClientsUseCase } from './application/use-cases/report/get-active-clients.use-case.js';
import { GetHoursByServiceUseCase } from './application/use-cases/report/get-hours-by-service.use-case.js';
import { GetSalesSummaryUseCase } from './application/use-cases/report/get-sales-summary.use-case.js';
import { GetTransactionsUseCase } from './application/use-cases/report/get-transactions.use-case.js';

describe('AdminReportsController', () => {
  let controller: AdminReportsController;
  let getSalesSummaryUseCase: { getSalesSummary: Mock };
  let getActiveClientsUseCase: { getActiveClients: Mock };
  let getHoursByServiceUseCase: { getHoursByService: Mock };
  let getTransactionsUseCase: { getTransactions: Mock };
  let exportTransactionsCsvUseCase: { exportTransactionsCsv: Mock };

  beforeEach(async () => {
    getSalesSummaryUseCase = { getSalesSummary: vi.fn() };
    getActiveClientsUseCase = { getActiveClients: vi.fn() };
    getHoursByServiceUseCase = { getHoursByService: vi.fn() };
    getTransactionsUseCase = { getTransactions: vi.fn() };
    exportTransactionsCsvUseCase = { exportTransactionsCsv: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminReportsController],
      providers: [
        { provide: GetSalesSummaryUseCase, useValue: getSalesSummaryUseCase },
        { provide: GetActiveClientsUseCase, useValue: getActiveClientsUseCase },
        { provide: GetHoursByServiceUseCase, useValue: getHoursByServiceUseCase },
        { provide: GetTransactionsUseCase, useValue: getTransactionsUseCase },
        { provide: ExportTransactionsCsvUseCase, useValue: exportTransactionsCsvUseCase },
      ],
    }).compile();

    controller = module.get<AdminReportsController>(AdminReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getSalesSummary should call use case', async () => {
    const query = { dateFrom: '2026-01-01' };
    await controller.getSalesSummary(query);
    expect(getSalesSummaryUseCase.getSalesSummary).toHaveBeenCalledWith(query);
  });

  it('getActiveClients should call use case', async () => {
    const query = { unitId: 1 };
    await controller.getActiveClients(query);
    expect(getActiveClientsUseCase.getActiveClients).toHaveBeenCalledWith(query);
  });

  it('getHoursByService should call use case', async () => {
    const query = { dateFrom: '2026-01-01' };
    await controller.getHoursByService(query);
    expect(getHoursByServiceUseCase.getHoursByService).toHaveBeenCalledWith(query);
  });

  it('getTransactions should call use case', async () => {
    const query = { groupBy: 'month' as const };
    await controller.getTransactions(query);
    expect(getTransactionsUseCase.getTransactions).toHaveBeenCalledWith(query);
  });

  it('exportTransactionsCsv should pipe file to response', async () => {
    const mockPipe = vi.fn();
    const file = { getStream: () => ({ pipe: mockPipe }) };
    exportTransactionsCsvUseCase.exportTransactionsCsv.mockResolvedValue(file);

    const res = { set: vi.fn() } as unknown;

    await controller.exportTransactionsCsv({}, res as import('express').Response);

    expect(exportTransactionsCsvUseCase.exportTransactionsCsv).toHaveBeenCalledWith({});
    expect((res as { set: Mock }).set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'text/csv',
        'Content-Disposition': expect.stringContaining('transacoes-') as string,
      }) as Record<string, unknown>,
    );
    expect(mockPipe).toHaveBeenCalledWith(res);
  });
});
