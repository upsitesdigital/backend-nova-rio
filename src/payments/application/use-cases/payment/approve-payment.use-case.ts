import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { GenerateReceiptUseCase } from '../../../../receipts/application/use-cases/receipt/generate-receipt.use-case.js';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import type {
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';

@Injectable()
export class ApprovePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
    private generateReceiptUseCase: GenerateReceiptUseCase,
  ) {}

  async approvePaymentById(id: number): Promise<PaymentResponse> {
    const existing = await this.paymentRepository.findPaymentById(id);

    if (!existing) {
      throw new NotFoundException('Payment not found');
    }

    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending payments can be approved');
    }

    const payment = await this.paymentRepository.approvePaymentById(id);

    this.emailService
      .sendPaymentApprovedEmail(
        payment.client.email,
        payment.client.name,
        String(payment.amount),
        payment.appointment.service.name,
        payment.appointment.date.toISOString().slice(0, 10),
      )
      .catch(() => {});

    this.generateReceiptUseCase.generateReceiptForPayment(payment.id).catch(() => {});

    return payment;
  }
}
