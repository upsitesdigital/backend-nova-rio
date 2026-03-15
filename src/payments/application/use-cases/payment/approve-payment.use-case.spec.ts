import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { RECEIPT_GENERATION_SERVICE } from '../../../../receipts/domain/interfaces/receipt-generation.service.interface.js';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import { ApprovePaymentUseCase } from './approve-payment.use-case.js';

describe('ApprovePaymentUseCase', () => {
  let useCase: ApprovePaymentUseCase;
  let paymentRepository: { findPaymentById: Mock; approvePaymentById: Mock };
  let emailService: { sendPaymentApprovedEmail: Mock };
  let receiptGenerationService: { generateReceiptForPayment: Mock };

  const pendingPayment = {
    id: 1,
    amount: 150,
    status: 'PENDING',
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
      findPaymentById: vi.fn(),
      approvePaymentById: vi.fn(),
    };
    emailService = { sendPaymentApprovedEmail: vi.fn().mockResolvedValue(undefined) };
    receiptGenerationService = { generateReceiptForPayment: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovePaymentUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: paymentRepository },
        { provide: EMAIL_SERVICE, useValue: emailService },
        { provide: RECEIPT_GENERATION_SERVICE, useValue: receiptGenerationService },
      ],
    }).compile();

    useCase = module.get<ApprovePaymentUseCase>(ApprovePaymentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    paymentRepository.findPaymentById.mockResolvedValue(null);

    await expect(useCase.approvePaymentById(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when not PENDING', async () => {
    paymentRepository.findPaymentById.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    await expect(useCase.approvePaymentById(1)).rejects.toThrow(BadRequestException);
  });

  it('should approve payment and send email', async () => {
    paymentRepository.findPaymentById.mockResolvedValue(pendingPayment);
    paymentRepository.approvePaymentById.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    const result = await useCase.approvePaymentById(1);

    expect(result.status).toBe('APPROVED');
    expect(paymentRepository.approvePaymentById).toHaveBeenCalledWith(1);
    expect(emailService.sendPaymentApprovedEmail).toHaveBeenCalled();
  });
});
