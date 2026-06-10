import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class GetClientPaymentUseCase {
  constructor(@Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository) {}

  async getPaymentByIdAndClientId(id: number, clientId: number): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findPaymentByIdAndClientId(id, clientId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
