import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import { CancelAppointmentUseCase } from './cancel-appointment.use-case.js';

describe('CancelAppointmentUseCase', () => {
  let useCase: CancelAppointmentUseCase;
  let appointmentRepository: { findAppointmentById: Mock; cancelAppointmentById: Mock };
  let emailService: { sendAppointmentCancelledEmail: Mock };

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
      findAppointmentById: vi.fn(),
      cancelAppointmentById: vi.fn(),
    };
    emailService = { sendAppointmentCancelledEmail: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelAppointmentUseCase,
        { provide: APPOINTMENT_REPOSITORY, useValue: appointmentRepository },
        { provide: EMAIL_SERVICE, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<CancelAppointmentUseCase>(CancelAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(null);

    await expect(useCase.cancelAppointmentById(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when not SCHEDULED', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue({
      ...existingAppointment,
      status: 'COMPLETED',
    });

    await expect(useCase.cancelAppointmentById(1)).rejects.toThrow(BadRequestException);
  });

  it('should cancel appointment and send email', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(existingAppointment);
    appointmentRepository.cancelAppointmentById.mockResolvedValue(undefined);

    await useCase.cancelAppointmentById(1);

    expect(appointmentRepository.cancelAppointmentById).toHaveBeenCalledWith(1);
    expect(emailService.sendAppointmentCancelledEmail).toHaveBeenCalled();
  });
});
