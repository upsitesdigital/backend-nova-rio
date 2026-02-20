import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AdminAppointmentsController } from './admin-appointments.controller.js';
import { CreateAppointmentUseCase } from './application/use-cases/appointment/create-appointment.use-case.js';
import { ListAppointmentsUseCase } from './application/use-cases/appointment/list-appointments.use-case.js';
import { GetAppointmentUseCase } from './application/use-cases/appointment/get-appointment.use-case.js';
import { UpdateAppointmentUseCase } from './application/use-cases/appointment/update-appointment.use-case.js';
import { RescheduleAppointmentUseCase } from './application/use-cases/appointment/reschedule-appointment.use-case.js';
import { CancelAppointmentUseCase } from './application/use-cases/appointment/cancel-appointment.use-case.js';
import { CompleteAppointmentUseCase } from './application/use-cases/appointment/complete-appointment.use-case.js';

describe('AdminAppointmentsController', () => {
  let controller: AdminAppointmentsController;
  let createAppointmentUseCase: { createAppointment: Mock };
  let listAppointmentsUseCase: { listAppointments: Mock };
  let getAppointmentUseCase: { getAppointmentById: Mock };
  let updateAppointmentUseCase: { updateAppointmentById: Mock };
  let rescheduleAppointmentUseCase: { rescheduleAppointmentById: Mock };
  let cancelAppointmentUseCase: { cancelAppointmentById: Mock };
  let completeAppointmentUseCase: { completeAppointmentById: Mock };

  beforeEach(async () => {
    createAppointmentUseCase = { createAppointment: vi.fn() };
    listAppointmentsUseCase = { listAppointments: vi.fn() };
    getAppointmentUseCase = { getAppointmentById: vi.fn() };
    updateAppointmentUseCase = { updateAppointmentById: vi.fn() };
    rescheduleAppointmentUseCase = { rescheduleAppointmentById: vi.fn() };
    cancelAppointmentUseCase = { cancelAppointmentById: vi.fn() };
    completeAppointmentUseCase = { completeAppointmentById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAppointmentsController],
      providers: [
        { provide: CreateAppointmentUseCase, useValue: createAppointmentUseCase },
        { provide: ListAppointmentsUseCase, useValue: listAppointmentsUseCase },
        { provide: GetAppointmentUseCase, useValue: getAppointmentUseCase },
        { provide: UpdateAppointmentUseCase, useValue: updateAppointmentUseCase },
        { provide: RescheduleAppointmentUseCase, useValue: rescheduleAppointmentUseCase },
        { provide: CancelAppointmentUseCase, useValue: cancelAppointmentUseCase },
        { provide: CompleteAppointmentUseCase, useValue: completeAppointmentUseCase },
      ],
    }).compile();

    controller = module.get<AdminAppointmentsController>(AdminAppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createAppointment should call createAppointmentUseCase', async () => {
    const dto = {
      date: '2026-03-16',
      startTime: '09:00',
      duration: 120,
      clientId: 1,
      serviceId: 1,
    };
    await controller.createAppointment(dto);
    expect(createAppointmentUseCase.createAppointment).toHaveBeenCalledWith(dto);
  });

  it('listAppointments should call listAppointmentsUseCase', async () => {
    const query = { status: 'SCHEDULED' as const };
    await controller.listAppointments(query);
    expect(listAppointmentsUseCase.listAppointments).toHaveBeenCalledWith(query);
  });

  it('getAppointmentById should call getAppointmentUseCase', async () => {
    await controller.getAppointmentById(1);
    expect(getAppointmentUseCase.getAppointmentById).toHaveBeenCalledWith(1);
  });

  it('updateAppointmentById should call updateAppointmentUseCase', async () => {
    const dto = { notes: 'updated' };
    await controller.updateAppointmentById(1, dto);
    expect(updateAppointmentUseCase.updateAppointmentById).toHaveBeenCalledWith(1, dto);
  });

  it('rescheduleAppointmentById should call rescheduleAppointmentUseCase', async () => {
    const dto = { date: '2026-03-20', startTime: '10:00' };
    await controller.rescheduleAppointmentById(1, dto);
    expect(rescheduleAppointmentUseCase.rescheduleAppointmentById).toHaveBeenCalledWith(1, dto);
  });

  it('cancelAppointmentById should call cancelAppointmentUseCase', async () => {
    await controller.cancelAppointmentById(1);
    expect(cancelAppointmentUseCase.cancelAppointmentById).toHaveBeenCalledWith(1);
  });

  it('completeAppointmentById should call completeAppointmentUseCase', async () => {
    await controller.completeAppointmentById(1);
    expect(completeAppointmentUseCase.completeAppointmentById).toHaveBeenCalledWith(1);
  });
});
