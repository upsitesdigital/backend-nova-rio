import type { ReceiptResponse } from './receipt.repository.interface.js';

export const RECEIPT_GENERATION_SERVICE = Symbol('RECEIPT_GENERATION_SERVICE');

export interface IReceiptGenerationService {
  generateReceiptForPayment(paymentId: number): Promise<ReceiptResponse>;
}
