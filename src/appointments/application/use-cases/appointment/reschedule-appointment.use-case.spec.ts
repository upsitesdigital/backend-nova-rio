import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import { RescheduleAppointmentUseCase } from './reschedule-appointment.use-case.js';

describe('RescheduleAppointmentUseCase', () => {
  let useCase: RescheduleAppointmentUseCase;
  let appointmentRepository: { findAppointmentById: Mock; rescheduleAppointment: Mock };
  let emailService: { sendAppointmentRescheduledEmail: Mock };
  let schedulingValidator: { validateSchedulingDate: Mock };

  const existingAppointment = {
    id: 1,
    date: new Date('2026-03-16'),
    startTime: '09:00',
    duration: 120,
    status: 'SCHEDULED',
    recurrenceType: 'SINGLE',
    locationZip: null,
    locationAddress: null,
    notes: null,
    client: { id: 1, name: 'João', email: 'joao@test.com' },
    service: { id: 1, name: 'Faxina Regular' },
    employee: { id: 1, name: 'Maria' },
    package: null,
    unit: null,
  };

  beforeEach(async () => {
    appointmentRepository = {
      findAppointmentById: vi.fn(),
      rescheduleAppointment: vi.fn(),
    };
    emailService = { sendAppointmentRescheduledEmail: vi.fn().mockResolvedValue(undefined) };
    schedulingValidator = { validateSchedulingDate: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RescheduleAppointmentUseCase,
        { provide: APPOINTMENT_REPOSITORY, useValue: appointmentRepository },
        { provide: EMAIL_SERVICE, useValue: emailService },
        { provide: AppointmentSchedulingValidator, useValue: schedulingValidator },
      ],
    }).compile();

    useCase = module.get<RescheduleAppointmentUseCase>(RescheduleAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(null);

    await expect(
      useCase.rescheduleAppointmentById(1, { date: '2026-03-20', startTime: '10:00' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when not SCHEDULED', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue({
      ...existingAppointment,
      status: 'CANCELLED',
    });

    await expect(
      useCase.rescheduleAppointmentById(1, { date: '2026-03-20', startTime: '10:00' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reschedule with conflictCheck and send email', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(existingAppointment);
    appointmentRepository.rescheduleAppointment.mockResolvedValue({ id: 2 });

    const result = await useCase.rescheduleAppointmentById(1, {
      date: '2026-03-20',
      startTime: '10:00',
    });

    expect(result).toEqual({ id: 2 });
    expect(schedulingValidator.validateSchedulingDate).toHaveBeenCalled();
    expect(appointmentRepository.rescheduleAppointment).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ clientId: 1 }),
      expect.objectContaining({ employeeId: 1, startTime: '10:00', excludeId: 1 }),
    );
    expect(emailService.sendAppointmentRescheduledEmail).toHaveBeenCalled();
  });
});
