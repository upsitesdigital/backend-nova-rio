const PAYMENT_METHOD_TO_VINDI: Record<string, string> = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
};

export function mapPaymentMethodToVindi(method: string): string {
  return PAYMENT_METHOD_TO_VINDI[method] ?? 'pix';
}
