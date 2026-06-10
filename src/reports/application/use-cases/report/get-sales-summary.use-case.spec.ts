import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetSalesSummaryUseCase } from './get-sales-summary.use-case.js';

describe('GetSalesSummaryUseCase', () => {
  let useCase: GetSalesSummaryUseCase;
  let reportRepository: { getSalesSummary: Mock };

  beforeEach(async () => {
    reportRepository = { getSalesSummary: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSalesSummaryUseCase,
        { provide: DiTokens.reportRepository, useValue: reportRepository },
      ],
    }).compile();

    useCase = module.get<GetSalesSummaryUseCase>(GetSalesSummaryUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call repository with parsed filters', async () => {
    const summary = { totalRevenue: 1000, totalPayments: 5, averageTicket: 200 };
    reportRepository.getSalesSummary.mockResolvedValue(summary);

    const result = await useCase.getSalesSummary({
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      unitId: 1,
    });

    expect(result).toEqual(summary);
    expect(reportRepository.getSalesSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.any(Date) as Date,
        dateTo: expect.any(Date) as Date,
        unitId: 1,
      }),
    );
  });

  it('should handle empty query', async () => {
    reportRepository.getSalesSummary.mockResolvedValue({
      totalRevenue: 0,
      totalPayments: 0,
      averageTicket: 0,
    });

    await useCase.getSalesSummary({});

    expect(reportRepository.getSalesSummary).toHaveBeenCalledWith({});
  });
});
