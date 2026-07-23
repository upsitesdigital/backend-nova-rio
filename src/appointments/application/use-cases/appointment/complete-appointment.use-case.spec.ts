import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CompleteAppointmentUseCase } from './complete-appointment.use-case.js';

describe('CompleteAppointmentUseCase', () => {
  let useCase: CompleteAppointmentUseCase;
  let appointmentRepository: { findAppointmentById: Mock; completeAppointmentById: Mock };

  beforeEach(async () => {
    appointmentRepository = {
      findAppointmentById: vi.fn(),
      completeAppointmentById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteAppointmentUseCase,
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
      ],
    }).compile();

    useCase = module.get<CompleteAppointmentUseCase>(CompleteAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(null);

    await expect(useCase.completeAppointmentById(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when not SCHEDULED', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue({ id: 1, status: 'CANCELLED' });

    await expect(useCase.completeAppointmentById(1)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when payment is not APPROVED', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue({
      id: 1,
      status: 'SCHEDULED',
      payment: { id: 1, status: 'PENDING' },
    });

    await expect(useCase.completeAppointmentById(1)).rejects.toThrow(BadRequestException);
    expect(appointmentRepository.completeAppointmentById).not.toHaveBeenCalled();
  });

  it('should complete appointment', async () => {
    const appointment = { id: 1, status: 'SCHEDULED', payment: { id: 1, status: 'APPROVED' } };
    const completed = { ...appointment, status: 'COMPLETED' };
    appointmentRepository.findAppointmentById.mockResolvedValue(appointment);
    appointmentRepository.completeAppointmentById.mockResolvedValue(completed);

    const result = await useCase.completeAppointmentById(1);

    expect(result.status).toBe('COMPLETED');
    expect(appointmentRepository.completeAppointmentById).toHaveBeenCalledWith(1);
  });
});
