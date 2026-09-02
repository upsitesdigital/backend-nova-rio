import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { IAppointmentRepository } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IPaymentGatewayService } from '../../../../payment-gateway/domain/interfaces/payment-gateway.service.interface.js';
import type {
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';
import type { IAdminNotificationService } from '../../../../admin-notifications/domain/interfaces/admin-notification.service.interface.js';
import { AdminNotificationEvent } from '../../../../admin-notifications/domain/enums/admin-notification-event.enum.js';

const adminCancellationReason = 'Cancelado pelo administrador';

@Injectable()
export class CancelPaymentUseCase {
  private readonly logger = new Logger(CancelPaymentUseCase.name);

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.paymentGatewayService) private paymentGatewayService: IPaymentGatewayService,
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    @Inject(DiTokens.adminNotificationService)
    private adminNotificationService: IAdminNotificationService,
  ) {}

  async cancelPaymentById(id: number): Promise<PaymentResponse> {
    const existing = await this.paymentRepository.findPaymentById(id);

    if (!existing) {
      throw new NotFoundException('Payment not found');
    }

    if (existing.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    // Cancel at the gateway first: leaving the bill open keeps Vindi retrying the
    // charge and emailing the client, even though our status says CANCELLED.
    if (existing.gatewayTransactionId) {
      await this.paymentGatewayService.cancelGatewayBillById(Number(existing.gatewayTransactionId));
    }

    const cancelled = await this.paymentRepository.cancelPaymentById(id, adminCancellationReason);

    if (!cancelled) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    // Release the slot: a cancelled payment must not leave a live appointment.
    const appointmentCancelled = await this.appointmentRepository.cancelAppointmentById(
      cancelled.appointment.id,
    );

    if (!appointmentCancelled) {
      this.logger.warn(
        `Appointment ${cancelled.appointment.id} could not be cancelled after payment ${id} cancellation`,
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

    void this.adminNotificationService.dispatch({
      event: AdminNotificationEvent.PAYMENT_CANCELLED,
      data: {
        clientName: cancelled.client.name,
        serviceName: cancelled.appointment.service.name,
        amount: String(cancelled.amount),
      },
    });

    this.logger.log(`Payment ${id} cancelled by admin (bill ${existing.gatewayTransactionId})`);

    return cancelled;
  }
}
