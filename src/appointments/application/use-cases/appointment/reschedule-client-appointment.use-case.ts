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

    // date/startTime are optional: when omitted the appointment keeps its current slot,
    // so this endpoint also handles address/recurrence-only edits from the service drawer.
    const isReschedule = dto.date !== undefined || dto.startTime !== undefined;
    const newDate = dto.date ? new Date(dto.date) : existing.date;
    const newStartTime = dto.startTime ?? existing.startTime;

    await this.schedulingValidator.validateSchedulingDate(newDate);

    const conflictCheck = AppointmentSchedulingValidator.buildRescheduleConflictCheck(
      existing,
      newDate,
      newStartTime,
    );

    const clientConflictCheck = AppointmentSchedulingValidator.buildRescheduleClientConflictCheck(
      existing,
      clientId,
      newDate,
      newStartTime,
    );

    const rescheduled = await this.appointmentRepository.rescheduleAppointment(
      id,
      {
        date: newDate,
        startTime: newStartTime,
        recurrenceType: dto.recurrenceType,
        locationZip: dto.locationZip,
        locationAddress: dto.locationAddress,
      },
      conflictCheck,
      clientConflictCheck,
      clientId,
    );

    if (rescheduled === null) {
      throw new BadRequestException('Only scheduled appointments can be rescheduled');
    }

    // Only notify the client when the actual slot changed, not on address/recurrence edits.
    if (isReschedule) {
      this.emailService
        .sendAppointmentRescheduledEmail(
          existing.client.email,
          existing.client.name,
          newDate.toISOString().slice(0, 10),
          newStartTime,
          existing.service.name,
        )
        .catch((err) => this.logger.error('Failed to send reschedule email', err));
    }

    return rescheduled;
  }
}
