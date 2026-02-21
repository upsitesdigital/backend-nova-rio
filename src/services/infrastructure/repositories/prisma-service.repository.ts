import { Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  CreateServiceData,
  IServiceRepository,
  ListServicesFilters,
  UpdateServiceData,
} from '../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private prisma: PrismaService) {}

  async createService(data: CreateServiceData): Promise<Service> {
    return this.prisma.service.create({ data });
  }

  async findAllActiveServices(filters: ListServicesFilters): Promise<PaginatedResponse<Service>> {
    const where = { isActive: true };
    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({ where, skip, take: filters.limit }),
      this.prisma.service.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit };
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
