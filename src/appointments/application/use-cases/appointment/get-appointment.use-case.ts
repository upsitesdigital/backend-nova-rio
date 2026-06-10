import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AppointmentResponse,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class GetAppointmentUseCase {
  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
  ) {}

  async getAppointmentById(id: number): Promise<AppointmentResponse> {
    const appointment = await this.appointmentRepository.findAppointmentById(id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }
}
