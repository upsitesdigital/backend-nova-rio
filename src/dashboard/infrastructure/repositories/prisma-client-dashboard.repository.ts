import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IClientDashboardRepository } from '../../domain/interfaces/client-dashboard.repository.interface.js';
import type {
  RawClientDashboardData,
  RawDashboardAppointment,
} from '../../domain/interfaces/client-dashboard.types.js';

@Injectable()
export class PrismaClientDashboardRepository implements IClientDashboardRepository {
  private static readonly dashboardHistoryLimit = 20;

  constructor(private prisma: PrismaService) {}

  async getClientDashboardData(clientId: number): Promise<RawClientDashboardData> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const now = new Date();
    // Appointment.date is @db.Date (UTC midnight); build the boundary in UTC so
    // today's appointments are not dropped on servers with a non-UTC timezone.
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const nextAppointment = await this.prisma.appointment.findFirst({
      where: {
        clientId,
        status: AppointmentStatus.SCHEDULED,
        date: { gte: today },
        payment: { status: PaymentStatus.APPROVED },
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        payment: { select: { id: true, status: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setUTCMonth(twoMonthsAgo.getUTCMonth() - 2);

    const appointmentsCount = await this.prisma.appointment.count({
      where: {
        clientId,
        createdAt: { gte: twoMonthsAgo },
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED] },
        payment: { status: PaymentStatus.APPROVED },
      },
    });

    const recentAppointments = await this.prisma.appointment.findMany({
      where: { clientId },
      select: {
        id: true,
        date: true,
        startTime: true,
        status: true,
        recurrenceType: true,
        locationZip: true,
        locationAddress: true,
        service: { select: { name: true, icon: true } },
        unit: { select: { name: true } },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            card: { select: { lastFourDigits: true } },
          },
        },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      take: PrismaClientDashboardRepository.dashboardHistoryLimit,
    });

    const rawAppointments: RawDashboardAppointment[] = recentAppointments.map((apt) => ({
      id: apt.id,
      date: apt.date,
      startTime: apt.startTime,
      status: apt.status,
      recurrenceType: apt.recurrenceType,
      locationZip: apt.locationZip,
      locationAddress: apt.locationAddress,
      service: apt.service,
      unit: apt.unit,
      payment: apt.payment
        ? {
            id: apt.payment.id,
            amount: Number(apt.payment.amount),
            status: apt.payment.status,
            card: apt.payment.card,
          }
        : null,
    }));

    return {
      clientName: client.name,
      nextAppointment,
      appointmentsCount,
      recentAppointments: rawAppointments,
    };
  }
}
