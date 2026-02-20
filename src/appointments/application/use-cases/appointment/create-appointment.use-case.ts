import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type {
  AppointmentResponse,
  ConflictCheckParams,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { CreateAppointmentDto } from '../../../dto/appointment/create-appointment.dto.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
    private schedulingValidator: AppointmentSchedulingValidator,
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

    return this.appointmentRepository.createAppointment({ ...dto, date }, conflictCheck);
  }
}
