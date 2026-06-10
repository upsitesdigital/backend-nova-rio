import { Injectable } from '@nestjs/common';
import { AppointmentStatus, type Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  AgendaItem,
  DashboardFilters,
  IDashboardRepository,
  TodayAgendaFilters,
} from '../../domain/interfaces/dashboard.repository.interface.js';

@Injectable()
export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private prisma: PrismaService) {}

  async getTodayAppointmentsCount(filters: DashboardFilters): Promise<number> {
    const where = this.buildTodayWhere(filters);
    return this.prisma.appointment.count({ where });
  }

  async getActiveClientsCount(filters: DashboardFilters): Promise<number> {
    const where: Prisma.ClientWhereInput = { status: UserStatus.ACTIVE };
    if (filters.unitId) where.unitId = filters.unitId;
    return this.prisma.client.count({ where });
  }

  async getPendingAppointmentsCount(filters: DashboardFilters): Promise<number> {
    const where: Prisma.AppointmentWhereInput = { status: AppointmentStatus.SCHEDULED };
    if (filters.unitId) where.unitId = filters.unitId;
    return this.prisma.appointment.count({ where });
  }

  async getTodayAgenda(filters: TodayAgendaFilters): Promise<AgendaItem[]> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildTodayWhere(filters);
    if (filters.serviceId) where.serviceId = filters.serviceId;

    const appointments = await this.prisma.appointment.findMany({
      where,
      select: {
        id: true,
        startTime: true,
        duration: true,
        status: true,
        date: true,
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
      skip,
      take: limit,
    });

    return appointments.map((a) => ({
      appointmentId: a.id,
      clientName: a.client.name,
      serviceName: a.service.name,
      startTime: a.startTime,
      duration: a.duration,
      status: a.status,
      date: a.date,
    }));
  }

  async getTodayAgendaTotal(filters: TodayAgendaFilters): Promise<number> {
    const where = this.buildTodayWhere(filters);
    if (filters.serviceId) where.serviceId = filters.serviceId;
    return this.prisma.appointment.count({ where });
  }

  private buildTodayWhere(filters: DashboardFilters): Prisma.AppointmentWhereInput {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const where: Prisma.AppointmentWhereInput = {
      date: { gte: today, lt: tomorrow },
      status: AppointmentStatus.SCHEDULED,
    };

    if (filters.unitId) where.unitId = filters.unitId;
    return where;
  }
}
