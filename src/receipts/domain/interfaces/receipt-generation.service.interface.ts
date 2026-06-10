import type { ReceiptResponse } from './receipt.repository.interface.js';

export interface IReceiptGenerationService {
  generateReceiptForPayment(paymentId: number): Promise<ReceiptResponse>;
}
