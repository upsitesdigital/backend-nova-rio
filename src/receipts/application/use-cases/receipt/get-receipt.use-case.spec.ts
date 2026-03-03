import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { RECEIPT_REPOSITORY } from '../../../domain/interfaces/receipt.repository.interface.js';
import { GetReceiptUseCase } from './get-receipt.use-case.js';

describe('GetReceiptUseCase', () => {
  let useCase: GetReceiptUseCase;
  let receiptRepository: { findReceiptByPaymentId: Mock };

  const mockReceipt = {
    id: 1,
    uuid: 'receipt-uuid',
    fileUrl: 'receipts/receipt-1-123.pdf',
    paymentId: 10,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    receiptRepository = { findReceiptByPaymentId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetReceiptUseCase, { provide: RECEIPT_REPOSITORY, useValue: receiptRepository }],
    }).compile();

    useCase = module.get<GetReceiptUseCase>(GetReceiptUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return receipt when found', async () => {
    receiptRepository.findReceiptByPaymentId.mockResolvedValue(mockReceipt);

    const result = await useCase.getReceiptByPaymentId(10);

    expect(result).toEqual(mockReceipt);
  });

  it('should throw NotFoundException when not found', async () => {
    receiptRepository.findReceiptByPaymentId.mockResolvedValue(null);

    await expect(useCase.getReceiptByPaymentId(999)).rejects.toThrow(NotFoundException);
  });
});
