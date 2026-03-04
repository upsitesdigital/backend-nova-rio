import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { DASHBOARD_REPOSITORY } from '../../../domain/interfaces/dashboard.repository.interface.js';
import { GetActiveClientsCountUseCase } from './get-active-clients-count.use-case.js';

describe('GetActiveClientsCountUseCase', () => {
  let useCase: GetActiveClientsCountUseCase;
  let dashboardRepository: { getActiveClientsCount: Mock };

  beforeEach(async () => {
    dashboardRepository = { getActiveClientsCount: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActiveClientsCountUseCase,
        { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository },
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
