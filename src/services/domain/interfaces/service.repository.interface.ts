import type { Service, ServiceRecurrenceFrequency } from '@prisma/client';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';

export interface CreateServiceData {
  name: string;
  description?: string;
  icon?: string;
  basePrice: number;
  allowSingle?: boolean;
  allowPackage?: boolean;
  allowRecurrence?: boolean;
  recurrenceFrequencies?: ServiceRecurrenceFrequency[];
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  icon?: string;
  basePrice?: number;
  allowSingle?: boolean;
  allowPackage?: boolean;
  allowRecurrence?: boolean;
  recurrenceFrequencies?: ServiceRecurrenceFrequency[];
}

export interface ListServicesFilters {
  page: number;
  limit: number;
}

export interface IServiceRepository {
  createService(data: CreateServiceData): Promise<Service>;
  findAllActiveServices(filters: ListServicesFilters): Promise<PaginatedResponse<Service>>;
  findServiceById(id: number): Promise<Service | null>;
  updateServiceById(id: number, data: UpdateServiceData): Promise<Service>;
  deactivateServiceById(id: number): Promise<void>;
}
