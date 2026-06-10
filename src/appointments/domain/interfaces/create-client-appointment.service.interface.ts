import type { CreateClientAppointmentDto } from '../../dto/appointment/create-client-appointment.dto.js';
import type { AppointmentResponse } from './appointment.repository.interface.js';

export interface ICreateClientAppointmentService {
  createClientAppointment(
    clientId: number,
    dto: CreateClientAppointmentDto,
  ): Promise<AppointmentResponse>;
}
