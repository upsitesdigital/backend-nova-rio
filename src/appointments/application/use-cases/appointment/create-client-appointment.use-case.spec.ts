import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import { CreateClientAppointmentUseCase } from './create-client-appointment.use-case.js';

describe('CreateClientAppointmentUseCase', () => {
  let useCase: CreateClientAppointmentUseCase;
  let appointmentRepository: { createAppointment: Mock };
  let emailService: { sendAppointmentConfirmedEmail: Mock };
  let schedulingValidator: { validateSchedulingDate: Mock };

  beforeEach(async () => {
    appointmentRepository = { createAppointment: vi.fn() };
    emailService = { sendAppointmentConfirmedEmail: vi.fn().mockResolvedValue(undefined) };
    schedulingValidator = { validateSchedulingDate: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClientAppointmentUseCase,
        { provide: APPOINTMENT_REPOSITORY, useValue: appointmentRepository },
        { provide: EMAIL_SERVICE, useValue: emailService },
        { provide: AppointmentSchedulingValidator, useValue: schedulingValidator },
      ],
    }).compile();

    useCase = module.get<CreateClientAppointmentUseCase>(CreateClientAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create appointment with clientId from param and send email', async () => {
    const dto = { date: '2026-03-16', startTime: '09:00', duration: 120, serviceId: 1 };
    const created = {
      id: 1,
      client: { id: 1, name: 'João', email: 'joao@test.com' },
      service: { id: 1, name: 'Faxina Regular' },
    };
    appointmentRepository.createAppointment.mockResolvedValue(created);

    const result = await useCase.createClientAppointment(1, dto);

    expect(result).toEqual(created);
    expect(appointmentRepository.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: 1 }),
      undefined,
    );
    expect(emailService.sendAppointmentConfirmedEmail).toHaveBeenCalled();
  });

  it('should pass conflictCheck when employeeId is provided', async () => {
    const dto = {
      date: '2026-03-16',
      startTime: '09:00',
      duration: 120,
      serviceId: 1,
      employeeId: 2,
    };
    const created = {
      id: 1,
      client: { id: 1, name: 'João', email: 'joao@test.com' },
      service: { id: 1, name: 'Faxina Regular' },
    };
    appointmentRepository.createAppointment.mockResolvedValue(created);

    await useCase.createClientAppointment(1, dto);

    expect(appointmentRepository.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 2 }),
      expect.objectContaining({ employeeId: 2, duration: 120 }),
    );
  });
});
