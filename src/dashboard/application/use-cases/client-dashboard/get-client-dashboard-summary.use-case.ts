import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type IClientDashboardRepository } from '../../../domain/interfaces/client-dashboard.repository.interface.js';
import type {
  ClientDashboardSummary,
  RawDashboardAppointment,
  ServiceHistoryEntry,
  ServiceHistoryMonth,
} from '../../../domain/interfaces/client-dashboard.types.js';

@Injectable()
export class GetClientDashboardSummaryUseCase {
  constructor(
    @Inject(DiTokens.clientDashboardRepository)
    private clientDashboardRepository: IClientDashboardRepository,
  ) {}

  async getClientDashboardSummary(clientId: number): Promise<ClientDashboardSummary> {
    const rawData = await this.clientDashboardRepository.getClientDashboardData(clientId);

    const firstName = rawData.clientName.split(' ')[0];

    const formattedNextAppointment = rawData.nextAppointment
      ? {
          id: rawData.nextAppointment.id,
          date: format(rawData.nextAppointment.date, 'dd/MM'),
          dateTime: `${format(rawData.nextAppointment.date, 'yyyy-MM-dd')}T${rawData.nextAppointment.startTime}:00`,
          cancellationNote: 'Cancelamento com 1h de antecedência',
        }
      : null;

    const serviceHistory = this.buildServiceHistory(rawData.recentAppointments);

    return {
      clientName: firstName,
      nextAppointment: formattedNextAppointment,
      appointmentsCount: rawData.appointmentsCount,
      appointmentsCountLabel: 'Nos últimos 2 meses',
      serviceHistory,
    };
  }

  private buildServiceHistory(appointments: RawDashboardAppointment[]): ServiceHistoryMonth[] {
    const monthsMap = new Map<string, ServiceHistoryEntry[]>();

    for (const apt of appointments) {
      const monthKey = format(apt.date, 'MMMM yyyy', { locale: ptBR });
      const capitalizedKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

      const entry: ServiceHistoryEntry = {
        id: apt.id,
        date: format(apt.date, 'dd/MM'),
        startTime: apt.startTime,
        label: apt.service.name,
        icon: apt.service.icon,
        status: apt.status,
        canEdit: apt.status === AppointmentStatus.SCHEDULED,
        recurrenceType: apt.recurrenceType,
        locationName: apt.unit?.name ?? null,
        locationZip: apt.locationZip ?? null,
        locationAddress: apt.locationAddress ?? null,
        payment: apt.payment
          ? {
              paymentId: apt.payment.id,
              cardLastFour: apt.payment.card?.lastFourDigits ?? null,
              amount: `R$ ${apt.payment.amount.toFixed(2).replace('.', ',')}`,
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

    return serviceHistory;
  }
}
