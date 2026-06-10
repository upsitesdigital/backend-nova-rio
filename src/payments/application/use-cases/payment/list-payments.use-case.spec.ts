import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from '@prisma/client';
import { type Mock, vi } from 'vitest';
import { ListPaymentsUseCase } from './list-payments.use-case.js';

describe('ListPaymentsUseCase', () => {
  let useCase: ListPaymentsUseCase;
  let paymentRepository: { listPayments: Mock };

  beforeEach(async () => {
    paymentRepository = { listPayments: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPaymentsUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
      ],
    }).compile();

    useCase = module.get<ListPaymentsUseCase>(ListPaymentsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list payments with filters and pagination', async () => {
    const paginated = { data: [{ id: 1 }], total: 1, page: 1, limit: 20 };
    paymentRepository.listPayments.mockResolvedValue(paginated);

    const result = await useCase.listPayments({ status: PaymentStatus.PENDING });

    expect(result).toEqual(paginated);
    expect(paymentRepository.listPayments).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20, status: PaymentStatus.PENDING }),
    );
  });

  it('should parse date filters', async () => {
    paymentRepository.listPayments.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    await useCase.listPayments({ dateFrom: '2026-01-01', dateTo: '2026-12-31' });

    expect(paymentRepository.listPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.any(Date) as Date,
        dateTo: expect.any(Date) as Date,
      }),
    );
  });
});
