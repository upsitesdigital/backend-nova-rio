import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AppointmentSchedulingValidator } from '../../validators/appointment-scheduling.validator.js';
import { UpdateAppointmentUseCase } from './update-appointment.use-case.js';

describe('UpdateAppointmentUseCase', () => {
  let useCase: UpdateAppointmentUseCase;
  let appointmentRepository: { findAppointmentById: Mock; updateAppointmentById: Mock };
  let schedulingValidator: { validateSchedulingDate: Mock };

  const existingAppointment = {
    id: 1,
    date: new Date('2026-03-16'),
    startTime: '09:00',
    duration: 120,
    status: 'SCHEDULED',
    employee: { id: 1, name: 'Employee' },
    service: { id: 1, name: 'Service' },
    client: { id: 1, name: 'Client', email: 'c@t.com' },
    package: null,
    unit: null,
  };

  beforeEach(async () => {
    appointmentRepository = {
      findAppointmentById: vi.fn(),
      updateAppointmentById: vi.fn(),
    };
    schedulingValidator = { validateSchedulingDate: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAppointmentUseCase,
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
        { provide: AppointmentSchedulingValidator, useValue: schedulingValidator },
      ],
    }).compile();

    useCase = module.get<UpdateAppointmentUseCase>(UpdateAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when not found', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(null);

    await expect(useCase.updateAppointmentById(1, { notes: 'test' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update appointment', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(existingAppointment);
    appointmentRepository.updateAppointmentById.mockResolvedValue({
      ...existingAppointment,
      notes: 'updated',
    });

    const result = await useCase.updateAppointmentById(1, { notes: 'updated' });

    expect(result.notes).toBe('updated');
  });

  it('should validate date when changed', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(existingAppointment);
    appointmentRepository.updateAppointmentById.mockResolvedValue(existingAppointment);

    await useCase.updateAppointmentById(1, { date: '2026-03-17' });

    expect(schedulingValidator.validateSchedulingDate).toHaveBeenCalled();
  });

  it('should pass conflictCheck when time-related fields change', async () => {
    appointmentRepository.findAppointmentById.mockResolvedValue(existingAppointment);
    appointmentRepository.updateAppointmentById.mockResolvedValue(existingAppointment);

    await useCase.updateAppointmentById(1, { startTime: '10:00' });

    expect(appointmentRepository.updateAppointmentById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ startTime: '10:00' }),
      expect.objectContaining({
        employeeId: 1,
        startTime: '10:00',
        excludeId: 1,
      }),
    );
  });
});
