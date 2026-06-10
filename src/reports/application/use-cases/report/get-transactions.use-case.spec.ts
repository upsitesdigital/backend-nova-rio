import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetTransactionsUseCase } from './get-transactions.use-case.js';

describe('GetTransactionsUseCase', () => {
  let useCase: GetTransactionsUseCase;
  let reportRepository: { getTransactions: Mock };

  beforeEach(async () => {
    reportRepository = { getTransactions: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionsUseCase,
        { provide: DiTokens.reportRepository, useValue: reportRepository },
      ],
    }).compile();

    useCase = module.get<GetTransactionsUseCase>(GetTransactionsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call repository with groupBy filter', async () => {
    const items = [{ period: '2026-01', total: 1000, count: 5 }];
    reportRepository.getTransactions.mockResolvedValue(items);

    const result = await useCase.getTransactions({ groupBy: 'month' });

    expect(result).toEqual(items);
    expect(reportRepository.getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ groupBy: 'month' }),
    );
  });

  it('should default groupBy to month', async () => {
    reportRepository.getTransactions.mockResolvedValue([]);

    await useCase.getTransactions({});

    expect(reportRepository.getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ groupBy: 'month' }),
    );
  });

  it('should parse date filters', async () => {
    reportRepository.getTransactions.mockResolvedValue([]);

    await useCase.getTransactions({
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      groupBy: 'day',
    });

    expect(reportRepository.getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.any(Date) as Date,
        dateTo: expect.any(Date) as Date,
        groupBy: 'day',
      }),
    );
  });
});
