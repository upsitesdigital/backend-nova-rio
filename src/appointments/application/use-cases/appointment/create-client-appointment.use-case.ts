import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type {
  AppointmentResponse,
  ClientConflictCheckParams,
  ConflictCheckParams,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { CreateClientAppointmentDto } from '../../../dto/appointment/create-client-appointment.dto.js';
import type { ICreateClientAppointmentService } from '../../../domain/interfaces/create-client-appointment.service.interface.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import type { IAdminNotificationService } from '../../../../admin-notifications/domain/interfaces/admin-notification.service.interface.js';
import { AdminNotificationEvent } from '../../../../admin-notifications/domain/enums/admin-notification-event.enum.js';

@Injectable()
export class CreateClientAppointmentUseCase implements ICreateClientAppointmentService {
  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    private schedulingValidator: AppointmentSchedulingValidator,
    @Inject(DiTokens.adminNotificationService)
    private adminNotificationService: IAdminNotificationService,
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

    void this.adminNotificationService.dispatch({
      event: AdminNotificationEvent.NEW_APPOINTMENT,
      data: {
        clientName: appointment.client.name,
        serviceName: appointment.service.name,
        date: appointment.date.toISOString().slice(0, 10),
        time: appointment.startTime,
      },
    });

    return appointment;
  }
}
