import type { RecurrenceType } from '@prisma/client';

export const PAYMENT_PRICING_SERVICE = Symbol('PAYMENT_PRICING_SERVICE');

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
