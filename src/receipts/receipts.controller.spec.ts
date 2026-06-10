import { DiTokens } from '../shared/di/di-tokens.js';
import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { GetClientReceiptUseCase } from './application/use-cases/receipt/get-client-receipt.use-case.js';
import { GetReceiptUseCase } from './application/use-cases/receipt/get-receipt.use-case.js';
import { ReceiptsController } from './receipts.controller.js';

vi.mock('node:fs', () => ({
  createReadStream: vi.fn(() => ({ pipe: vi.fn() })),
}));

describe('ReceiptsController', () => {
  let controller: ReceiptsController;
  let getReceiptUseCase: { getReceiptByPaymentId: ReturnType<typeof vi.fn> };
  let getClientReceiptUseCase: { getReceiptByPaymentIdAndClientId: ReturnType<typeof vi.fn> };

  const mockReceipt = {
    id: 1,
    uuid: 'receipt-uuid',
    fileUrl: 'receipts/receipt-1-123.pdf',
    paymentId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    getReceiptUseCase = { getReceiptByPaymentId: vi.fn() };
    getClientReceiptUseCase = { getReceiptByPaymentIdAndClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [
        { provide: GetReceiptUseCase, useValue: getReceiptUseCase },
        { provide: GetClientReceiptUseCase, useValue: getClientReceiptUseCase },
        { provide: DiTokens.clientAuthRepository, useValue: { findById: vi.fn() } },
      ],
    }).compile();

    controller = module.get<ReceiptsController>(ReceiptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('downloadClientReceipt', () => {
    it('should call getClientReceiptUseCase with correct params', async () => {
      getClientReceiptUseCase.getReceiptByPaymentIdAndClientId.mockResolvedValue(mockReceipt);

      const result = await controller.downloadClientReceipt(
        { id: 5, email: 'test@test.com', type: 'client' },
        1,
      );

      expect(getClientReceiptUseCase.getReceiptByPaymentIdAndClientId).toHaveBeenCalledWith(1, 5);
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('downloadAdminReceipt', () => {
    it('should call getReceiptUseCase with correct params', async () => {
      getReceiptUseCase.getReceiptByPaymentId.mockResolvedValue(mockReceipt);

      const result = await controller.downloadAdminReceipt(1);

      expect(getReceiptUseCase.getReceiptByPaymentId).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });
});
