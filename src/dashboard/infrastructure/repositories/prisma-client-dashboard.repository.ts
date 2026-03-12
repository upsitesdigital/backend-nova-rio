import { Injectable, NotFoundException } from '@nestjs/common';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IClientDashboardRepository } from '../../domain/interfaces/client-dashboard.repository.interface.js';
import type {
  ClientDashboardSummary,
  ServiceHistoryEntry,
  ServiceHistoryMonth,
} from '../../domain/interfaces/client-dashboard.types.js';

@Injectable()
export class PrismaClientDashboardRepository implements IClientDashboardRepository {
  constructor(private prisma: PrismaService) {}

  async getClientDashboardSummary(clientId: number): Promise<ClientDashboardSummary> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const nextAppointment = await this.prisma.appointment.findFirst({
      where: {
        clientId,
        status: 'SCHEDULED',
        date: { gte: today },
      },
      select: { id: true, date: true, startTime: true },
      orderBy: { date: 'asc' },
    });

    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const appointmentsCount = await this.prisma.appointment.count({
      where: {
        clientId,
        createdAt: { gte: twoMonthsAgo },
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
            amount: true,
            status: true,
            card: { select: { lastFourDigits: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const monthsMap = new Map<string, ServiceHistoryEntry[]>();

    for (const apt of recentAppointments) {
      const monthKey = format(apt.date, 'MMMM yyyy', { locale: ptBR });
      const capitalizedKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

      const entry: ServiceHistoryEntry = {
        id: apt.id,
        date: format(apt.date, 'dd/MM'),
        startTime: apt.startTime,
        label: apt.service.name,
        icon: apt.service.icon,
        status: apt.status,
        canEdit: apt.status === 'SCHEDULED',
        recurrenceType: apt.recurrenceType,
        locationName: apt.unit?.name ?? null,
        locationZip: apt.locationZip ?? null,
        locationAddress: apt.locationAddress ?? null,
        payment: apt.payment
          ? {
              cardLastFour: apt.payment.card?.lastFourDigits ?? null,
              amount: `R$ ${Number(apt.payment.amount).toFixed(2).replace('.', ',')}`,
              status: apt.payment.status,
            }
          : null,
      };

      const existing = monthsMap.get(capitalizedKey);
      if (existing) {
        existing.push(entry);
      } else {
        monthsMap.set(capitalizedKey, [entry]);
      }
    }

    const serviceHistory: ServiceHistoryMonth[] = [];
    for (const [monthLabel, entries] of monthsMap) {
      serviceHistory.push({ monthLabel, entries });
    }

    return {
      clientName: client.name.split(' ')[0],
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment.id,
            date: format(nextAppointment.date, 'dd/MM'),
            dateTime: `${format(nextAppointment.date, 'yyyy-MM-dd')}T${nextAppointment.startTime}:00`,
            cancellationNote: 'Cancelamento com 1h de antecedência',
          }
        : null,
      appointmentsCount,
      appointmentsCountLabel: 'Nos últimos 2 meses',
      serviceHistory,
    };
  }
}
