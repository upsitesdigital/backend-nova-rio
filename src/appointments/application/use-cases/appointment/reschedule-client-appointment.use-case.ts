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
export class RescheduleClientAppointmentUseCase {
  private readonly logger = new Logger(RescheduleClientAppointmentUseCase.name);

  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    private schedulingValidator: AppointmentSchedulingValidator,
  ) {}

  async rescheduleAppointmentByIdAndClientId(
    id: number,
    clientId: number,
    dto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponse> {
    const existing = await this.appointmentRepository.findAppointmentByIdAndClientId(id, clientId);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be rescheduled');
    }

    this.schedulingValidator.validateCancellationAdvance(existing.date, existing.startTime);

    const newDate = new Date(dto.date);

    await this.schedulingValidator.validateSchedulingDate(newDate);

    const conflictCheck = AppointmentSchedulingValidator.buildRescheduleConflictCheck(
      existing,
      newDate,
      dto.startTime,
    );

    const clientConflictCheck = AppointmentSchedulingValidator.buildRescheduleClientConflictCheck(
      existing,
      clientId,
      newDate,
      dto.startTime,
    );

    const rescheduled = await this.appointmentRepository.rescheduleAppointment(
      id,
      { date: newDate, startTime: dto.startTime },
      conflictCheck,
      clientConflictCheck,
      clientId,
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
