import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import { RECEIPT_REPOSITORY } from '../../../domain/interfaces/receipt.repository.interface.js';
import type {
  IReceiptRepository,
  ReceiptResponse,
} from '../../../domain/interfaces/receipt.repository.interface.js';

@Injectable()
export class GetClientReceiptUseCase {
  constructor(
    @Inject(RECEIPT_REPOSITORY) private receiptRepository: IReceiptRepository,
    @Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository,
  ) {}

  async getReceiptByPaymentIdAndClientId(
    paymentId: number,
    clientId: number,
  ): Promise<ReceiptResponse> {
    const payment = await this.paymentRepository.findPaymentByIdAndClientId(paymentId, clientId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const receipt = await this.receiptRepository.findReceiptByPaymentId(paymentId);

    if (!receipt) {
      throw new NotFoundException('Receipt not found for this payment');
    }

    return receipt;
  }
}
