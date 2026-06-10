import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class GetPaymentUseCase {
  constructor(@Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository) {}

  async getPaymentById(id: number): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findPaymentById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
