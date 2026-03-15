import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { PAYMENT_REPOSITORY } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import { RECEIPT_GENERATION_SERVICE } from '../../../../receipts/domain/interfaces/receipt-generation.service.interface.js';
import type { IReceiptGenerationService } from '../../../../receipts/domain/interfaces/receipt-generation.service.interface.js';

@Injectable()
export class HandleVindiBillPaidUseCase {
  private readonly logger = new Logger(HandleVindiBillPaidUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
    @Inject(RECEIPT_GENERATION_SERVICE) private receiptGenerationService: IReceiptGenerationService,
  ) {}

  async handleBillPaid(billId: number): Promise<void> {
    const payment = await this.paymentRepository.findPaymentByGatewayTransactionId(String(billId));

    if (!payment) {
      this.logger.warn(`No payment found for Vindi bill ${billId}`);
      return;
    }

    if (payment.status !== 'PENDING') {
      this.logger.log(`Payment ${payment.id} already ${payment.status}, skipping`);
      return;
    }

    const approved = await this.paymentRepository.approvePaymentById(payment.id);

    this.emailService
      .sendPaymentApprovedEmail(
        approved.client.email,
        approved.client.name,
        String(approved.amount),
        approved.appointment.service.name,
        approved.appointment.date.toISOString().slice(0, 10),
      )
      .catch(() => {});

    this.receiptGenerationService.generateReceiptForPayment(payment.id).catch(() => {});

    this.logger.log(`Payment ${payment.id} approved via webhook (bill ${billId})`);
  }
}
