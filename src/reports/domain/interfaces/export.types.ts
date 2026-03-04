export interface ExportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  unitId?: number;
  serviceId?: number;
}

export interface ExportRow {
  paymentId: number;
  paidAt: Date | null;
  amount: unknown;
  method: string;
  status: string;
  clientName: string;
  serviceName: string;
  appointmentDate: Date;
}
