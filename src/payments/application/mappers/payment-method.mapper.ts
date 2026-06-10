import { PaymentMethod } from '@prisma/client';

export class PaymentMethodMapper {
  private static readonly methodToVindi: Record<PaymentMethod, string> = {
    [PaymentMethod.CREDIT_CARD]: 'credit_card',
    [PaymentMethod.DEBIT_CARD]: 'debit_card',
    [PaymentMethod.PIX]: 'pix',
  };

  static toVindi(method: PaymentMethod): string {
    return PaymentMethodMapper.methodToVindi[method];
  }
}
