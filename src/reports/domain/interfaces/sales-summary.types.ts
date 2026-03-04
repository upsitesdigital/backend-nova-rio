export interface SalesSummaryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  unitId?: number;
  serviceId?: number;
}

export interface SalesSummaryResponse {
  totalRevenue: unknown;
  totalPayments: number;
  averageTicket: unknown;
}
