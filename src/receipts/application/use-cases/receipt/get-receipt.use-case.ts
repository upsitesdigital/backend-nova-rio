import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IReceiptRepository,
  ReceiptResponse,
} from '../../../domain/interfaces/receipt.repository.interface.js';

@Injectable()
export class GetReceiptUseCase {
  constructor(@Inject(DiTokens.receiptRepository) private receiptRepository: IReceiptRepository) {}

  async getReceiptByPaymentId(paymentId: number): Promise<ReceiptResponse> {
    const receipt = await this.receiptRepository.findReceiptByPaymentId(paymentId);

    if (!receipt) {
      throw new NotFoundException('Receipt not found for this payment');
    }

    return receipt;
  }
}
