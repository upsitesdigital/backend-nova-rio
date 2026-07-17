import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
  IAppointmentRepository,
  ListAppointmentsFilters,
  PaginatedAppointments,
} from '../../../domain/interfaces/appointment.repository.interface.js';
import type { ListAppointmentsQueryDto } from '../../../dto/appointment/list-appointments-query.dto.js';

@Injectable()
export class ListAppointmentsUseCase {
  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
  ) {}

  async listAppointments(query: ListAppointmentsQueryDto): Promise<PaginatedAppointments> {
    const filters: ListAppointmentsFilters = {
      page: query.page,
      limit: query.limit,
    };

    if (query.date) {
      filters.date = new Date(query.date);
    }
    if (query.weekStart) {
      filters.weekStart = new Date(query.weekStart);
    }
    if (query.weekEnd) {
      filters.weekEnd = new Date(query.weekEnd);
    }
    if (query.employeeId) {
      filters.employeeId = query.employeeId;
    }
    if (query.unitId) {
      filters.unitId = query.unitId;
    }
    if (query.status) {
      filters.status = query.status;
    }

    return this.appointmentRepository.listAppointments(filters);
  }
}
