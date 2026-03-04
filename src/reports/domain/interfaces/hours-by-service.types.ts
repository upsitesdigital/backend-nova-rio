export interface HoursByServiceFilters {
  dateFrom?: Date;
  dateTo?: Date;
  unitId?: number;
}

export interface HoursByServiceItem {
  serviceId: number;
  serviceName: string;
  totalMinutes: number;
}
