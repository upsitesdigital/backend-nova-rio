import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import type { IReceiptGenerationService } from '../../../domain/interfaces/receipt-generation.service.interface.js';
import type {
  IReceiptRepository,
  ReceiptResponse,
} from '../../../domain/interfaces/receipt.repository.interface.js';

@Injectable()
export class GetReceiptUseCase {
  constructor(
    @Inject(DiTokens.receiptRepository) private receiptRepository: IReceiptRepository,
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.receiptGenerationService)
    private receiptGenerationService: IReceiptGenerationService,
  ) {}

  async getReceiptByPaymentId(paymentId: number): Promise<ReceiptResponse> {
    const receipt = await this.receiptRepository.findReceiptByPaymentId(paymentId);

    if (receipt) {
      return receipt;
    }

    const payment = await this.paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'APPROVED') {
      throw new NotFoundException('Receipt available only for approved payments');
    }

    return this.receiptGenerationService.generateReceiptForPayment(paymentId);
  }
}
