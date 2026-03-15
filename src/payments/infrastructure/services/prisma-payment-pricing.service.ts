import { BadRequestException, Injectable } from '@nestjs/common';
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
    recurrenceType: string,
    packageId: number | null,
  ): Promise<PricingResult> {
    if (recurrenceType === 'PACKAGE' && packageId) {
      return this.calculatePackagePricing(packageId);
    }

    return this.calculateServicePricing(serviceId, recurrenceType);
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
    recurrenceType: string,
  ): Promise<PricingResult> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { basePrice: true },
    });

    if (!service) {
      throw new BadRequestException('Service not found');
    }

    const basePrice = Number(service.basePrice);
    const discountRate = this.resolveDiscountRate(recurrenceType);
    const discount = basePrice * discountRate;

    return { subtotal: basePrice, discount };
  }

  private resolveDiscountRate(recurrenceType: string): number {
    if (recurrenceType === 'WEEKLY' || recurrenceType === 'BIWEEKLY') {
      return 0.1;
    }

    if (recurrenceType === 'MONTHLY') {
      return 0.05;
    }

    return 0;
  }
}
