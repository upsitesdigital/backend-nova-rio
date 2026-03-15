import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AppointmentConflictValidator } from '../../application/validators/appointment-conflict.validator.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  AppointmentResponse,
  ClientConflictCheckParams,
  ConflictCheckParams,
  CreateAppointmentData,
  IAppointmentRepository,
  ListAppointmentsFilters,
  PaginatedAppointments,
  UpdateAppointmentData,
} from '../../domain/interfaces/appointment.repository.interface.js';

/** Columns selected by raw SQL conflict-check queries — must match the appointments table schema */
interface LockedAppointmentRow {
  id: number;
  startTime: string;
  duration: number;
}

const APPOINTMENT_INCLUDE = {
  client: { select: { id: true, name: true, email: true } },
  service: { select: { id: true, name: true } },
  employee: { select: { id: true, name: true } },
  package: { select: { id: true, name: true } },
  unit: { select: { id: true, name: true } },
} as const;

@Injectable()
export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(
    private prisma: PrismaService,
    private conflictValidator: AppointmentConflictValidator,
  ) {}

  async createAppointment(
    data: CreateAppointmentData,
    conflictCheck?: ConflictCheckParams,
    clientConflictCheck?: ClientConflictCheckParams,
  ): Promise<AppointmentResponse> {
    const createData = this.buildCreateInput(data);

    if (!conflictCheck && !clientConflictCheck) {
      return this.prisma.appointment.create({
        data: createData,
        include: APPOINTMENT_INCLUDE,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      if (conflictCheck) {
        await this.lockAndCheckConflict(tx, conflictCheck);
      }
      if (clientConflictCheck) {
        await this.lockAndCheckClientConflict(tx, clientConflictCheck);
      }

      return tx.appointment.create({
        data: createData,
        include: APPOINTMENT_INCLUDE,
      });
    });
  }

  async listAppointments(filters: ListAppointmentsFilters): Promise<PaginatedAppointments> {
    const where: Prisma.AppointmentWhereInput = {
      date:
        filters.weekStart && filters.weekEnd
          ? { gte: filters.weekStart, lte: filters.weekEnd }
          : filters.date,
      employeeId: filters.employeeId,
      unitId: filters.unitId,
      status: filters.status,
    };

    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: APPOINTMENT_INCLUDE,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip,
        take: filters.limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit };
  }

  async listAppointmentsByClientId(
    clientId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedAppointments> {
    const where = { clientId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: APPOINTMENT_INCLUDE,
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAppointmentById(id: number): Promise<AppointmentResponse | null> {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async findAppointmentByIdAndClientId(
    id: number,
    clientId: number,
  ): Promise<AppointmentResponse | null> {
    return this.prisma.appointment.findFirst({
      where: { id, clientId },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async updateAppointmentById(
    id: number,
    data: UpdateAppointmentData,
    conflictCheck?: ConflictCheckParams,
  ): Promise<AppointmentResponse> {
    const updateData = this.buildUpdateInput(data);

    if (!conflictCheck) {
      return this.prisma.appointment.update({
        where: { id },
        data: updateData,
        include: APPOINTMENT_INCLUDE,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await this.lockAndCheckConflict(tx, conflictCheck);

      return tx.appointment.update({
        where: { id },
        data: updateData,
        include: APPOINTMENT_INCLUDE,
      });
    });
  }

  async cancelAppointmentById(id: number): Promise<void> {
    await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async completeAppointmentById(id: number): Promise<AppointmentResponse> {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async rescheduleAppointment(
    id: number,
    data: UpdateAppointmentData,
    conflictCheck?: ConflictCheckParams,
    clientConflictCheck?: ClientConflictCheckParams,
  ): Promise<AppointmentResponse> {
    const updateData = this.buildUpdateInput(data);

    return this.prisma.$transaction(async (tx) => {
      if (conflictCheck) {
        await this.lockAndCheckConflict(tx, conflictCheck);
      }
      if (clientConflictCheck) {
        await this.lockAndCheckClientConflict(tx, clientConflictCheck);
      }

      return tx.appointment.update({
        where: { id },
        data: updateData,
        include: APPOINTMENT_INCLUDE,
      });
    });
  }

  private async lockAndCheckConflict(
    tx: Prisma.TransactionClient,
    params: ConflictCheckParams,
  ): Promise<void> {
    const locked = await tx.$queryRaw<LockedAppointmentRow[]>`
      SELECT id, "startTime", duration FROM appointments
      WHERE "employeeId" = ${params.employeeId}
        AND date = ${params.date}
        AND status = 'SCHEDULED'
      FOR UPDATE
    `;

    this.conflictValidator.assertNoTimeConflict(
      locked,
      params,
      'Employee already has an appointment at this time',
    );
  }

  private async lockAndCheckClientConflict(
    tx: Prisma.TransactionClient,
    params: ClientConflictCheckParams,
  ): Promise<void> {
    const locked = await tx.$queryRaw<LockedAppointmentRow[]>`
      SELECT id, "startTime", duration FROM appointments
      WHERE "clientId" = ${params.clientId}
        AND date = ${params.date}
        AND status = 'SCHEDULED'
      FOR UPDATE
    `;

    this.conflictValidator.assertNoTimeConflict(
      locked,
      params,
      'Client already has an appointment at this time',
    );
  }

  private buildCreateInput(data: CreateAppointmentData): Prisma.AppointmentCreateInput {
    return {
      date: data.date,
      startTime: data.startTime,
      duration: data.duration,
      recurrenceType: data.recurrenceType,
      locationZip: data.locationZip,
      locationAddress: data.locationAddress,
      notes: data.notes,
      client: { connect: { id: data.clientId } },
      service: { connect: { id: data.serviceId } },
      ...(data.employeeId ? { employee: { connect: { id: data.employeeId } } } : {}),
      ...(data.packageId ? { package: { connect: { id: data.packageId } } } : {}),
      ...(data.unitId ? { unit: { connect: { id: data.unitId } } } : {}),
    };
  }

  private buildUpdateInput(data: UpdateAppointmentData): Prisma.AppointmentUpdateInput {
    return {
      ...(data.date !== undefined ? { date: data.date } : {}),
      ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.recurrenceType !== undefined ? { recurrenceType: data.recurrenceType } : {}),
      ...(data.locationZip !== undefined ? { locationZip: data.locationZip } : {}),
      ...(data.locationAddress !== undefined ? { locationAddress: data.locationAddress } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.employeeId !== undefined ? { employee: { connect: { id: data.employeeId } } } : {}),
      ...(data.serviceId !== undefined ? { service: { connect: { id: data.serviceId } } } : {}),
      ...(data.packageId !== undefined ? { package: { connect: { id: data.packageId } } } : {}),
      ...(data.unitId !== undefined ? { unit: { connect: { id: data.unitId } } } : {}),
    };
  }
}
