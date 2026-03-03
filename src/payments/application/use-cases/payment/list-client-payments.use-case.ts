import { Inject, Injectable } from '@nestjs/common';
import type { PaymentStatus } from '@prisma/client';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import type {
  IPaymentRepository,
  PaginatedPayments,
} from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class ListClientPaymentsUseCase {
  constructor(@Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository) {}

  async listPaymentsByClientId(
    clientId: number,
    page: number,
    limit: number,
    status?: PaymentStatus,
  ): Promise<PaginatedPayments> {
    return this.paymentRepository.listPaymentsByClientId(clientId, page, limit, status);
  }
}
