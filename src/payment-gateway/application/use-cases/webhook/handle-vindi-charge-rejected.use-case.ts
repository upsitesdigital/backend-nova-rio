import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { PAYMENT_REPOSITORY } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';

@Injectable()
export class HandleVindiChargeRejectedUseCase {
  private readonly logger = new Logger(HandleVindiChargeRejectedUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async handleChargeRejected(billId: number, reason: string): Promise<void> {
    const payment = await this.paymentRepository.findPaymentByGatewayTransactionId(String(billId));

    if (!payment) {
      this.logger.warn(`No payment found for Vindi bill ${billId}`);
      return;
    }

    if (payment.status !== 'PENDING') {
      this.logger.log(`Payment ${payment.id} already ${payment.status}, skipping`);
      return;
    }

    const cancelled = await this.paymentRepository.cancelPaymentById(payment.id, reason);
    if (!cancelled) {
      this.logger.log(`Payment ${payment.id} changed before webhook cancellation, skipping`);
      return;
    }

    this.emailService
      .sendPaymentCancelledEmail(
        cancelled.client.email,
        cancelled.client.name,
        String(cancelled.amount),
        cancelled.appointment.service.name,
      )
      .catch(() => {});

    this.logger.log(`Payment ${payment.id} cancelled via webhook (bill ${billId}): ${reason}`);
  }
}
