import type { Unit } from '@prisma/client';

export const UNIT_REPOSITORY = Symbol('UNIT_REPOSITORY');

export interface CreateUnitData {
  name: string;
  address?: string;
}

export interface UpdateUnitData {
  name?: string;
  address?: string;
}

export interface IUnitRepository {
  createUnit(data: CreateUnitData): Promise<Unit>;
  listUnits(): Promise<Unit[]>;
  findUnitById(id: number): Promise<Unit | null>;
  findUnitByName(name: string): Promise<Unit | null>;
  updateUnitById(id: number, data: UpdateUnitData): Promise<Unit>;
  deleteUnitById(id: number): Promise<void>;
}
