import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetHoursByServiceUseCase } from './get-hours-by-service.use-case.js';

describe('GetHoursByServiceUseCase', () => {
  let useCase: GetHoursByServiceUseCase;
  let reportRepository: { getHoursByService: Mock };

  beforeEach(async () => {
    reportRepository = { getHoursByService: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHoursByServiceUseCase,
        { provide: DiTokens.reportRepository, useValue: reportRepository },
      ],
    }).compile();

    useCase = module.get<GetHoursByServiceUseCase>(GetHoursByServiceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return hours grouped by service', async () => {
    const items = [{ serviceId: 1, serviceName: 'Faxina', totalMinutes: 480 }];
    reportRepository.getHoursByService.mockResolvedValue(items);

    const result = await useCase.getHoursByService({
      dateFrom: '2026-01-01',
      dateTo: '2026-06-30',
    });

    expect(result).toEqual(items);
    expect(reportRepository.getHoursByService).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.any(Date) as Date,
        dateTo: expect.any(Date) as Date,
      }),
    );
  });

  it('should handle empty query', async () => {
    reportRepository.getHoursByService.mockResolvedValue([]);

    await useCase.getHoursByService({});

    expect(reportRepository.getHoursByService).toHaveBeenCalledWith({});
  });
});
