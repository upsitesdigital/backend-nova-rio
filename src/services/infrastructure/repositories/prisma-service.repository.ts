import { Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  CreateServiceData,
  IServiceRepository,
  UpdateServiceData,
} from '../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private prisma: PrismaService) {}

  async createService(data: CreateServiceData): Promise<Service> {
    return this.prisma.service.create({ data });
  }

  async findAllActiveServices(): Promise<Service[]> {
    return this.prisma.service.findMany({ where: { isActive: true } });
  }

  async findServiceById(id: number): Promise<Service | null> {
    return this.prisma.service.findFirst({ where: { id, isActive: true } });
  }

  async updateServiceById(id: number, data: UpdateServiceData): Promise<Service> {
    return this.prisma.service.update({ where: { id }, data });
  }

  async deactivateServiceById(id: number): Promise<void> {
    await this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }
}
