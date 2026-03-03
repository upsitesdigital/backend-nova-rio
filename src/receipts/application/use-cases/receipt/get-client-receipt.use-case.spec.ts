import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PAYMENT_REPOSITORY } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import { RECEIPT_REPOSITORY } from '../../../domain/interfaces/receipt.repository.interface.js';
import { GetClientReceiptUseCase } from './get-client-receipt.use-case.js';

describe('GetClientReceiptUseCase', () => {
  let useCase: GetClientReceiptUseCase;
  let receiptRepository: { findReceiptByPaymentId: Mock };
  let paymentRepository: { findPaymentByIdAndClientId: Mock };

  const mockPayment = {
    id: 10,
    uuid: 'pay-uuid',
    amount: 150,
    status: 'APPROVED',
    client: { id: 1, name: 'João', email: 'joao@test.com', cpfCnpj: null },
    appointment: {
      id: 1,
      date: new Date(),
      startTime: '09:00',
      service: { id: 1, name: 'Faxina' },
      recurrenceType: 'SINGLE',
    },
    card: null,
  };

  const mockReceipt = {
    id: 1,
    uuid: 'receipt-uuid',
    fileUrl: 'receipts/receipt-10-123.pdf',
    paymentId: 10,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    receiptRepository = { findReceiptByPaymentId: vi.fn() };
    paymentRepository = { findPaymentByIdAndClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientReceiptUseCase,
        { provide: RECEIPT_REPOSITORY, useValue: receiptRepository },
        { provide: PAYMENT_REPOSITORY, useValue: paymentRepository },
      ],
    }).compile();

    useCase = module.get<GetClientReceiptUseCase>(GetClientReceiptUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return receipt when payment belongs to client', async () => {
    paymentRepository.findPaymentByIdAndClientId.mockResolvedValue(mockPayment);
    receiptRepository.findReceiptByPaymentId.mockResolvedValue(mockReceipt);

    const result = await useCase.getReceiptByPaymentIdAndClientId(10, 1);

    expect(result).toEqual(mockReceipt);
    expect(paymentRepository.findPaymentByIdAndClientId).toHaveBeenCalledWith(10, 1);
  });

  it('should throw NotFoundException when payment not found for client', async () => {
    paymentRepository.findPaymentByIdAndClientId.mockResolvedValue(null);

    await expect(useCase.getReceiptByPaymentIdAndClientId(10, 999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when receipt not found', async () => {
    paymentRepository.findPaymentByIdAndClientId.mockResolvedValue(mockPayment);
    receiptRepository.findReceiptByPaymentId.mockResolvedValue(null);

    await expect(useCase.getReceiptByPaymentIdAndClientId(10, 1)).rejects.toThrow(
      NotFoundException,
    );
  });
});
