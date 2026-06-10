import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IReceiptGenerationService } from '../../../../receipts/domain/interfaces/receipt-generation.service.interface.js';
import type {
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class ApprovePaymentUseCase {
  private readonly logger = new Logger(ApprovePaymentUseCase.name);

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    @Inject(DiTokens.receiptGenerationService)
    private receiptGenerationService: IReceiptGenerationService,
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

    this.emailService
      .sendPaymentApprovedEmail(
        payment.client.email,
        payment.client.name,
        String(payment.amount),
        payment.appointment.service.name,
        payment.appointment.date.toISOString().slice(0, 10),
      )
      .catch((err) => this.logger.error('Failed to send payment approved email', err));

    this.receiptGenerationService
      .generateReceiptForPayment(payment.id)
      .catch((err) => this.logger.error('Failed to generate receipt', err));

    return payment;
  }
}
