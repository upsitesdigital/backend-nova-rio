import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IReceiptGenerationService } from '../../../../receipts/domain/interfaces/receipt-generation.service.interface.js';
import type {
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';
import type { IAdminNotificationService } from '../../../../admin-notifications/domain/interfaces/admin-notification.service.interface.js';
import { AdminNotificationEvent } from '../../../../admin-notifications/domain/enums/admin-notification-event.enum.js';

@Injectable()
export class ApprovePaymentUseCase {
  private readonly logger = new Logger(ApprovePaymentUseCase.name);

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    @Inject(DiTokens.receiptGenerationService)
    private receiptGenerationService: IReceiptGenerationService,
    @Inject(DiTokens.adminNotificationService)
    private adminNotificationService: IAdminNotificationService,
  ) {}

  async approvePaymentById(id: number): Promise<PaymentResponse> {
    const existing = await this.paymentRepository.findPaymentById(id);

    if (!existing) {
      throw new NotFoundException('Payment not found');
    }

    if (existing.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be approved');
    }

    const payment = await this.paymentRepository.approvePaymentById(id);
    if (!payment) {
      throw new BadRequestException('Only pending payments can be approved');
    }

    const date = payment.appointment.date.toISOString().slice(0, 10);

    this.emailService
      .sendPaymentApprovedEmail(
        payment.client.email,
        payment.client.name,
        String(payment.amount),
        payment.appointment.service.name,
        date,
      )
      .catch((err) => this.logger.error('Failed to send payment approved email', err));

    this.receiptGenerationService
      .generateReceiptForPayment(payment.id)
      .catch((err) => this.logger.error('Failed to generate receipt', err));

    void this.adminNotificationService.dispatch({
      event: AdminNotificationEvent.PAYMENT_RECEIVED,
      data: {
        clientName: payment.client.name,
        serviceName: payment.appointment.service.name,
        amount: String(payment.amount),
        date,
      },
    });

    return payment;
  }
}
