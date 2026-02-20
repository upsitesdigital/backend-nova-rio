import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type {
  AppointmentResponse,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class GetClientAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
  ) {}

  async getAppointmentByIdAndClientId(id: number, clientId: number): Promise<AppointmentResponse> {
    const appointment = await this.appointmentRepository.findAppointmentByIdAndClientId(
      id,
      clientId,
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }
}
