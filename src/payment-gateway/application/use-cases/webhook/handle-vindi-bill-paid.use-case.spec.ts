import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { PAYMENT_REPOSITORY } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import { GenerateReceiptUseCase } from '../../../../receipts/application/use-cases/receipt/generate-receipt.use-case.js';
import { HandleVindiBillPaidUseCase } from './handle-vindi-bill-paid.use-case.js';

describe('HandleVindiBillPaidUseCase', () => {
  let useCase: HandleVindiBillPaidUseCase;
  let paymentRepository: {
    findPaymentByGatewayTransactionId: Mock;
    approvePaymentById: Mock;
  };
  let emailService: { sendPaymentApprovedEmail: Mock };
  let generateReceiptUseCase: { generateReceiptForPayment: Mock };

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
      approvePaymentById: vi.fn(),
    };
    emailService = { sendPaymentApprovedEmail: vi.fn().mockResolvedValue(undefined) };
    generateReceiptUseCase = { generateReceiptForPayment: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleVindiBillPaidUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: paymentRepository },
        { provide: EMAIL_SERVICE, useValue: emailService },
        { provide: GenerateReceiptUseCase, useValue: generateReceiptUseCase },
      ],
    }).compile();

    useCase = module.get<HandleVindiBillPaidUseCase>(HandleVindiBillPaidUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should approve payment and send email when bill is paid', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue(pendingPayment);
    paymentRepository.approvePaymentById.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    await useCase.handleBillPaid(100);

    expect(paymentRepository.findPaymentByGatewayTransactionId).toHaveBeenCalledWith('100');
    expect(paymentRepository.approvePaymentById).toHaveBeenCalledWith(1);
    expect(emailService.sendPaymentApprovedEmail).toHaveBeenCalledWith(
      'joao@test.com',
      'João',
      expect.any(String) as string,
      'Faxina Regular',
      '2026-03-16',
    );
  });

  it('should skip when no payment found for bill', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue(null);

    await useCase.handleBillPaid(999);

    expect(paymentRepository.approvePaymentById).not.toHaveBeenCalled();
  });

  it('should skip when payment is not PENDING (idempotent)', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    await useCase.handleBillPaid(100);

    expect(paymentRepository.approvePaymentById).not.toHaveBeenCalled();
  });
});
