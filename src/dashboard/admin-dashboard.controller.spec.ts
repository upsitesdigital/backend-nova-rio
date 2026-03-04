import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { GetActiveClientsCountUseCase } from './application/use-cases/dashboard/get-active-clients-count.use-case.js';
import { GetPendingAppointmentsCountUseCase } from './application/use-cases/dashboard/get-pending-appointments-count.use-case.js';
import { GetTodayAgendaUseCase } from './application/use-cases/dashboard/get-today-agenda.use-case.js';
import { GetTodayAppointmentsCountUseCase } from './application/use-cases/dashboard/get-today-appointments-count.use-case.js';

describe('AdminDashboardController', () => {
  let controller: AdminDashboardController;
  let getTodayAppointmentsCountUseCase: { getTodayAppointmentsCount: Mock };
  let getActiveClientsCountUseCase: { getActiveClientsCount: Mock };
  let getPendingAppointmentsCountUseCase: { getPendingAppointmentsCount: Mock };
  let getTodayAgendaUseCase: { getTodayAgenda: Mock };

  beforeEach(async () => {
    getTodayAppointmentsCountUseCase = { getTodayAppointmentsCount: vi.fn() };
    getActiveClientsCountUseCase = { getActiveClientsCount: vi.fn() };
    getPendingAppointmentsCountUseCase = { getPendingAppointmentsCount: vi.fn() };
    getTodayAgendaUseCase = { getTodayAgenda: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
      providers: [
        { provide: GetTodayAppointmentsCountUseCase, useValue: getTodayAppointmentsCountUseCase },
        { provide: GetActiveClientsCountUseCase, useValue: getActiveClientsCountUseCase },
        {
          provide: GetPendingAppointmentsCountUseCase,
          useValue: getPendingAppointmentsCountUseCase,
        },
        { provide: GetTodayAgendaUseCase, useValue: getTodayAgendaUseCase },
      ],
    }).compile();

    controller = module.get<AdminDashboardController>(AdminDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getTodayAppointmentsCount should call use case', async () => {
    const query = { unitId: 1 };
    await controller.getTodayAppointmentsCount(query);
    expect(getTodayAppointmentsCountUseCase.getTodayAppointmentsCount).toHaveBeenCalledWith(query);
  });

  it('getActiveClientsCount should call use case', async () => {
    const query = {};
    await controller.getActiveClientsCount(query);
    expect(getActiveClientsCountUseCase.getActiveClientsCount).toHaveBeenCalledWith(query);
  });

  it('getPendingAppointmentsCount should call use case', async () => {
    const query = { unitId: 2 };
    await controller.getPendingAppointmentsCount(query);
    expect(getPendingAppointmentsCountUseCase.getPendingAppointmentsCount).toHaveBeenCalledWith(
      query,
    );
  });

  it('getTodayAgenda should call use case', async () => {
    const query = { serviceId: 1, page: 1, limit: 10 };
    await controller.getTodayAgenda(query);
    expect(getTodayAgendaUseCase.getTodayAgenda).toHaveBeenCalledWith(query);
  });
});
