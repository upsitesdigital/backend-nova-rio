import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type {
  AppointmentResponse,
  ClientConflictCheckParams,
  ConflictCheckParams,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { RescheduleAppointmentDto } from '../../../dto/appointment/reschedule-appointment.dto.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';

@Injectable()
export class RescheduleAppointmentUseCase {
  private readonly logger = new Logger(RescheduleAppointmentUseCase.name);

  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
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

    if (existing.status !== 'SCHEDULED') {
      throw new BadRequestException('Only scheduled appointments can be rescheduled');
    }

    const newDate = new Date(dto.date);

    await this.schedulingValidator.validateSchedulingDate(newDate);

    let conflictCheck: ConflictCheckParams | undefined;
    if (existing.employee) {
      conflictCheck = {
        employeeId: existing.employee.id,
        date: newDate,
        startTime: dto.startTime,
        duration: existing.duration,
        excludeId: id,
      };
    }

    const clientConflictCheck: ClientConflictCheckParams = {
      clientId: existing.client.id,
      date: newDate,
      startTime: dto.startTime,
      duration: existing.duration,
      excludeId: id,
    };

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
