import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import { RescheduleClientAppointmentUseCase } from './reschedule-client-appointment.use-case.js';

describe('RescheduleClientAppointmentUseCase', () => {
  let useCase: RescheduleClientAppointmentUseCase;
  let appointmentRepository: { findAppointmentByIdAndClientId: Mock; rescheduleAppointment: Mock };
  let emailService: { sendAppointmentRescheduledEmail: Mock };
  let schedulingValidator: {
    validateSchedulingDate: Mock;
    validateCancellationAdvance: Mock;
  };

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
    employee: null,
    package: null,
    unit: null,
    payment: { id: 1, status: 'APPROVED' },
  };

  beforeEach(async () => {
    appointmentRepository = {
      findAppointmentByIdAndClientId: vi.fn(),
      rescheduleAppointment: vi.fn(),
    };
    emailService = { sendAppointmentRescheduledEmail: vi.fn().mockResolvedValue(undefined) };
    schedulingValidator = {
      validateSchedulingDate: vi.fn(),
      validateCancellationAdvance: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RescheduleClientAppointmentUseCase,
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
        { provide: DiTokens.emailService, useValue: emailService },
        { provide: AppointmentSchedulingValidator, useValue: schedulingValidator },
      ],
    }).compile();

    useCase = module.get<RescheduleClientAppointmentUseCase>(RescheduleClientAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(null);

    await expect(
      useCase.rescheduleAppointmentByIdAndClientId(1, 1, {
        date: '2026-03-20',
        startTime: '10:00',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when not SCHEDULED', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue({
      ...existingAppointment,
      status: 'COMPLETED',
    });

    await expect(
      useCase.rescheduleAppointmentByIdAndClientId(1, 1, {
        date: '2026-03-20',
        startTime: '10:00',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when payment is not APPROVED', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue({
      ...existingAppointment,
      payment: { id: 1, status: 'PENDING' },
    });

    await expect(
      useCase.rescheduleAppointmentByIdAndClientId(1, 1, {
        date: '2026-03-20',
        startTime: '10:00',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(appointmentRepository.rescheduleAppointment).not.toHaveBeenCalled();
  });

  it('should reschedule, validate 1h rule, and send email', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(existingAppointment);
    appointmentRepository.rescheduleAppointment.mockResolvedValue({ id: 1 });

    const result = await useCase.rescheduleAppointmentByIdAndClientId(1, 1, {
      date: '2026-03-20',
      startTime: '10:00',
    });

    expect(result).toEqual({ id: 1 });
    expect(schedulingValidator.validateCancellationAdvance).toHaveBeenCalled();
    // the new slot must also be validated to be at least 1h in the future
    expect(schedulingValidator.validateCancellationAdvance).toHaveBeenCalledWith(
      expect.any(Date),
      '10:00',
    );
    expect(schedulingValidator.validateSchedulingDate).toHaveBeenCalled();
    expect(appointmentRepository.rescheduleAppointment).toHaveBeenCalledWith(
      1,
      { date: expect.any(Date) as Date, startTime: '10:00' },
      undefined,
      expect.objectContaining({ clientId: 1, excludeId: 1 }),
      1,
    );
    expect(emailService.sendAppointmentRescheduledEmail).toHaveBeenCalled();
  });
});
