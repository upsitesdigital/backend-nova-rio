import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetAppointmentUseCase } from './get-appointment.use-case.js';

describe('GetAppointmentUseCase', () => {
  let useCase: GetAppointmentUseCase;
  let appointmentRepository: { findAppointmentById: Mock };

  beforeEach(async () => {
    appointmentRepository = { findAppointmentById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAppointmentUseCase,
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
      ],
    }).compile();

    useCase = module.get<GetAppointmentUseCase>(GetAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return appointment when found', async () => {
    const appointment = { id: 1 };
    appointmentRepository.findAppointmentById.mockResolvedValue(appointment);

    const result = await useCase.getAppointmentById(1);

    expect(result).toEqual(appointment);
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(null);

    await expect(useCase.getAppointmentById(1)).rejects.toThrow(NotFoundException);
  });
});
