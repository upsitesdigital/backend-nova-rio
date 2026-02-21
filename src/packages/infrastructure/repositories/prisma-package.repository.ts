import { Injectable } from '@nestjs/common';
import type { Package, Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  CreatePackageData,
  IPackageRepository,
  ListPackagesFilters,
  UpdatePackageData,
} from '../../domain/interfaces/package.repository.interface.js';

@Injectable()
export class PrismaPackageRepository implements IPackageRepository {
  constructor(private prisma: PrismaService) {}

  async createPackage(data: CreatePackageData): Promise<Package> {
    return this.prisma.package.create({ data });
  }

  async findPackages(filters: ListPackagesFilters): Promise<PaginatedResponse<Package>> {
    const where: Prisma.PackageWhereInput = {};

    if (filters.active) {
      where.isActive = true;
    }

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      this.prisma.package.findMany({ where, skip, take: filters.limit }),
      this.prisma.package.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit };
  }

  async findPackageById(id: number): Promise<Package | null> {
    return this.prisma.package.findFirst({ where: { id, isActive: true } });
  }

  async findPackageByIdIncludingInactive(id: number): Promise<Package | null> {
    return this.prisma.package.findFirst({ where: { id } });
  }

  async updatePackageById(id: number, data: UpdatePackageData): Promise<Package> {
    return this.prisma.package.update({ where: { id }, data });
  }

  async deactivatePackageById(id: number): Promise<void> {
    await this.prisma.package.update({ where: { id }, data: { isActive: false } });
  }

  async reactivatePackageById(id: number): Promise<void> {
    await this.prisma.package.update({ where: { id }, data: { isActive: true } });
  }
}
