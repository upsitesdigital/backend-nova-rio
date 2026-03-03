import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RECEIPT_REPOSITORY } from '../../../domain/interfaces/receipt.repository.interface.js';
import type {
  IReceiptRepository,
  ReceiptResponse,
} from '../../../domain/interfaces/receipt.repository.interface.js';

@Injectable()
export class GetReceiptUseCase {
  constructor(@Inject(RECEIPT_REPOSITORY) private receiptRepository: IReceiptRepository) {}

  async getReceiptByPaymentId(paymentId: number): Promise<ReceiptResponse> {
    const receipt = await this.receiptRepository.findReceiptByPaymentId(paymentId);

    if (!receipt) {
      throw new NotFoundException('Receipt not found for this payment');
    }

    return receipt;
  }
}
