import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { DASHBOARD_REPOSITORY } from '../../../domain/interfaces/dashboard.repository.interface.js';
import { GetTodayAgendaUseCase } from './get-today-agenda.use-case.js';

describe('GetTodayAgendaUseCase', () => {
  let useCase: GetTodayAgendaUseCase;
  let dashboardRepository: { getTodayAgenda: Mock; getTodayAgendaTotal: Mock };

  beforeEach(async () => {
    dashboardRepository = {
      getTodayAgenda: vi.fn(),
      getTodayAgendaTotal: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTodayAgendaUseCase,
        { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository },
      ],
    }).compile();

    useCase = module.get<GetTodayAgendaUseCase>(GetTodayAgendaUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return today agenda with pagination', async () => {
    const items = [
      {
        appointmentId: 1,
        clientName: 'Maria',
        serviceName: 'Limpeza',
        startTime: '09:00',
        duration: 120,
        status: 'SCHEDULED',
        date: new Date(),
      },
    ];
    dashboardRepository.getTodayAgenda.mockResolvedValue(items);
    dashboardRepository.getTodayAgendaTotal.mockResolvedValue(1);

    const result = await useCase.getTodayAgenda({});

    expect(result).toEqual({ items, total: 1, page: 1, limit: 10 });
  });

  it('should pass filters to repository', async () => {
    dashboardRepository.getTodayAgenda.mockResolvedValue([]);
    dashboardRepository.getTodayAgendaTotal.mockResolvedValue(0);

    await useCase.getTodayAgenda({ serviceId: 2, unitId: 1, page: 2, limit: 5 });

    const expectedFilters = { serviceId: 2, unitId: 1, page: 2, limit: 5 };
    expect(dashboardRepository.getTodayAgenda).toHaveBeenCalledWith(expectedFilters);
    expect(dashboardRepository.getTodayAgendaTotal).toHaveBeenCalledWith(expectedFilters);
  });
});
