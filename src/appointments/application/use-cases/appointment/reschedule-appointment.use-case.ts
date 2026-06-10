import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type {
  AppointmentResponse,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { RescheduleAppointmentDto } from '../../../dto/appointment/reschedule-appointment.dto.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';

@Injectable()
export class RescheduleAppointmentUseCase {
  private readonly logger = new Logger(RescheduleAppointmentUseCase.name);

  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    private schedulingValidator: AppointmentSchedulingValidator,
  ) {}

  async rescheduleAppointmentById(
    id: number,
    dto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponse> {
    const existing = await this.appointmentRepository.findAppointmentById(id);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be rescheduled');
    }

    const newDate = new Date(dto.date);

    await this.schedulingValidator.validateSchedulingDate(newDate);

    const conflictCheck = AppointmentSchedulingValidator.buildRescheduleConflictCheck(
      existing,
      newDate,
      dto.startTime,
    );

    const clientConflictCheck = AppointmentSchedulingValidator.buildRescheduleClientConflictCheck(
      existing,
      existing.client.id,
      newDate,
      dto.startTime,
    );

    const rescheduled = await this.appointmentRepository.rescheduleAppointment(
      id,
      { date: newDate, startTime: dto.startTime },
      conflictCheck,
      clientConflictCheck,
    );

    if (rescheduled === null) {
      throw new BadRequestException('Only scheduled appointments can be rescheduled');
    }

    this.emailService
      .sendAppointmentRescheduledEmail(
        existing.client.email,
        existing.client.name,
        dto.date,
        dto.startTime,
        existing.service.name,
      )
      .catch((err) => this.logger.error('Failed to send reschedule email', err));

    return rescheduled;
  }
}
