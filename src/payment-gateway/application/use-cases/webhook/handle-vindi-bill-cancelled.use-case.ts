import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { IAppointmentRepository } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';

@Injectable()
export class HandleVindiBillCancelledUseCase {
  private readonly logger = new Logger(HandleVindiBillCancelledUseCase.name);

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async handleBillCancelled(billId: number, reason: string): Promise<void> {
    const payment = await this.paymentRepository.findPaymentByGatewayTransactionId(String(billId));

    if (!payment) {
      this.logger.warn(`No payment found for Vindi bill ${billId}`);
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      this.logger.log(`Payment ${payment.id} already ${payment.status}, skipping`);
      return;
    }

    const cancelled = await this.paymentRepository.cancelPaymentById(payment.id, reason);
    if (!cancelled) {
      this.logger.log(`Payment ${payment.id} changed before webhook cancellation, skipping`);
      return;
    }

    // Release the slot: a cancelled payment must not leave a live appointment.
    const appointmentCancelled = await this.appointmentRepository.cancelAppointmentById(
      cancelled.appointment.id,
    );
    if (!appointmentCancelled) {
      this.logger.warn(
        `Appointment ${cancelled.appointment.id} could not be cancelled after payment ${payment.id} cancellation`,
      );
    }

    this.emailService
      .sendPaymentCancelledEmail(
        cancelled.client.email,
        cancelled.client.name,
        String(cancelled.amount),
        cancelled.appointment.service.name,
      )
      .catch((err) => this.logger.error('Failed to send payment cancelled email', err));

    this.logger.log(`Payment ${payment.id} cancelled (bill ${billId}): ${reason}`);
  }
}
