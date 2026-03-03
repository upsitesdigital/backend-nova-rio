import { Inject, Injectable } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import type {
  IPaymentRepository,
  ListPaymentsFilters,
  PaginatedPayments,
} from '../../../domain/interfaces/payment.repository.interface.js';
import type { ListPaymentsQueryDto } from '../../../dto/payment/list-payments-query.dto.js';

@Injectable()
export class ListPaymentsUseCase {
  constructor(@Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository) {}

  async listPayments(query: ListPaymentsQueryDto): Promise<PaginatedPayments> {
    const filters: ListPaymentsFilters = {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };

    if (query.status) filters.status = query.status;
    if (query.method) filters.method = query.method;
    if (query.clientId) filters.clientId = query.clientId;
    if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom);
    if (query.dateTo) filters.dateTo = new Date(query.dateTo);

    return this.paymentRepository.listPayments(filters);
  }
}
