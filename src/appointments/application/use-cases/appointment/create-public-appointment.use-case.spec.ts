import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import type { CreatePublicAppointmentDto } from '../../../dto/appointment/create-public-appointment.dto.js';
import { CLIENT_AUTH_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { CreateClientAppointmentUseCase } from './create-client-appointment.use-case.js';
import { CreatePublicAppointmentUseCase } from './create-public-appointment.use-case.js';

describe('CreatePublicAppointmentUseCase', () => {
  let useCase: CreatePublicAppointmentUseCase;
  let clientRepository: { findByEmail: Mock };
  let createClientAppointmentUseCase: { createClientAppointment: Mock };

  beforeEach(async () => {
    clientRepository = { findByEmail: vi.fn() };
    createClientAppointmentUseCase = { createClientAppointment: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePublicAppointmentUseCase,
        { provide: CLIENT_AUTH_REPOSITORY, useValue: clientRepository },
        { provide: CreateClientAppointmentUseCase, useValue: createClientAppointmentUseCase },
      ],
    }).compile();

    useCase = module.get<CreatePublicAppointmentUseCase>(CreatePublicAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create appointment when client exists', async () => {
    const dto: CreatePublicAppointmentDto = {
      email: 'joao@test.com',
      date: '2026-03-20',
      startTime: '09:00',
      duration: 120,
      serviceId: 1,
    };
    const client = { id: 5, name: 'João', email: 'joao@test.com' };
    const created = { id: 1, client, service: { id: 1, name: 'Faxina Regular' } };

    clientRepository.findByEmail.mockResolvedValue(client);
    createClientAppointmentUseCase.createClientAppointment.mockResolvedValue(created);

    const result = await useCase.createPublicAppointment(dto);

    expect(result).toEqual(created);
    expect(clientRepository.findByEmail).toHaveBeenCalledWith('joao@test.com');
    expect(createClientAppointmentUseCase.createClientAppointment).toHaveBeenCalledWith(5, dto);
  });

  it('should throw NotFoundException when client is not found', async () => {
    const dto: CreatePublicAppointmentDto = {
      email: 'unknown@test.com',
      date: '2026-03-20',
      startTime: '09:00',
      duration: 120,
      serviceId: 1,
    };

    clientRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.createPublicAppointment(dto)).rejects.toThrow(NotFoundException);
    expect(createClientAppointmentUseCase.createClientAppointment).not.toHaveBeenCalled();
  });
});
