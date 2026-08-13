import { BadRequestException, Injectable } from '@nestjs/common';
import type { RecurrenceType } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  IPaymentPricingService,
  PricingResult,
} from '../../domain/services/payment-pricing.service.interface.js';

@Injectable()
export class PrismaPaymentPricingService implements IPaymentPricingService {
  constructor(private prisma: PrismaService) {}

  async calculatePricing(
    serviceId: number,
    recurrenceType: RecurrenceType,
    packageId: number | null,
    weeklyFrequency: number,
  ): Promise<PricingResult> {
    if (recurrenceType === 'PACKAGE' && packageId) {
      return this.calculatePackagePricing(packageId);
    }

    return this.calculateServicePricing(serviceId, recurrenceType, weeklyFrequency);
  }

  private async calculatePackagePricing(packageId: number): Promise<PricingResult> {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      select: { price: true },
    });

    if (!pkg) {
      throw new BadRequestException('Package not found');
    }

    return { subtotal: Number(pkg.price), discount: 0 };
  }

  private async calculateServicePricing(
    serviceId: number,
    recurrenceType: RecurrenceType,
    weeklyFrequency: number,
  ): Promise<PricingResult> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { basePrice: true },
    });

    if (!service) {
      throw new BadRequestException('Service not found');
    }

    const monthlyVisits = this.resolveMonthlyVisits(recurrenceType, weeklyFrequency);
    const basePrice = Number(service.basePrice);
    const discountRate = this.resolveDiscountRate(monthlyVisits);
    const discountedUnitPrice = Number((basePrice * (1 - discountRate)).toFixed(2));
    const subtotal = basePrice * monthlyVisits;
    const discount = subtotal - discountedUnitPrice * monthlyVisits;

    return { subtotal, discount };
  }

  private resolveMonthlyVisits(recurrenceType: RecurrenceType, weeklyFrequency: number): number {
    const frequency = Math.max(1, Math.min(7, weeklyFrequency));
    if (recurrenceType === 'BIWEEKLY') return frequency * 2;
    if (recurrenceType === 'MONTHLY') return frequency;
    if (recurrenceType !== 'WEEKLY') return 1;
    if (frequency === 1) return 4;
    if (frequency === 2) return 8;
    if (frequency === 3) return 13;
    if (frequency === 4) return 17;
    return 21;
  }

  private resolveDiscountRate(monthlyVisits: number): number {
    if (monthlyVisits >= 21) return 0.1;
    if (monthlyVisits >= 17) return 0.09;
    if (monthlyVisits >= 13) return 0.08;
    if (monthlyVisits >= 8) return 0.07;
    if (monthlyVisits >= 4) return 0.05;
    if (monthlyVisits >= 2) return 0.03;
    return 0;
  }
}
