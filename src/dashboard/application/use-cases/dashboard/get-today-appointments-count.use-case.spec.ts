import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetTodayAppointmentsCountUseCase } from './get-today-appointments-count.use-case.js';

describe('GetTodayAppointmentsCountUseCase', () => {
  let useCase: GetTodayAppointmentsCountUseCase;
  let dashboardRepository: { getTodayAppointmentsCount: Mock };

  beforeEach(async () => {
    dashboardRepository = { getTodayAppointmentsCount: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTodayAppointmentsCountUseCase,
        { provide: DiTokens.dashboardRepository, useValue: dashboardRepository },
      ],
    }).compile();

    useCase = module.get<GetTodayAppointmentsCountUseCase>(GetTodayAppointmentsCountUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return today appointments count', async () => {
    dashboardRepository.getTodayAppointmentsCount.mockResolvedValue(5);

    const result = await useCase.getTodayAppointmentsCount({});

    expect(result).toEqual({ count: 5 });
    expect(dashboardRepository.getTodayAppointmentsCount).toHaveBeenCalledWith({});
  });

  it('should pass unitId filter', async () => {
    dashboardRepository.getTodayAppointmentsCount.mockResolvedValue(3);

    await useCase.getTodayAppointmentsCount({ unitId: 2 });

    expect(dashboardRepository.getTodayAppointmentsCount).toHaveBeenCalledWith({ unitId: 2 });
  });
});
