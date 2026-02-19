import { Injectable } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  CreateUnitData,
  IUnitRepository,
  UpdateUnitData,
} from '../../domain/interfaces/unit.repository.interface.js';

@Injectable()
export class PrismaUnitRepository implements IUnitRepository {
  constructor(private prisma: PrismaService) {}

  async createUnit(data: CreateUnitData): Promise<Unit> {
    return this.prisma.unit.create({ data });
  }

  async listUnits(): Promise<Unit[]> {
    return this.prisma.unit.findMany({ orderBy: { name: 'asc' } });
  }

  async findUnitById(id: number): Promise<Unit | null> {
    return this.prisma.unit.findUnique({ where: { id } });
  }

  async findUnitByName(name: string): Promise<Unit | null> {
    return this.prisma.unit.findUnique({ where: { name } });
  }

  async updateUnitById(id: number, data: UpdateUnitData): Promise<Unit> {
    return this.prisma.unit.update({ where: { id }, data });
  }

  async deleteUnitById(id: number): Promise<void> {
    await this.prisma.unit.delete({ where: { id } });
  }
}
