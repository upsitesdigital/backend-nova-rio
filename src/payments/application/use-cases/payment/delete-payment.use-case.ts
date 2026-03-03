import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import type { IPaymentRepository } from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class DeletePaymentUseCase {
  constructor(@Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository) {}

  async deletePaymentById(id: number): Promise<void> {
    const existing = await this.paymentRepository.findPaymentById(id);

    if (!existing) {
      throw new NotFoundException('Payment not found');
    }

    await this.paymentRepository.deletePaymentById(id);
  }
}
