import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaPaymentRepository } from './prisma-payment.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

const mockPayment = {
  id: 1,
  uuid: 'uuid-1',
  amount: 100,
  subtotal: 90,
  serviceFee: 15,
  discount: 5,
  method: 'PIX',
  status: 'PENDING',
  cancellationReason: null,
  gatewayTransactionId: null,
  pixCode: 'pix123',
  pixQrCodeUrl: null,
  paidAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  client: { id: 1, name: 'Test', email: 'test@test.com', cpfCnpj: null },
  appointment: {
    id: 1,
    date: new Date(),
    startTime: '10:00',
    service: { id: 1, name: 'Limpeza' },
    recurrenceType: 'NONE',
  },
  card: null,
};

describe('PrismaPaymentRepository', () => {
  let repository: PrismaPaymentRepository;
  let prisma: {
    payment: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      payment: {
        create: vi.fn().mockResolvedValue(mockPayment),
        findMany: vi.fn().mockResolvedValue([mockPayment]),
        findUnique: vi.fn().mockResolvedValue(mockPayment),
        findFirst: vi.fn().mockResolvedValue(mockPayment),
        update: vi.fn().mockResolvedValue(mockPayment),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        count: vi.fn().mockResolvedValue(1),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaPaymentRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaPaymentRepository>(PrismaPaymentRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment', async () => {
      const data = {
        amount: 100,
        subtotal: 90,
        serviceFee: 15,
        discount: 5,
        method: 'PIX' as const,
        clientId: 1,
        appointmentId: 1,
      };

      const result = await repository.createPayment(data);

      expect(prisma.payment.create).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should throw BadRequestException on duplicate appointment', async () => {
      const error = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
      prisma.payment.create.mockRejectedValue(error);

      await expect(
        repository.createPayment({
          amount: 100,
          subtotal: 90,
          serviceFee: 15,
          discount: 5,
          method: 'PIX' as const,
          clientId: 1,
          appointmentId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listPayments', () => {
    it('should list payments with filters', async () => {
      const result = await repository.listPayments({
        page: 1,
        limit: 20,
        status: 'APPROVED',
      });

      expect(prisma.payment.findMany).toHaveBeenCalled();
      expect(prisma.payment.count).toHaveBeenCalled();
      expect(result).toEqual({ data: [mockPayment], total: 1, page: 1, limit: 20 });
    });
  });

  describe('listPaymentsByClientId', () => {
    it('should list payments for a client', async () => {
      const result = await repository.listPaymentsByClientId(1, 1, 20);

      expect(prisma.payment.findMany).toHaveBeenCalled();
      expect(result.data).toEqual([mockPayment]);
    });

    it('should filter by status when provided', async () => {
      await repository.listPaymentsByClientId(1, 1, 20, 'APPROVED');

      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clientId: 1, status: 'APPROVED' },
        }),
      );
    });
  });

  describe('findPaymentById', () => {
    it('should find payment by id', async () => {
      const result = await repository.findPaymentById(1);

      expect(prisma.payment.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(result).toEqual(mockPayment);
    });

    it('should return null when not found', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      const result = await repository.findPaymentById(999);

      expect(result).toBeNull();
    });
  });

  describe('findPaymentByIdAndClientId', () => {
    it('should find payment by id and client id', async () => {
      const result = await repository.findPaymentByIdAndClientId(1, 1);

      expect(prisma.payment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1, clientId: 1 } }),
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('findPaymentByGatewayTransactionId', () => {
    it('should find payment by gateway transaction id', async () => {
      const result = await repository.findPaymentByGatewayTransactionId('tx-123');

      expect(prisma.payment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { gatewayTransactionId: 'tx-123' } }),
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('approvePaymentById', () => {
    it('should approve payment and set paidAt', async () => {
      await repository.approvePaymentById(1);

      expect(prisma.payment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, status: 'PENDING' },
          data: { status: 'APPROVED', paidAt: expect.any(Date) as Date },
        }),
      );
    });
  });

  describe('cancelPaymentById', () => {
    it('should cancel payment with reason', async () => {
      await repository.cancelPaymentById(1, 'Customer request');

      expect(prisma.payment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, status: 'PENDING' },
          data: { status: 'CANCELLED', cancellationReason: 'Customer request' },
        }),
      );
    });
  });

  describe('deletePaymentById', () => {
    it('should soft-delete payment by setting status to CANCELLED', async () => {
      await repository.deletePaymentById(1);

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CANCELLED', cancellationReason: 'Deleted by admin' },
      });
    });
  });
});
