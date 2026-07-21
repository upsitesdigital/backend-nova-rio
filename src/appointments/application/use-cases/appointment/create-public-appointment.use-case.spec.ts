import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import type { CreatePublicAppointmentDto } from '../../../dto/appointment/create-public-appointment.dto.js';
import { CreatePublicAppointmentUseCase } from './create-public-appointment.use-case.js';
import { PaymentTokenService } from '../../../../payments/infrastructure/services/payment-token.service.js';

describe('CreatePublicAppointmentUseCase', () => {
  let useCase: CreatePublicAppointmentUseCase;
  let clientRepository: { findByEmail: Mock };
  let createClientAppointmentUseCase: { createClientAppointment: Mock };
  let paymentTokenService: { issuePaymentToken: Mock; verifyPaymentToken: Mock };

  beforeEach(async () => {
    clientRepository = { findByEmail: vi.fn() };
    createClientAppointmentUseCase = { createClientAppointment: vi.fn() };
    paymentTokenService = { issuePaymentToken: vi.fn(), verifyPaymentToken: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePublicAppointmentUseCase,
        { provide: DiTokens.clientAuthRepository, useValue: clientRepository },
        {
          provide: DiTokens.createClientAppointmentService,
          useValue: createClientAppointmentUseCase,
        },
        { provide: PaymentTokenService, useValue: paymentTokenService },
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
    paymentTokenService.issuePaymentToken.mockReturnValue('payment-token');

    const result = await useCase.createPublicAppointment(dto);

    expect(result).toEqual({ ...created, paymentToken: 'payment-token' });
    expect(paymentTokenService.issuePaymentToken).toHaveBeenCalledWith(1);
    expect(clientRepository.findByEmail).toHaveBeenCalledWith('joao@test.com');
    expect(createClientAppointmentUseCase.createClientAppointment).toHaveBeenCalledWith(5, dto);
  });

  it('should throw BadRequestException when client is not found', async () => {
    const dto: CreatePublicAppointmentDto = {
      email: 'unknown@test.com',
      date: '2026-03-20',
      startTime: '09:00',
      duration: 120,
      serviceId: 1,
    };

    clientRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.createPublicAppointment(dto)).rejects.toThrow(BadRequestException);
    expect(createClientAppointmentUseCase.createClientAppointment).not.toHaveBeenCalled();
  });
});
