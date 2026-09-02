import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import type { IClientProfileRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IAppointmentRepository } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import type { ICardRepository } from '../../../../cards/domain/interfaces/card.repository.interface.js';
import type { IAdminNotificationService } from '../../../../admin-notifications/domain/interfaces/admin-notification.service.interface.js';
import { AdminNotificationEvent } from '../../../../admin-notifications/domain/enums/admin-notification-event.enum.js';

@Injectable()
export class DeleteClientAccountUseCase {
  private readonly logger = new Logger(DeleteClientAccountUseCase.name);

  constructor(
    @Inject(DiTokens.clientProfileRepository) private clientRepository: IClientProfileRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.cardRepository) private cardRepository: ICardRepository,
    @Inject(DiTokens.adminNotificationService)
    private adminNotificationService: IAdminNotificationService,
  ) {}

  async deleteClientAccount(clientId: number) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Cancel all future scheduled appointments
    const futureAppointments = await this.appointmentRepository.listAppointmentsByClientId(
      clientId,
      1,
      1000,
    );
    for (const apt of futureAppointments.data) {
      if (apt.status === AppointmentStatus.SCHEDULED) {
        await this.appointmentRepository.cancelAppointmentById(apt.id, clientId);
      }
    }

    // Cancel all pending payments
    const pendingPayments = await this.paymentRepository.listPaymentsByClientId(
      clientId,
      1,
      1000,
      PaymentStatus.PENDING,
    );
    for (const payment of pendingPayments.data) {
      await this.paymentRepository.cancelPaymentById(payment.id, 'Account deleted');
    }

    // Remove all saved cards
    const cards = await this.cardRepository.findCardsByClientId(clientId);
    for (const card of cards) {
      await this.cardRepository.deleteCardByIdAndClientId(card.id, clientId);
    }

    await this.clientRepository.deactivateClient(clientId);

    void this.emailService.sendAccountDeletedEmail(client.email, client.name);

    void this.adminNotificationService.dispatch({
      event: AdminNotificationEvent.ACCOUNT_DELETED,
      data: { clientName: client.name, clientEmail: client.email },
    });

    this.logger.log(`Client ${clientId} (${client.email}) account deleted`);

    return { message: 'Account deleted successfully' };
  }
}
