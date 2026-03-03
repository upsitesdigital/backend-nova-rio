import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { PAYMENT_REPOSITORY } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import { HandleVindiChargeRejectedUseCase } from './handle-vindi-charge-rejected.use-case.js';

describe('HandleVindiChargeRejectedUseCase', () => {
  let useCase: HandleVindiChargeRejectedUseCase;
  let paymentRepository: {
    findPaymentByGatewayTransactionId: Mock;
    cancelPaymentById: Mock;
  };
  let emailService: { sendPaymentCancelledEmail: Mock };

  const pendingPayment = {
    id: 1,
    status: 'PENDING',
    amount: 200,
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
      findPaymentByGatewayTransactionId: vi.fn(),
      cancelPaymentById: vi.fn(),
    };
    emailService = { sendPaymentCancelledEmail: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleVindiChargeRejectedUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: paymentRepository },
        { provide: EMAIL_SERVICE, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<HandleVindiChargeRejectedUseCase>(HandleVindiChargeRejectedUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should cancel payment and send email when charge is rejected', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue(pendingPayment);
    paymentRepository.cancelPaymentById.mockResolvedValue({
      ...pendingPayment,
      status: 'CANCELLED',
    });

    await useCase.handleChargeRejected(100, 'Card declined');

    expect(paymentRepository.findPaymentByGatewayTransactionId).toHaveBeenCalledWith('100');
    expect(paymentRepository.cancelPaymentById).toHaveBeenCalledWith(1, 'Card declined');
    expect(emailService.sendPaymentCancelledEmail).toHaveBeenCalledWith(
      'joao@test.com',
      'João',
      expect.any(String) as string,
      'Faxina Regular',
    );
  });

  it('should skip when no payment found for bill', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue(null);

    await useCase.handleChargeRejected(999, 'Card declined');

    expect(paymentRepository.cancelPaymentById).not.toHaveBeenCalled();
  });

  it('should skip when payment is not PENDING (idempotent)', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    await useCase.handleChargeRejected(100, 'Card declined');

    expect(paymentRepository.cancelPaymentById).not.toHaveBeenCalled();
  });
});
