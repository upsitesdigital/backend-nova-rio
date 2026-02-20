import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import { CreateAppointmentUseCase } from './create-appointment.use-case.js';

describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase;
  let appointmentRepository: { createAppointment: Mock };
  let schedulingValidator: { validateSchedulingDate: Mock };

  beforeEach(async () => {
    appointmentRepository = { createAppointment: vi.fn() };
    schedulingValidator = { validateSchedulingDate: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAppointmentUseCase,
        { provide: APPOINTMENT_REPOSITORY, useValue: appointmentRepository },
        { provide: AppointmentSchedulingValidator, useValue: schedulingValidator },
      ],
    }).compile();

    useCase = module.get<CreateAppointmentUseCase>(CreateAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create appointment and validate date', async () => {
    const dto = {
      date: '2026-03-16',
      startTime: '09:00',
      duration: 120,
      clientId: 1,
      serviceId: 1,
    };
    const created = { id: 1, ...dto, date: new Date('2026-03-16') };
    appointmentRepository.createAppointment.mockResolvedValue(created);

    const result = await useCase.createAppointment(dto);

    expect(result).toEqual(created);
    expect(schedulingValidator.validateSchedulingDate).toHaveBeenCalled();
    expect(appointmentRepository.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: 1 }),
      undefined,
    );
  });

  it('should pass conflictCheck when employeeId is provided', async () => {
    const dto = {
      date: '2026-03-16',
      startTime: '09:00',
      duration: 120,
      clientId: 1,
      serviceId: 1,
      employeeId: 1,
    };
    appointmentRepository.createAppointment.mockResolvedValue({ id: 1 });

    await useCase.createAppointment(dto);

    expect(appointmentRepository.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 1 }),
      expect.objectContaining({
        employeeId: 1,
        startTime: '09:00',
        duration: 120,
      }),
    );
  });
});
