import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
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

  // Appointment.date is @db.Date, hydrated as UTC midnight. Shift it so its local
  // calendar matches its UTC calendar, otherwise date-fns (local tz) is off by one day.
  private static utcCalendar(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60_000);
  }

  async getClientDashboardSummary(clientId: number): Promise<ClientDashboardSummary> {
    const rawData = await this.clientDashboardRepository.getClientDashboardData(clientId);

    const firstName = rawData.clientName.split(' ')[0];

    const nextDate = rawData.nextAppointment
      ? GetClientDashboardSummaryUseCase.utcCalendar(rawData.nextAppointment.date)
      : null;
    const formattedNextAppointment =
      rawData.nextAppointment && nextDate
        ? {
            id: rawData.nextAppointment.id,
            date: format(nextDate, 'dd/MM'),
            dateTime: `${format(nextDate, 'yyyy-MM-dd')}T${rawData.nextAppointment.startTime}:00`,
            cancellationNote: 'Cancelamento com 1h de antecedência',
            receiptPaymentId:
              rawData.nextAppointment.payment?.status === PaymentStatus.APPROVED
                ? rawData.nextAppointment.payment.id
                : null,
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
      const aptDate = GetClientDashboardSummaryUseCase.utcCalendar(apt.date);
      const monthKey = format(aptDate, 'MMMM yyyy', { locale: ptBR });
      const capitalizedKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

      const entry: ServiceHistoryEntry = {
        id: apt.id,
        date: format(aptDate, 'dd/MM'),
        isoDate: format(aptDate, 'yyyy-MM-dd'),
        startTime: apt.startTime,
        label: apt.service.name,
        icon: apt.service.icon,
        status: apt.status,
        canEdit:
          apt.status === AppointmentStatus.SCHEDULED &&
          apt.payment?.status === PaymentStatus.APPROVED,
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
