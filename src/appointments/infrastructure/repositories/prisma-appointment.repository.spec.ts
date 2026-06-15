import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { AppointmentConflictValidator } from '../../application/validators/appointment-conflict.validator.js';
import { PrismaAppointmentRepository } from './prisma-appointment.repository.js';

describe('PrismaAppointmentRepository', () => {
  let repository: PrismaAppointmentRepository;
  let prisma: {
    appointment: {
      create: Mock;
      findMany: Mock;
      findUnique: Mock;
      findFirst: Mock;
      update: Mock;
      updateMany: Mock;
      count: Mock;
    };
    $transaction: Mock;
    $queryRaw: Mock;
  };

  const mockAppointment = {
    id: 1,
    uuid: 'uuid-123',
    date: new Date('2026-03-15'),
    startTime: '09:00',
    duration: 120,
    status: 'SCHEDULED',
    recurrenceType: 'SINGLE',
    locationZip: null,
    locationAddress: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    client: { id: 1, name: 'João', email: 'joao@test.com' },
    service: { id: 1, name: 'Faxina Regular' },
    employee: null,
    package: null,
    unit: null,
  };

  beforeEach(async () => {
    prisma = {
      appointment: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        count: vi.fn(),
      },
      $transaction: vi.fn(),
      $queryRaw: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAppointmentRepository,
        { provide: PrismaService, useValue: prisma },
        { provide: AppointmentConflictValidator, useValue: { assertNoTimeConflict: vi.fn() } },
      ],
    }).compile();

    repository = module.get<PrismaAppointmentRepository>(PrismaAppointmentRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createAppointment without conflictCheck should call prisma.appointment.create', async () => {
    prisma.appointment.create.mockResolvedValue(mockAppointment);

    const result = await repository.createAppointment({
      date: new Date('2026-03-15'),
      startTime: '09:00',
      duration: 120,
      clientId: 1,
      serviceId: 1,
    });

    expect(result).toEqual(mockAppointment);
    expect(prisma.appointment.create).toHaveBeenCalled();
  });

  it('createAppointment with conflictCheck should use transaction', async () => {
    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      return fn({ ...prisma, $queryRaw: vi.fn().mockResolvedValue([]) });
    });
    prisma.appointment.create.mockResolvedValue(mockAppointment);

    const result = await repository.createAppointment(
      {
        date: new Date('2026-03-15'),
        startTime: '09:00',
        duration: 120,
        clientId: 1,
        serviceId: 1,
      },
      {
        employeeId: 1,
        date: new Date('2026-03-15'),
        startTime: '09:00',
        duration: 120,
      },
    );

    expect(result).toEqual(mockAppointment);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('listAppointments should return paginated results', async () => {
    prisma.appointment.findMany.mockResolvedValue([mockAppointment]);
    prisma.appointment.count.mockResolvedValue(1);

    const result = await repository.listAppointments({ status: 'SCHEDULED', page: 1, limit: 20 });

    expect(result).toEqual({ data: [mockAppointment], total: 1, page: 1, limit: 20 });
    expect(prisma.appointment.findMany).toHaveBeenCalled();
    expect(prisma.appointment.count).toHaveBeenCalled();
  });

  it('listAppointmentsByClientId should return paginated results', async () => {
    prisma.appointment.findMany.mockResolvedValue([mockAppointment]);
    prisma.appointment.count.mockResolvedValue(1);

    const result = await repository.listAppointmentsByClientId(1, 1, 20);

    expect(result).toEqual({ data: [mockAppointment], total: 1, page: 1, limit: 20 });
    expect(prisma.appointment.findMany).toHaveBeenCalled();
  });

  it('findAppointmentById should call prisma.appointment.findUnique', async () => {
    prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    const result = await repository.findAppointmentById(1);

    expect(result).toEqual(mockAppointment);
    expect(prisma.appointment.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });

  it('findAppointmentByIdAndClientId should call prisma.appointment.findFirst', async () => {
    prisma.appointment.findFirst.mockResolvedValue(mockAppointment);

    const result = await repository.findAppointmentByIdAndClientId(1, 1);

    expect(result).toEqual(mockAppointment);
    expect(prisma.appointment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1, clientId: 1 } }),
    );
  });

  it('cancelAppointmentById should set status to CANCELLED', async () => {
    await repository.cancelAppointmentById(1);

    expect(prisma.appointment.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: 'SCHEDULED' },
      data: { status: 'CANCELLED' },
    });
  });

  it('cancelAppointmentById should scope cancellation to the owner when clientId is provided', async () => {
    await repository.cancelAppointmentById(1, 7);

    expect(prisma.appointment.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: 'SCHEDULED', clientId: 7 },
      data: { status: 'CANCELLED' },
    });
  });

  it('completeAppointmentById should set status to COMPLETED', async () => {
    prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    await repository.completeAppointmentById(1);

    expect(prisma.appointment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1, status: 'SCHEDULED' },
        data: { status: 'COMPLETED' },
      }),
    );
  });

  it('rescheduleAppointment should update existing appointment in place', async () => {
    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      return fn(prisma);
    });
    prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    const result = await repository.rescheduleAppointment(
      1,
      {
        date: new Date('2026-03-20'),
        startTime: '10:00',
      },
      undefined,
      undefined,
      9,
    );

    expect(result).toEqual(mockAppointment);
    expect(prisma.appointment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1, status: 'SCHEDULED', clientId: 9 },
        data: { date: expect.any(Date) as Date, startTime: '10:00' },
      }),
    );
    expect(prisma.appointment.create).not.toHaveBeenCalled();
  });

  it('createAppointment should translate unique slot conflicts into BadRequestException', async () => {
    prisma.appointment.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['appointments_employee_scheduled_slot'] },
      }),
    );

    await expect(
      repository.createAppointment({
        date: new Date('2026-03-15'),
        startTime: '09:00',
        duration: 120,
        clientId: 1,
        serviceId: 1,
      }),
    ).rejects.toThrow(new BadRequestException('Appointment time is no longer available'));
  });

  it('rescheduleAppointment should translate exclusion conflicts into BadRequestException', async () => {
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('exclusion constraint', {
        code: 'P2004',
        clientVersion: 'test',
        meta: { database_error: 'appointments_employee_scheduled_time_excl' },
      }),
    );

    await expect(
      repository.rescheduleAppointment(1, {
        date: new Date('2026-03-20'),
        startTime: '10:00',
      }),
    ).rejects.toThrow(new BadRequestException('Appointment time is no longer available'));
  });
});
