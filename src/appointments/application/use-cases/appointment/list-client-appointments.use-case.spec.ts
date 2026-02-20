import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import { ListClientAppointmentsUseCase } from './list-client-appointments.use-case.js';

describe('ListClientAppointmentsUseCase', () => {
  let useCase: ListClientAppointmentsUseCase;
  let appointmentRepository: { listAppointmentsByClientId: Mock };

  beforeEach(async () => {
    appointmentRepository = { listAppointmentsByClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListClientAppointmentsUseCase,
        { provide: APPOINTMENT_REPOSITORY, useValue: appointmentRepository },
      ],
    }).compile();

    useCase = module.get<ListClientAppointmentsUseCase>(ListClientAppointmentsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list appointments by clientId with pagination', async () => {
    const paginated = { data: [{ id: 1 }], total: 1, page: 1, limit: 20 };
    appointmentRepository.listAppointmentsByClientId.mockResolvedValue(paginated);

    const result = await useCase.listAppointmentsByClientId(1, 1, 20);

    expect(result).toEqual(paginated);
    expect(appointmentRepository.listAppointmentsByClientId).toHaveBeenCalledWith(1, 1, 20);
  });
});
