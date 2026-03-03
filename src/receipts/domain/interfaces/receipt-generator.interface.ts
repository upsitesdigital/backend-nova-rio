import type { PaymentResponse } from '../../../payments/domain/interfaces/payment.repository.interface.js';

export const RECEIPT_GENERATOR = Symbol('RECEIPT_GENERATOR');

export interface IReceiptGenerator {
  generateReceiptPdf(payment: PaymentResponse): Promise<string>;
}
