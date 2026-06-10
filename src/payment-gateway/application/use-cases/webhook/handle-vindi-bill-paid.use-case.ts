import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import type { IReceiptGenerationService } from '../../../../receipts/domain/interfaces/receipt-generation.service.interface.js';

@Injectable()
export class HandleVindiBillPaidUseCase {
  private readonly logger = new Logger(HandleVindiBillPaidUseCase.name);

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    @Inject(DiTokens.receiptGenerationService)
    private receiptGenerationService: IReceiptGenerationService,
  ) {}

  async handleBillPaid(billId: number): Promise<void> {
    const payment = await this.paymentRepository.findPaymentByGatewayTransactionId(String(billId));

    if (!payment) {
      this.logger.warn(`No payment found for Vindi bill ${billId}`);
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      this.logger.log(`Payment ${payment.id} already ${payment.status}, skipping`);
      return;
    }

    const approved = await this.paymentRepository.approvePaymentById(payment.id);
    if (!approved) {
      this.logger.log(`Payment ${payment.id} changed before webhook approval, skipping`);
      return;
    }

    this.emailService
      .sendPaymentApprovedEmail(
        approved.client.email,
        approved.client.name,
        String(approved.amount),
        approved.appointment.service.name,
        approved.appointment.date.toISOString().slice(0, 10),
      )
      .catch((err) => this.logger.error('Failed to send payment approved email', err));

    this.receiptGenerationService
      .generateReceiptForPayment(payment.id)
      .catch((err) => this.logger.error('Failed to generate receipt', err));

    this.logger.log(`Payment ${payment.id} approved via webhook (bill ${billId})`);
  }
}
