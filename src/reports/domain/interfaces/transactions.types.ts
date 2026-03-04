export interface TransactionsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  unitId?: number;
  serviceId?: number;
  groupBy: 'day' | 'week' | 'month';
}

export interface TransactionGroupItem {
  period: string;
  total: number;
  count: number;
}
