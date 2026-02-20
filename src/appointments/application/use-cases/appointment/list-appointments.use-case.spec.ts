import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentStatus } from '@prisma/client';
import { type Mock, vi } from 'vitest';
import { APPOINTMENT_REPOSITORY } from '../../../domain/interfaces/appointment.repository.interface.js';
import { ListAppointmentsUseCase } from './list-appointments.use-case.js';

describe('ListAppointmentsUseCase', () => {
  let useCase: ListAppointmentsUseCase;
  let appointmentRepository: { listAppointments: Mock };

  beforeEach(async () => {
    appointmentRepository = { listAppointments: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAppointmentsUseCase,
        { provide: APPOINTMENT_REPOSITORY, useValue: appointmentRepository },
      ],
    }).compile();

    useCase = module.get<ListAppointmentsUseCase>(ListAppointmentsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list appointments with filters and pagination', async () => {
    const paginated = { data: [{ id: 1 }], total: 1, page: 1, limit: 20 };
    appointmentRepository.listAppointments.mockResolvedValue(paginated);

    const result = await useCase.listAppointments({ status: AppointmentStatus.SCHEDULED });

    expect(result).toEqual(paginated);
    expect(appointmentRepository.listAppointments).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20, status: AppointmentStatus.SCHEDULED }),
    );
  });
});
