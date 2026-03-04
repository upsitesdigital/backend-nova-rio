import type { ActiveClientsFilters, ActiveClientsResponse } from './active-clients.types.js';
import type { ExportFilters, ExportRow } from './export.types.js';
import type { HoursByServiceFilters, HoursByServiceItem } from './hours-by-service.types.js';
import type { SalesSummaryFilters, SalesSummaryResponse } from './sales-summary.types.js';
import type { TransactionGroupItem, TransactionsFilters } from './transactions.types.js';

export const REPORT_REPOSITORY = Symbol('REPORT_REPOSITORY');

export type {
  ActiveClientsFilters,
  ActiveClientsResponse,
  UnitClientCount,
} from './active-clients.types.js';
export type { ExportFilters, ExportRow } from './export.types.js';
export type { HoursByServiceFilters, HoursByServiceItem } from './hours-by-service.types.js';
export type { SalesSummaryFilters, SalesSummaryResponse } from './sales-summary.types.js';
export type { TransactionGroupItem, TransactionsFilters } from './transactions.types.js';

export interface IReportRepository {
  getSalesSummary(filters: SalesSummaryFilters): Promise<SalesSummaryResponse>;
  getActiveClients(filters: ActiveClientsFilters): Promise<ActiveClientsResponse>;
  getHoursByService(filters: HoursByServiceFilters): Promise<HoursByServiceItem[]>;
  getTransactions(filters: TransactionsFilters): Promise<TransactionGroupItem[]>;
  getExportRows(filters: ExportFilters): Promise<ExportRow[]>;
}
