import type { Service } from '@prisma/client';

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');

export interface CreateServiceData {
  name: string;
  description?: string;
  icon?: string;
  basePrice: number;
  allowSingle?: boolean;
  allowPackage?: boolean;
  allowRecurrence?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  icon?: string;
  basePrice?: number;
  allowSingle?: boolean;
  allowPackage?: boolean;
  allowRecurrence?: boolean;
}

export interface IServiceRepository {
  createService(data: CreateServiceData): Promise<Service>;
  findAllActiveServices(): Promise<Service[]>;
  findServiceById(id: number): Promise<Service | null>;
  updateServiceById(id: number, data: UpdateServiceData): Promise<Service>;
  deactivateServiceById(id: number): Promise<void>;
}
