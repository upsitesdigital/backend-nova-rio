import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { DASHBOARD_REPOSITORY } from '../../../domain/interfaces/dashboard.repository.interface.js';
import { GetPendingAppointmentsCountUseCase } from './get-pending-appointments-count.use-case.js';

describe('GetPendingAppointmentsCountUseCase', () => {
  let useCase: GetPendingAppointmentsCountUseCase;
  let dashboardRepository: { getPendingAppointmentsCount: Mock };

  beforeEach(async () => {
    dashboardRepository = { getPendingAppointmentsCount: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPendingAppointmentsCountUseCase,
        { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository },
      ],
    }).compile();

    useCase = module.get<GetPendingAppointmentsCountUseCase>(GetPendingAppointmentsCountUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return pending appointments count', async () => {
    dashboardRepository.getPendingAppointmentsCount.mockResolvedValue(12);

    const result = await useCase.getPendingAppointmentsCount({});

    expect(result).toEqual({ count: 12 });
    expect(dashboardRepository.getPendingAppointmentsCount).toHaveBeenCalledWith({});
  });

  it('should pass unitId filter', async () => {
    dashboardRepository.getPendingAppointmentsCount.mockResolvedValue(4);

    await useCase.getPendingAppointmentsCount({ unitId: 3 });

    expect(dashboardRepository.getPendingAppointmentsCount).toHaveBeenCalledWith({ unitId: 3 });
  });
});
