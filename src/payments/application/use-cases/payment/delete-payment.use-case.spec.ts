import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { DeletePaymentUseCase } from './delete-payment.use-case.js';

describe('DeletePaymentUseCase', () => {
  let useCase: DeletePaymentUseCase;
  let paymentRepository: { findPaymentById: Mock; deletePaymentById: Mock };

  beforeEach(async () => {
    paymentRepository = {
      findPaymentById: vi.fn(),
      deletePaymentById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePaymentUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
      ],
    }).compile();

    useCase = module.get<DeletePaymentUseCase>(DeletePaymentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    paymentRepository.findPaymentById.mockResolvedValue(null);

    await expect(useCase.deletePaymentById(1)).rejects.toThrow(NotFoundException);
  });

  it('should delete payment when found', async () => {
    paymentRepository.findPaymentById.mockResolvedValue({ id: 1 });
    paymentRepository.deletePaymentById.mockResolvedValue(undefined);

    await useCase.deletePaymentById(1);

    expect(paymentRepository.deletePaymentById).toHaveBeenCalledWith(1);
  });
});
