import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetClientAppointmentUseCase } from './get-client-appointment.use-case.js';

describe('GetClientAppointmentUseCase', () => {
  let useCase: GetClientAppointmentUseCase;
  let appointmentRepository: { findAppointmentByIdAndClientId: Mock };

  beforeEach(async () => {
    appointmentRepository = { findAppointmentByIdAndClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientAppointmentUseCase,
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
      ],
    }).compile();

    useCase = module.get<GetClientAppointmentUseCase>(GetClientAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return appointment when found', async () => {
    const appointment = { id: 1 };
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(appointment);

    const result = await useCase.getAppointmentByIdAndClientId(1, 1);

    expect(result).toEqual(appointment);
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(null);

    await expect(useCase.getAppointmentByIdAndClientId(1, 1)).rejects.toThrow(NotFoundException);
  });
});
