import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type {
  AppointmentResponse,
  ClientConflictCheckParams,
  ConflictCheckParams,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { CreateClientAppointmentDto } from '../../../dto/appointment/create-client-appointment.dto.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';

@Injectable()
export class CreateClientAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
    private schedulingValidator: AppointmentSchedulingValidator,
  ) {}

  async createClientAppointment(
    clientId: number,
    dto: CreateClientAppointmentDto,
  ): Promise<AppointmentResponse> {
    const date = new Date(dto.date);

    await this.schedulingValidator.validateSchedulingDate(date);

    let conflictCheck: ConflictCheckParams | undefined;
    if (dto.employeeId) {
      conflictCheck = {
        employeeId: dto.employeeId,
        date,
        startTime: dto.startTime,
        duration: dto.duration,
      };
    }

    const clientConflictCheck: ClientConflictCheckParams = {
      clientId,
      date,
      startTime: dto.startTime,
      duration: dto.duration,
    };

    const appointment = await this.appointmentRepository.createAppointment(
      { ...dto, date, clientId },
      conflictCheck,
      clientConflictCheck,
    );

    this.emailService
      .sendAppointmentConfirmedEmail(
        appointment.client.email,
        appointment.client.name,
        dto.date,
        dto.startTime,
        appointment.service.name,
      )
      .catch(() => {});

    return appointment;
  }
}
