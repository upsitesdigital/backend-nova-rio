import type { PaymentMethod } from '@prisma/client';

const PAYMENT_METHOD_TO_VINDI: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
};

export function mapPaymentMethodToVindi(method: PaymentMethod): string {
  return PAYMENT_METHOD_TO_VINDI[method];
}
