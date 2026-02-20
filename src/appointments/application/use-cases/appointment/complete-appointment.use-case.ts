import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type {
  AppointmentResponse,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
  ) {}

  async completeAppointmentById(id: number): Promise<AppointmentResponse> {
    const existing = await this.appointmentRepository.findAppointmentById(id);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== 'SCHEDULED') {
      throw new BadRequestException('Only scheduled appointments can be completed');
    }

    return this.appointmentRepository.completeAppointmentById(id);
  }
}
