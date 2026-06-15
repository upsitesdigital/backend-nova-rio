import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import { CancelClientAppointmentUseCase } from './cancel-client-appointment.use-case.js';

describe('CancelClientAppointmentUseCase', () => {
  let useCase: CancelClientAppointmentUseCase;
  let appointmentRepository: { findAppointmentByIdAndClientId: Mock; cancelAppointmentById: Mock };
  let emailService: { sendAppointmentCancelledEmail: Mock };
  let schedulingValidator: { validateCancellationAdvance: Mock };

  const existingAppointment = {
    id: 1,
    date: new Date('2026-03-16'),
    startTime: '09:00',
    duration: 120,
    status: 'SCHEDULED',
    client: { id: 1, name: 'João', email: 'joao@test.com' },
    service: { id: 1, name: 'Faxina Regular' },
  };

  beforeEach(async () => {
    appointmentRepository = {
      findAppointmentByIdAndClientId: vi.fn(),
      cancelAppointmentById: vi.fn(),
    };
    emailService = { sendAppointmentCancelledEmail: vi.fn().mockResolvedValue(undefined) };
    schedulingValidator = { validateCancellationAdvance: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelClientAppointmentUseCase,
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
        { provide: DiTokens.emailService, useValue: emailService },
        { provide: AppointmentSchedulingValidator, useValue: schedulingValidator },
      ],
    }).compile();

    useCase = module.get<CancelClientAppointmentUseCase>(CancelClientAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(null);

    await expect(useCase.cancelAppointmentByIdAndClientId(1, 1)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when not SCHEDULED', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue({
      ...existingAppointment,
      status: 'COMPLETED',
    });

    await expect(useCase.cancelAppointmentByIdAndClientId(1, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should cancel, validate 1h rule, and send email', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(existingAppointment);
    appointmentRepository.cancelAppointmentById.mockResolvedValue(undefined);

    await useCase.cancelAppointmentByIdAndClientId(1, 1);

    expect(schedulingValidator.validateCancellationAdvance).toHaveBeenCalled();
    expect(appointmentRepository.cancelAppointmentById).toHaveBeenCalledWith(1, 1);
    expect(emailService.sendAppointmentCancelledEmail).toHaveBeenCalled();
  });
});
