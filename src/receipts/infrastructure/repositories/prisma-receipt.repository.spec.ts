import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaReceiptRepository } from './prisma-receipt.repository.js';

describe('PrismaReceiptRepository', () => {
  let repository: PrismaReceiptRepository;
  let prisma: { receipt: { create: Mock; findUnique: Mock } };

  const mockReceipt = {
    id: 1,
    uuid: 'uuid-1',
    fileUrl: 'receipts/receipt-1-123.pdf',
    paymentId: 10,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      receipt: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaReceiptRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaReceiptRepository>(PrismaReceiptRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createReceipt', () => {
    it('should create a receipt', async () => {
      prisma.receipt.create.mockResolvedValue(mockReceipt);

      const result = await repository.createReceipt({
        paymentId: 10,
        fileUrl: 'receipts/receipt-1-123.pdf',
      });

      expect(result).toEqual(mockReceipt);
      expect(prisma.receipt.create).toHaveBeenCalledWith({
        data: {
          fileUrl: 'receipts/receipt-1-123.pdf',
          payment: { connect: { id: 10 } },
        },
      });
    });
  });

  describe('findReceiptByPaymentId', () => {
    it('should return receipt when found', async () => {
      prisma.receipt.findUnique.mockResolvedValue(mockReceipt);

      const result = await repository.findReceiptByPaymentId(10);

      expect(result).toEqual(mockReceipt);
      expect(prisma.receipt.findUnique).toHaveBeenCalledWith({
        where: { paymentId: 10 },
      });
    });

    it('should return null when not found', async () => {
      prisma.receipt.findUnique.mockResolvedValue(null);

      const result = await repository.findReceiptByPaymentId(999);

      expect(result).toBeNull();
    });
  });
});
