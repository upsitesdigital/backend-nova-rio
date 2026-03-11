import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { ClientAppointmentsController } from './client-appointments.controller.js';
import { CreateClientAppointmentUseCase } from './application/use-cases/appointment/create-client-appointment.use-case.js';
import { ListClientAppointmentsUseCase } from './application/use-cases/appointment/list-client-appointments.use-case.js';
import { GetClientAppointmentUseCase } from './application/use-cases/appointment/get-client-appointment.use-case.js';
import { RescheduleClientAppointmentUseCase } from './application/use-cases/appointment/reschedule-client-appointment.use-case.js';
import { CancelClientAppointmentUseCase } from './application/use-cases/appointment/cancel-client-appointment.use-case.js';
import { CreatePublicAppointmentUseCase } from './application/use-cases/appointment/create-public-appointment.use-case.js';

describe('ClientAppointmentsController', () => {
  let controller: ClientAppointmentsController;
  let createClientAppointmentUseCase: { createClientAppointment: Mock };
  let listClientAppointmentsUseCase: { listAppointmentsByClientId: Mock };
  let getClientAppointmentUseCase: { getAppointmentByIdAndClientId: Mock };
  let rescheduleClientAppointmentUseCase: { rescheduleAppointmentByIdAndClientId: Mock };
  let cancelClientAppointmentUseCase: { cancelAppointmentByIdAndClientId: Mock };
  let createPublicAppointmentUseCase: { createPublicAppointment: Mock };

  const clientUser: AuthUser = { id: 1, email: 'client@test.com', type: 'client' };

  beforeEach(async () => {
    createClientAppointmentUseCase = { createClientAppointment: vi.fn() };
    listClientAppointmentsUseCase = { listAppointmentsByClientId: vi.fn() };
    getClientAppointmentUseCase = { getAppointmentByIdAndClientId: vi.fn() };
    rescheduleClientAppointmentUseCase = { rescheduleAppointmentByIdAndClientId: vi.fn() };
    cancelClientAppointmentUseCase = { cancelAppointmentByIdAndClientId: vi.fn() };
    createPublicAppointmentUseCase = { createPublicAppointment: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientAppointmentsController],
      providers: [
        { provide: CreateClientAppointmentUseCase, useValue: createClientAppointmentUseCase },
        { provide: ListClientAppointmentsUseCase, useValue: listClientAppointmentsUseCase },
        { provide: GetClientAppointmentUseCase, useValue: getClientAppointmentUseCase },
        {
          provide: RescheduleClientAppointmentUseCase,
          useValue: rescheduleClientAppointmentUseCase,
        },
        { provide: CancelClientAppointmentUseCase, useValue: cancelClientAppointmentUseCase },
        { provide: CreatePublicAppointmentUseCase, useValue: createPublicAppointmentUseCase },
      ],
    }).compile();

    controller = module.get<ClientAppointmentsController>(ClientAppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createClientAppointment should call use case with user.id', async () => {
    const dto = { date: '2026-03-16', startTime: '09:00', duration: 120, serviceId: 1 };
    await controller.createClientAppointment(clientUser, dto);
    expect(createClientAppointmentUseCase.createClientAppointment).toHaveBeenCalledWith(1, dto);
  });

  it('listClientAppointments should call use case with user.id and pagination', async () => {
    await controller.listClientAppointments(clientUser, 1, 20);
    expect(listClientAppointmentsUseCase.listAppointmentsByClientId).toHaveBeenCalledWith(1, 1, 20);
  });

  it('getClientAppointmentById should call use case with id and user.id', async () => {
    await controller.getClientAppointmentById(clientUser, 5);
    expect(getClientAppointmentUseCase.getAppointmentByIdAndClientId).toHaveBeenCalledWith(5, 1);
  });

  it('rescheduleClientAppointmentById should call use case', async () => {
    const dto = { date: '2026-03-20', startTime: '10:00' };
    await controller.rescheduleClientAppointmentById(clientUser, 5, dto);
    expect(
      rescheduleClientAppointmentUseCase.rescheduleAppointmentByIdAndClientId,
    ).toHaveBeenCalledWith(5, 1, dto);
  });

  it('cancelClientAppointmentById should call use case', async () => {
    await controller.cancelClientAppointmentById(clientUser, 5);
    expect(cancelClientAppointmentUseCase.cancelAppointmentByIdAndClientId).toHaveBeenCalledWith(
      5,
      1,
    );
  });
});
