import type { PaymentResponse } from '../../../payments/domain/interfaces/payment.repository.interface.js';

export interface IReceiptGenerator {
  generateReceiptPdf(payment: PaymentResponse): Promise<string>;
}
