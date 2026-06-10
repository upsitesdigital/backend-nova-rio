import type { RecurrenceType } from '@prisma/client';

export interface PricingResult {
  subtotal: number;
  discount: number;
}

export interface IPaymentPricingService {
  calculatePricing(
    serviceId: number,
    recurrenceType: RecurrenceType,
    packageId: number | null,
  ): Promise<PricingResult>;
}
