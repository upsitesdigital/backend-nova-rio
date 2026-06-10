import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { PaymentStatus } from '@prisma/client';
import type {
  IPaymentRepository,
  PaginatedPayments,
} from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class ListClientPaymentsUseCase {
  constructor(@Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository) {}

  async listPaymentsByClientId(
    clientId: number,
    page: number,
    limit: number,
    status?: PaymentStatus,
  ): Promise<PaginatedPayments> {
    return this.paymentRepository.listPaymentsByClientId(clientId, page, limit, status);
  }
}
