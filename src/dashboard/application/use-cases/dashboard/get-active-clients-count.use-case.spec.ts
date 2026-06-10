import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetActiveClientsCountUseCase } from './get-active-clients-count.use-case.js';

describe('GetActiveClientsCountUseCase', () => {
  let useCase: GetActiveClientsCountUseCase;
  let dashboardRepository: { getActiveClientsCount: Mock };

  beforeEach(async () => {
    dashboardRepository = { getActiveClientsCount: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActiveClientsCountUseCase,
        { provide: DiTokens.dashboardRepository, useValue: dashboardRepository },
      ],
    }).compile();

    useCase = module.get<GetActiveClientsCountUseCase>(GetActiveClientsCountUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return active clients count', async () => {
    dashboardRepository.getActiveClientsCount.mockResolvedValue(25);

    const result = await useCase.getActiveClientsCount({});

    expect(result).toEqual({ count: 25 });
    expect(dashboardRepository.getActiveClientsCount).toHaveBeenCalledWith({});
  });

  it('should pass unitId filter', async () => {
    dashboardRepository.getActiveClientsCount.mockResolvedValue(10);

    await useCase.getActiveClientsCount({ unitId: 1 });

    expect(dashboardRepository.getActiveClientsCount).toHaveBeenCalledWith({ unitId: 1 });
  });
});
