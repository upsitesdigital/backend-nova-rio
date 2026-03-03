import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import type {
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class GetPaymentUseCase {
  constructor(@Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository) {}

  async getPaymentById(id: number): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findPaymentById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
