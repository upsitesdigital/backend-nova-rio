import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import type {
  IAppointmentRepository,
  PaginatedAppointments,
} from '../../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class ListClientAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
  ) {}

  async listAppointmentsByClientId(
    clientId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedAppointments> {
    return this.appointmentRepository.listAppointmentsByClientId(clientId, page, limit);
  }
}
