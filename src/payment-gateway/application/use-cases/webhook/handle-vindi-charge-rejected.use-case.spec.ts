import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { HandleVindiBillCancelledUseCase } from './handle-vindi-bill-cancelled.use-case.js';
import { HandleVindiChargeRejectedUseCase } from './handle-vindi-charge-rejected.use-case.js';

describe('HandleVindiChargeRejectedUseCase', () => {
  let useCase: HandleVindiChargeRejectedUseCase;
  let paymentRepository: {
    findPaymentByGatewayTransactionId: Mock;
    incrementChargeAttempts: Mock;
  };
  let paymentGatewayService: { cancelGatewayBillById: Mock };
  let handleBillCancelled: { handleBillCancelled: Mock };

  const pendingPayment = {
    id: 1,
    status: 'PENDING',
    amount: 200,
    chargeAttempts: 0,
    gatewayTransactionId: '100',
    client: { id: 1, name: 'João', email: 'joao@test.com', cpfCnpj: null },
    appointment: {
      id: 1,
      date: new Date('2026-03-16'),
      startTime: '09:00',
      service: { id: 1, name: 'Faxina Regular' },
      recurrenceType: 'SINGLE',
    },
    card: null,
  };

  beforeEach(async () => {
    paymentRepository = {
      findPaymentByGatewayTransactionId: vi.fn().mockResolvedValue(pendingPayment),
      incrementChargeAttempts: vi.fn(),
    };
    paymentGatewayService = { cancelGatewayBillById: vi.fn().mockResolvedValue(undefined) };
    handleBillCancelled = { handleBillCancelled: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleVindiChargeRejectedUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
        { provide: DiTokens.paymentGatewayService, useValue: paymentGatewayService },
        { provide: HandleVindiBillCancelledUseCase, useValue: handleBillCancelled },
      ],
    }).compile();

    useCase = module.get<HandleVindiChargeRejectedUseCase>(HandleVindiChargeRejectedUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should only count the attempt on the first rejection', async () => {
    paymentRepository.incrementChargeAttempts.mockResolvedValue(1);

    await useCase.handleChargeRejected(100, 'Card declined');

    expect(paymentRepository.incrementChargeAttempts).toHaveBeenCalledWith(1);
    expect(paymentGatewayService.cancelGatewayBillById).not.toHaveBeenCalled();
    expect(handleBillCancelled.handleBillCancelled).not.toHaveBeenCalled();
  });

  it('should keep the bill alive on the second rejection', async () => {
    paymentRepository.incrementChargeAttempts.mockResolvedValue(2);

    await useCase.handleChargeRejected(100, 'Card declined');

    expect(paymentGatewayService.cancelGatewayBillById).not.toHaveBeenCalled();
    expect(handleBillCancelled.handleBillCancelled).not.toHaveBeenCalled();
  });

  it('should cancel the gateway bill and the payment on the third rejection', async () => {
    paymentRepository.incrementChargeAttempts.mockResolvedValue(3);

    await useCase.handleChargeRejected(100, 'Card declined');

    expect(paymentGatewayService.cancelGatewayBillById).toHaveBeenCalledWith(100);
    expect(handleBillCancelled.handleBillCancelled).toHaveBeenCalledWith(
      100,
      'Card declined (3 tentativas de cobranca)',
    );
  });

  it('should still cancel the payment when the gateway cancellation fails', async () => {
    paymentRepository.incrementChargeAttempts.mockResolvedValue(3);
    paymentGatewayService.cancelGatewayBillById.mockRejectedValue(new Error('Vindi down'));

    await useCase.handleChargeRejected(100, 'Card declined');

    expect(handleBillCancelled.handleBillCancelled).toHaveBeenCalled();
  });

  it('should skip when no payment found for bill', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue(null);

    await useCase.handleChargeRejected(999, 'Card declined');

    expect(paymentRepository.incrementChargeAttempts).not.toHaveBeenCalled();
  });

  it('should skip when payment is not PENDING (idempotent)', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    await useCase.handleChargeRejected(100, 'Card declined');

    expect(paymentRepository.incrementChargeAttempts).not.toHaveBeenCalled();
  });
});
