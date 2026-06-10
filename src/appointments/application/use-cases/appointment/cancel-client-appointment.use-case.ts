import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IAppointmentRepository } from '../../../domain/interfaces/appointment.repository.interface.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';

@Injectable()
export class CancelClientAppointmentUseCase {
  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    private schedulingValidator: AppointmentSchedulingValidator,
  ) {}

  async cancelAppointmentByIdAndClientId(id: number, clientId: number): Promise<void> {
    const existing = await this.appointmentRepository.findAppointmentByIdAndClientId(id, clientId);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be cancelled');
    }

    this.schedulingValidator.validateCancellationAdvance(existing.date, existing.startTime);

    const cancelled = await this.appointmentRepository.cancelAppointmentById(id);
    if (cancelled === false) {
      throw new BadRequestException('Only scheduled appointments can be cancelled');
    }

    this.emailService
      .sendAppointmentCancelledEmail(
        existing.client.email,
        existing.client.name,
        existing.date.toISOString().slice(0, 10),
        existing.startTime,
        existing.service.name,
      )
      .catch(() => {});
  }
}
