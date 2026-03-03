import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import { GetClientPaymentUseCase } from './get-client-payment.use-case.js';

describe('GetClientPaymentUseCase', () => {
  let useCase: GetClientPaymentUseCase;
  let paymentRepository: { findPaymentByIdAndClientId: Mock };

  beforeEach(async () => {
    paymentRepository = { findPaymentByIdAndClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientPaymentUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: paymentRepository },
      ],
    }).compile();

    useCase = module.get<GetClientPaymentUseCase>(GetClientPaymentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return payment when found', async () => {
    const payment = { id: 1 };
    paymentRepository.findPaymentByIdAndClientId.mockResolvedValue(payment);

    const result = await useCase.getPaymentByIdAndClientId(1, 1);

    expect(result).toEqual(payment);
  });

  it('should throw NotFoundException when not found', async () => {
    paymentRepository.findPaymentByIdAndClientId.mockResolvedValue(null);

    await expect(useCase.getPaymentByIdAndClientId(1, 1)).rejects.toThrow(NotFoundException);
  });
});
