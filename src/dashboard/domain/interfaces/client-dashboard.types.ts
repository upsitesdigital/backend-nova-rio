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
  cardLastFour: string | null;
  amount: string;
  status: string;
}

export interface ServiceHistoryEntry {
  id: number;
  date: string;
  startTime: string;
  label: string;
  icon: string | null;
  status: string;
  canEdit: boolean;
  recurrenceType: string;
  locationName: string | null;
  locationZip: string | null;
  locationAddress: string | null;
  payment: ServiceHistoryEntryPayment | null;
}
