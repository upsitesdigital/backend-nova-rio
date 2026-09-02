import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IAppointmentRepository } from '../../../domain/interfaces/appointment.repository.interface.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import type { IAdminNotificationService } from '../../../../admin-notifications/domain/interfaces/admin-notification.service.interface.js';
import { AdminNotificationEvent } from '../../../../admin-notifications/domain/enums/admin-notification-event.enum.js';

@Injectable()
export class CancelClientAppointmentUseCase {
  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    private schedulingValidator: AppointmentSchedulingValidator,
    @Inject(DiTokens.adminNotificationService)
    private adminNotificationService: IAdminNotificationService,
  ) {}

  async cancelAppointmentByIdAndClientId(id: number, clientId: number): Promise<void> {
    const existing = await this.appointmentRepository.findAppointmentByIdAndClientId(id, clientId);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be cancelled');
    }

    if (existing.payment?.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException('Only appointments with an approved payment can be cancelled');
    }

    this.schedulingValidator.validateCancellationAdvance(existing.date, existing.startTime);

    const cancelled = await this.appointmentRepository.cancelAppointmentById(id, clientId);
    if (cancelled === false) {
      throw new BadRequestException('Only scheduled appointments can be cancelled');
    }

    const date = existing.date.toISOString().slice(0, 10);

    this.emailService
      .sendAppointmentCancelledEmail(
        existing.client.email,
        existing.client.name,
        date,
        existing.startTime,
        existing.service.name,
      )
      .catch(() => {});

    void this.adminNotificationService.dispatch({
      event: AdminNotificationEvent.APPOINTMENT_CANCELLED,
      data: {
        clientName: existing.client.name,
        serviceName: existing.service.name,
        date,
        time: existing.startTime,
      },
    });
  }
}
