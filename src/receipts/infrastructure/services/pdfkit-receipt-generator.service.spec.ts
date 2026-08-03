import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PdfkitReceiptGeneratorService } from './pdfkit-receipt-generator.service.js';
import type { PaymentResponse } from '../../../payments/domain/interfaces/payment.repository.interface.js';
import type { Prisma } from '@prisma/client';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  const { PassThrough } = await import('node:stream');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue('<svg></svg>'),
    createWriteStream: vi.fn().mockImplementation(() => {
      const stream = new PassThrough();
      setTimeout(() => stream.emit('finish'), 10);
      return stream;
    }),
  };
});

vi.mock('pdfkit', () => {
  return {
    default: class MockPDFDocument {
      y = 50;
      page = { width: 595 };
      pipe = vi.fn();
      fontSize = vi.fn().mockReturnThis();
      font = vi.fn().mockReturnThis();
      text = vi.fn().mockReturnThis();
      moveDown = vi.fn().mockReturnThis();
      moveTo = vi.fn().mockReturnThis();
      lineTo = vi.fn().mockReturnThis();
      stroke = vi.fn().mockReturnThis();
      end = vi.fn();
    },
  };
});

vi.mock('svg-to-pdfkit', () => ({ default: vi.fn() }));

describe('PdfkitReceiptGeneratorService', () => {
  let service: PdfkitReceiptGeneratorService;

  const mockPayment: PaymentResponse = {
    id: 1,
    uuid: 'abc-123',
    amount: 150 as unknown as Prisma.Decimal,
    subtotal: 140 as unknown as Prisma.Decimal,
    serviceFee: 15 as unknown as Prisma.Decimal,
    discount: 5 as unknown as Prisma.Decimal,
    method: 'PIX',
    status: 'APPROVED',
    cancellationReason: null,
    chargeAttempts: 0,
    gatewayTransactionId: 'tx-456',
    pixCode: 'pix123',
    pixQrCodeUrl: null,
    paidAt: new Date('2026-02-25'),
    createdAt: new Date('2026-02-25'),
    updatedAt: new Date('2026-02-25'),
    client: { id: 1, name: 'João', email: 'joao@test.com', cpfCnpj: '12345678900' },
    appointment: {
      id: 1,
      date: new Date('2026-02-25'),
      startTime: '14:00',
      service: { id: 1, name: 'Limpeza Padrão' },
      recurrenceType: 'SINGLE',
    },
    card: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfkitReceiptGeneratorService],
    }).compile();

    service = module.get<PdfkitReceiptGeneratorService>(PdfkitReceiptGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a receipt PDF and return relative URL', async () => {
    const result = await service.generateReceiptPdf(mockPayment);

    expect(result).toMatch(/^receipts\/receipt-1-\d+\.pdf$/);
  });

  it('should create uploads directory if it does not exist', async () => {
    const fs = await import('node:fs');
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

    await service.generateReceiptPdf(mockPayment);

    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('receipts'), {
      recursive: true,
    });
  });

  it('should handle payment with card method', async () => {
    const cardPayment: PaymentResponse = {
      ...mockPayment,
      method: 'CREDIT_CARD',
      card: { id: 1, lastFourDigits: '4321', brand: 'Visa' },
    };

    const result = await service.generateReceiptPdf(cardPayment);

    expect(result).toMatch(/^receipts\/receipt-1-\d+\.pdf$/);
  });
});
