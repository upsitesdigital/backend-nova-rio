import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GenerateReceiptUseCase } from './generate-receipt.use-case.js';

describe('GenerateReceiptUseCase', () => {
  let useCase: GenerateReceiptUseCase;
  let receiptRepository: { createReceipt: Mock; findReceiptByPaymentId: Mock };
  let receiptGenerator: { generateReceiptPdf: Mock };
  let paymentRepository: { findPaymentById: Mock };

  const mockPayment = {
    id: 1,
    uuid: 'uuid-1',
    amount: 150,
    subtotal: 140,
    serviceFee: 10,
    discount: 0,
    method: 'PIX',
    status: 'APPROVED',
    gatewayTransactionId: 'gw-123',
    paidAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    client: { id: 1, name: 'João', email: 'joao@test.com', cpfCnpj: '123.456.789-00' },
    appointment: {
      id: 1,
      date: new Date('2026-03-16'),
      startTime: '09:00',
      service: { id: 1, name: 'Faxina Regular' },
      recurrenceType: 'SINGLE',
    },
    card: null,
  };

  const mockReceipt = {
    id: 1,
    uuid: 'receipt-uuid',
    fileUrl: 'receipts/receipt-1-123.pdf',
    paymentId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    receiptRepository = {
      createReceipt: vi.fn(),
      findReceiptByPaymentId: vi.fn(),
    };
    receiptGenerator = { generateReceiptPdf: vi.fn() };
    paymentRepository = { findPaymentById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateReceiptUseCase,
        { provide: DiTokens.receiptRepository, useValue: receiptRepository },
        { provide: DiTokens.receiptGenerator, useValue: receiptGenerator },
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
      ],
    }).compile();

    useCase = module.get<GenerateReceiptUseCase>(GenerateReceiptUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return existing receipt without regenerating (idempotent)', async () => {
    receiptRepository.findReceiptByPaymentId.mockResolvedValue(mockReceipt);

    const result = await useCase.generateReceiptForPayment(1);

    expect(result).toEqual(mockReceipt);
    expect(receiptGenerator.generateReceiptPdf).not.toHaveBeenCalled();
    expect(receiptRepository.createReceipt).not.toHaveBeenCalled();
  });

  it('should generate PDF and persist receipt when none exists', async () => {
    receiptRepository.findReceiptByPaymentId.mockResolvedValue(null);
    paymentRepository.findPaymentById.mockResolvedValue(mockPayment);
    receiptGenerator.generateReceiptPdf.mockResolvedValue('receipts/receipt-1-456.pdf');
    receiptRepository.createReceipt.mockResolvedValue(mockReceipt);

    const result = await useCase.generateReceiptForPayment(1);

    expect(result).toEqual(mockReceipt);
    expect(paymentRepository.findPaymentById).toHaveBeenCalledWith(1);
    expect(receiptGenerator.generateReceiptPdf).toHaveBeenCalledWith(mockPayment);
    expect(receiptRepository.createReceipt).toHaveBeenCalledWith({
      paymentId: 1,
      fileUrl: 'receipts/receipt-1-456.pdf',
    });
  });

  it('should throw when payment not found', async () => {
    receiptRepository.findReceiptByPaymentId.mockResolvedValue(null);
    paymentRepository.findPaymentById.mockResolvedValue(null);

    await expect(useCase.generateReceiptForPayment(999)).rejects.toThrow(
      'Payment 999 not found for receipt generation',
    );
  });
});
