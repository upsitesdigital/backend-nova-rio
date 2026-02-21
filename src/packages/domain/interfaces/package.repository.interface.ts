import type { Package } from '@prisma/client';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';

export const PACKAGE_REPOSITORY = Symbol('PACKAGE_REPOSITORY');

export interface CreatePackageData {
  name: string;
  description?: string;
  totalHours?: number;
  price: number;
  serviceId: number;
}

export interface UpdatePackageData {
  name?: string;
  description?: string;
  totalHours?: number;
  price?: number;
  serviceId?: number;
}

export interface ListPackagesFilters {
  page: number;
  limit: number;
  active?: boolean;
  serviceId?: number;
}

export interface IPackageRepository {
  createPackage(data: CreatePackageData): Promise<Package>;
  findPackages(filters: ListPackagesFilters): Promise<PaginatedResponse<Package>>;
  findPackageById(id: number): Promise<Package | null>;
  findPackageByIdIncludingInactive(id: number): Promise<Package | null>;
  updatePackageById(id: number, data: UpdatePackageData): Promise<Package>;
  deactivatePackageById(id: number): Promise<void>;
  reactivatePackageById(id: number): Promise<void>;
}
