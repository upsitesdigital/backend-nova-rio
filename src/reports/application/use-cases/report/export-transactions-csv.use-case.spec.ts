import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { REPORT_REPOSITORY } from '../../../domain/interfaces/report.repository.interface.js';
import { ExportTransactionsCsvUseCase } from './export-transactions-csv.use-case.js';

describe('ExportTransactionsCsvUseCase', () => {
  let useCase: ExportTransactionsCsvUseCase;
  let reportRepository: { getExportRows: Mock };

  beforeEach(async () => {
    reportRepository = { getExportRows: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportTransactionsCsvUseCase,
        { provide: REPORT_REPOSITORY, useValue: reportRepository },
      ],
    }).compile();

    useCase = module.get<ExportTransactionsCsvUseCase>(ExportTransactionsCsvUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a StreamableFile with CSV content', async () => {
    reportRepository.getExportRows.mockResolvedValue([
      {
        paymentId: 1,
        paidAt: new Date('2026-01-15'),
        amount: 150,
        method: 'PIX',
        status: 'APPROVED',
        clientName: 'John Doe',
        serviceName: 'Faxina Regular',
        appointmentDate: new Date('2026-01-15'),
      },
    ]);

    const result = await useCase.exportTransactionsCsv({});

    expect(result).toBeInstanceOf(StreamableFile);
  });

  it('should escape CSV fields with commas', async () => {
    reportRepository.getExportRows.mockResolvedValue([
      {
        paymentId: 2,
        paidAt: null,
        amount: 200,
        method: 'CREDIT_CARD',
        status: 'APPROVED',
        clientName: 'Doe, Jane',
        serviceName: 'Faxina Premium',
        appointmentDate: new Date('2026-02-01'),
      },
    ]);

    const result = await useCase.exportTransactionsCsv({});

    expect(result).toBeInstanceOf(StreamableFile);
  });

  it('should call repository with parsed filters', async () => {
    reportRepository.getExportRows.mockResolvedValue([]);

    await useCase.exportTransactionsCsv({
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      unitId: 1,
      serviceId: 2,
    });

    expect(reportRepository.getExportRows).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.any(Date) as Date,
        dateTo: expect.any(Date) as Date,
        unitId: 1,
        serviceId: 2,
      }),
    );
  });
});
