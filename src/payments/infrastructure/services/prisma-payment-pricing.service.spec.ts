import { BadRequestException } from '@nestjs/common';
import { vi } from 'vitest';
import { PrismaPaymentPricingService } from './prisma-payment-pricing.service.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

describe('PrismaPaymentPricingService', () => {
  let service: PrismaPaymentPricingService;
  let prisma: {
    service: { findUnique: ReturnType<typeof vi.fn> };
    package: { findUnique: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    prisma = {
      service: { findUnique: vi.fn() },
      package: { findUnique: vi.fn() },
    };
    service = new PrismaPaymentPricingService(prisma as unknown as PrismaService);
  });

  it('charges base price once for SINGLE recurrence', async () => {
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });

    const result = await service.calculatePricing(1, 'SINGLE', null, 1);

    expect(result).toEqual({ subtotal: 200, discount: 0 });
  });

  it('applies 5% discount for 1x weekly (4 monthly visits)', async () => {
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });

    const result = await service.calculatePricing(1, 'WEEKLY', null, 1);

    expect(result).toEqual({ subtotal: 800, discount: 40 });
  });

  it('applies 8% discount for 3x weekly (13 monthly visits)', async () => {
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });

    const result = await service.calculatePricing(1, 'WEEKLY', null, 3);

    expect(result).toEqual({ subtotal: 2600, discount: 208 });
  });

  it('applies 3% discount for BIWEEKLY (2 monthly visits)', async () => {
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });

    const result = await service.calculatePricing(1, 'BIWEEKLY', null, 1);

    expect(result).toEqual({ subtotal: 400, discount: 12 });
  });

  it('rounds discounted unit price before multiplying visits', async () => {
    prisma.service.findUnique.mockResolvedValue({ basePrice: 99.99 });

    const result = await service.calculatePricing(1, 'WEEKLY', null, 5);

    expect(result).toEqual({ subtotal: 2099.79, discount: 210 });
  });

  it('prices a package by its own price ignoring frequency', async () => {
    prisma.package.findUnique.mockResolvedValue({ price: 500 });

    const result = await service.calculatePricing(1, 'PACKAGE', 9, 3);

    expect(result).toEqual({ subtotal: 500, discount: 0 });
    expect(prisma.service.findUnique).not.toHaveBeenCalled();
  });

  it('throws when service does not exist', async () => {
    prisma.service.findUnique.mockResolvedValue(null);

    await expect(service.calculatePricing(1, 'WEEKLY', null, 2)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
