import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type { IAppointmentRepository } from '../../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async cancelAppointmentById(id: number): Promise<void> {
    const existing = await this.appointmentRepository.findAppointmentById(id);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== 'SCHEDULED') {
      throw new BadRequestException('Only scheduled appointments can be cancelled');
    }

    await this.appointmentRepository.cancelAppointmentById(id);

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
