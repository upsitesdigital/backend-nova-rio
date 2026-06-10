import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from '@prisma/client';
import { type Mock, vi } from 'vitest';
import { ListClientPaymentsUseCase } from './list-client-payments.use-case.js';

describe('ListClientPaymentsUseCase', () => {
  let useCase: ListClientPaymentsUseCase;
  let paymentRepository: { listPaymentsByClientId: Mock };

  beforeEach(async () => {
    paymentRepository = { listPaymentsByClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListClientPaymentsUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
      ],
    }).compile();

    useCase = module.get<ListClientPaymentsUseCase>(ListClientPaymentsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list payments by client id', async () => {
    const paginated = { data: [{ id: 1 }], total: 1, page: 1, limit: 20 };
    paymentRepository.listPaymentsByClientId.mockResolvedValue(paginated);

    const result = await useCase.listPaymentsByClientId(1, 1, 20);

    expect(result).toEqual(paginated);
    expect(paymentRepository.listPaymentsByClientId).toHaveBeenCalledWith(1, 1, 20, undefined);
  });

  it('should pass status filter', async () => {
    paymentRepository.listPaymentsByClientId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await useCase.listPaymentsByClientId(1, 1, 20, PaymentStatus.PENDING);

    expect(paymentRepository.listPaymentsByClientId).toHaveBeenCalledWith(
      1,
      1,
      20,
      PaymentStatus.PENDING,
    );
  });
});
