import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
  IAppointmentRepository,
  PaginatedAppointments,
} from '../../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class ListClientAppointmentsUseCase {
  private readonly maxLimit = 100;

  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
  ) {}

  async listAppointmentsByClientId(
    clientId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedAppointments> {
    const cappedLimit = Math.min(limit, this.maxLimit);
    return this.appointmentRepository.listAppointmentsByClientId(clientId, page, cappedLimit);
  }
}
