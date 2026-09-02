import { Inject, Injectable, Logger } from '@nestjs/common';
import { DiTokens } from '../../../shared/di/di-tokens.js';
import { AdminNotificationEvent } from '../../domain/enums/admin-notification-event.enum.js';
import type { IAdminNotificationSettingRepository } from '../../domain/interfaces/admin-notification-setting.repository.interface.js';
import type {
  AdminNotificationPayload,
  IAdminNotificationService,
} from '../../domain/interfaces/admin-notification.service.interface.js';
import type { IEmailService } from '../../../email/domain/interfaces/email.service.interface.js';

@Injectable()
export class AdminNotificationService implements IAdminNotificationService {
  private readonly logger = new Logger(AdminNotificationService.name);

  constructor(
    @Inject(DiTokens.adminNotificationSettingRepository)
    private settingRepository: IAdminNotificationSettingRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async dispatch(notification: AdminNotificationPayload): Promise<void> {
    const recipients = await this.settingRepository.findEmailsByEvent(notification.event);
    if (recipients.length === 0) return;

    const sends = recipients.map((email) => this.sendToRecipient(email, notification));
    await Promise.allSettled(sends);
  }

  private async sendToRecipient(to: string, notification: AdminNotificationPayload): Promise<void> {
    try {
      switch (notification.event) {
        case AdminNotificationEvent.NEW_CLIENT:
          await this.emailService.sendAdminNewClientEmail(
            to,
            notification.data.clientName,
            notification.data.clientEmail,
          );
          break;
        case AdminNotificationEvent.NEW_APPOINTMENT:
          await this.emailService.sendAdminNewAppointmentEmail(
            to,
            notification.data.clientName,
            notification.data.serviceName,
            notification.data.date,
            notification.data.time,
          );
          break;
        case AdminNotificationEvent.APPOINTMENT_CANCELLED:
          await this.emailService.sendAdminAppointmentCancelledEmail(
            to,
            notification.data.clientName,
            notification.data.serviceName,
            notification.data.date,
            notification.data.time,
          );
          break;
        case AdminNotificationEvent.APPOINTMENT_RESCHEDULED:
          await this.emailService.sendAdminAppointmentRescheduledEmail(
            to,
            notification.data.clientName,
            notification.data.serviceName,
            notification.data.oldDate,
            notification.data.oldTime,
            notification.data.newDate,
            notification.data.newTime,
          );
          break;
        case AdminNotificationEvent.PAYMENT_RECEIVED:
          await this.emailService.sendAdminPaymentReceivedEmail(
            to,
            notification.data.clientName,
            notification.data.serviceName,
            notification.data.amount,
            notification.data.date,
          );
          break;
        case AdminNotificationEvent.PAYMENT_CANCELLED:
          await this.emailService.sendAdminPaymentCancelledEmail(
            to,
            notification.data.clientName,
            notification.data.serviceName,
            notification.data.amount,
          );
          break;
        case AdminNotificationEvent.ACCOUNT_DELETED:
          await this.emailService.sendAdminAccountDeletedEmail(
            to,
            notification.data.clientName,
            notification.data.clientEmail,
          );
          break;
      }
    } catch (err) {
      this.logger.error(`Failed to send admin notification (${notification.event}) to ${to}`, err);
    }
  }
}
