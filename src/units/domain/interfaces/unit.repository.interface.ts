import type { Unit } from '@prisma/client';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';

export const UNIT_REPOSITORY = Symbol('UNIT_REPOSITORY');

export interface CreateUnitData {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
}

export interface UpdateUnitData {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
}

export interface ListUnitsFilters {
  page: number;
  limit: number;
}

export interface IUnitRepository {
  createUnit(data: CreateUnitData): Promise<Unit>;
  listUnits(filters: ListUnitsFilters): Promise<PaginatedResponse<Unit>>;
  findUnitById(id: number): Promise<Unit | null>;
  findUnitByName(name: string): Promise<Unit | null>;
  updateUnitById(id: number, data: UpdateUnitData): Promise<Unit>;
  deleteUnitById(id: number): Promise<void>;
}
