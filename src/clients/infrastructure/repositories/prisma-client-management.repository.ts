import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  ClientSafe,
  IClientManagementRepository,
  ListClientsFilters,
} from '../../domain/interfaces/client-management.repository.interface.js';
import { ClientSelect } from './client.select.js';

@Injectable()
export class PrismaClientManagementRepository implements IClientManagementRepository {
  constructor(private prisma: PrismaService) {}

  async listClients(filters: ListClientsFilters): Promise<PaginatedResponse<ClientSafe>> {
    const where: Prisma.ClientWhereInput = {};
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { unit: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        select: ClientSelect.safe,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findClientById(id: number): Promise<ClientSafe | null> {
    return this.prisma.client.findUnique({
      where: { id },
      select: ClientSelect.safe,
    });
  }

  async approveClientById(id: number): Promise<boolean> {
    const updated = await this.prisma.client.updateMany({
      where: { id, status: UserStatus.PENDING },
      data: { status: UserStatus.ACTIVE },
    });
    return updated.count === 1;
  }

  async rejectClientById(id: number): Promise<boolean> {
    const updated = await this.prisma.client.updateMany({
      where: { id, status: UserStatus.PENDING },
      data: { status: UserStatus.INACTIVE },
    });
    return updated.count === 1;
  }
}
