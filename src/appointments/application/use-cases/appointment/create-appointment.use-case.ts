import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
  AppointmentResponse,
  ClientConflictCheckParams,
  ConflictCheckParams,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { CreateAppointmentDto } from '../../../dto/appointment/create-appointment.dto.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import type { IAdminNotificationService } from '../../../../admin-notifications/domain/interfaces/admin-notification.service.interface.js';
import { AdminNotificationEvent } from '../../../../admin-notifications/domain/enums/admin-notification-event.enum.js';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    private schedulingValidator: AppointmentSchedulingValidator,
    @Inject(DiTokens.adminNotificationService)
    private adminNotificationService: IAdminNotificationService,
  ) {}

  async createAppointment(dto: CreateAppointmentDto): Promise<AppointmentResponse> {
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
      clientId: dto.clientId,
      date,
      startTime: dto.startTime,
      duration: dto.duration,
    };

    const appointment = await this.appointmentRepository.createAppointment(
      { ...dto, date },
      conflictCheck,
      clientConflictCheck,
    );

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
