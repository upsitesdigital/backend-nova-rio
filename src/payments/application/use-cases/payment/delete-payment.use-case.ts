import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class DeletePaymentUseCase {
  constructor(@Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository) {}

  async deletePaymentById(id: number): Promise<void> {
    const existing = await this.paymentRepository.findPaymentById(id);

    if (!existing) {
      throw new NotFoundException('Payment not found');
    }

    await this.paymentRepository.softDeletePaymentById(id);
  }
}
