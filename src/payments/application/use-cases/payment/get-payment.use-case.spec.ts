import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetPaymentUseCase } from './get-payment.use-case.js';

describe('GetPaymentUseCase', () => {
  let useCase: GetPaymentUseCase;
  let paymentRepository: { findPaymentById: Mock };

  beforeEach(async () => {
    paymentRepository = { findPaymentById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPaymentUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
      ],
    }).compile();

    useCase = module.get<GetPaymentUseCase>(GetPaymentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return payment when found', async () => {
    const payment = { id: 1 };
    paymentRepository.findPaymentById.mockResolvedValue(payment);

    const result = await useCase.getPaymentById(1);

    expect(result).toEqual(payment);
  });

  it('should throw NotFoundException when not found', async () => {
    paymentRepository.findPaymentById.mockResolvedValue(null);

    await expect(useCase.getPaymentById(1)).rejects.toThrow(NotFoundException);
  });
});
