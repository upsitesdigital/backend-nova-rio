export interface ClientDashboardSummary {
  clientName: string;
  nextAppointment: {
    date: string;
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
  label: string;
  icon: string | null;
  status: string;
  canEdit: boolean;
  recurrenceType: string;
  locationName: string | null;
  payment: ServiceHistoryEntryPayment | null;
}
