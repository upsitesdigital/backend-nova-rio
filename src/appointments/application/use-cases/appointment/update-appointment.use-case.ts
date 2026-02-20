import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type {
  AppointmentResponse,
  ConflictCheckParams,
  IAppointmentRepository,
  UpdateAppointmentData,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { UpdateAppointmentDto } from '../../../dto/appointment/update-appointment.dto.js';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
    private schedulingValidator: AppointmentSchedulingValidator,
  ) {}

  async updateAppointmentById(id: number, dto: UpdateAppointmentDto): Promise<AppointmentResponse> {
    const existing = await this.appointmentRepository.findAppointmentById(id);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    const data: UpdateAppointmentData = {
      startTime: dto.startTime,
      duration: dto.duration,
      recurrenceType: dto.recurrenceType,
      locationZip: dto.locationZip,
      locationAddress: dto.locationAddress,
      notes: dto.notes,
      employeeId: dto.employeeId,
      serviceId: dto.serviceId,
      packageId: dto.packageId,
      unitId: dto.unitId,
    };

    if (dto.date) {
      const date = new Date(dto.date);
      await this.schedulingValidator.validateSchedulingDate(date);
      data.date = date;
    }

    const employeeId = dto.employeeId ?? existing.employee?.id;
    const resolvedDate = data.date ?? existing.date;
    const startTime = dto.startTime ?? existing.startTime;
    const duration = dto.duration ?? existing.duration;

    let conflictCheck: ConflictCheckParams | undefined;
    if (employeeId && (dto.date || dto.startTime || dto.duration || dto.employeeId)) {
      conflictCheck = {
        employeeId,
        date: resolvedDate instanceof Date ? resolvedDate : new Date(resolvedDate),
        startTime,
        duration,
        excludeId: id,
      };
    }

    return this.appointmentRepository.updateAppointmentById(id, data, conflictCheck);
  }
}
