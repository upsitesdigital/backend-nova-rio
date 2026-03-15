import type { AppointmentStatus, PaymentStatus, RecurrenceType } from '@prisma/client';

// Raw types returned by the repository (no formatting)
export interface RawDashboardAppointment {
  id: number;
  date: Date;
  startTime: string;
  status: AppointmentStatus;
  recurrenceType: RecurrenceType;
  locationZip: string | null;
  locationAddress: string | null;
  service: { name: string; icon: string | null };
  unit: { name: string } | null;
  payment: {
    id: number;
    amount: number;
    status: PaymentStatus;
    card: { lastFourDigits: string } | null;
  } | null;
}

export interface RawClientDashboardData {
  clientName: string;
  nextAppointment: {
    id: number;
    date: Date;
    startTime: string;
  } | null;
  appointmentsCount: number;
  recentAppointments: RawDashboardAppointment[];
}

// Formatted types returned by the use case
export interface ClientDashboardSummary {
  clientName: string;
  nextAppointment: {
    id: number;
    date: string;
    dateTime: string;
    cancellationNote: string;
  } | null;
  appointmentsCount: number;
  appointmentsCountLabel: string;
  serviceHistory: ServiceHistoryMonth[];
}

export interface ServiceHistoryMonth {
  monthLabel: string;
  entries: ServiceHistoryEntry[];
}

export interface ServiceHistoryEntryPayment {
  paymentId: number;
  cardLastFour: string | null;
  amount: string;
  status: PaymentStatus;
}

export interface ServiceHistoryEntry {
  id: number;
  date: string;
  startTime: string;
  label: string;
  icon: string | null;
  status: AppointmentStatus;
  canEdit: boolean;
  recurrenceType: RecurrenceType;
  locationName: string | null;
  locationZip: string | null;
  locationAddress: string | null;
  payment: ServiceHistoryEntryPayment | null;
}
