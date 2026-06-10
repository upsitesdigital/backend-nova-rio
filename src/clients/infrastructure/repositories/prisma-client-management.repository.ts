import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  ClientSafe,
  IClientManagementRepository,
  ListClientsFilters,
} from '../../domain/interfaces/client-management.repository.interface.js';

const CLIENT_SAFE_SELECT = {
  id: true,
  uuid: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  company: true,
  cpfCnpj: true,
  address: true,
  complement: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  unit: { select: { id: true, name: true } },
} satisfies Prisma.ClientSelect;

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
        select: CLIENT_SAFE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findClientById(id: number): Promise<ClientSafe | null> {
    return this.prisma.client.findFirst({
      where: { id },
      select: CLIENT_SAFE_SELECT,
    });
  }

  async approveClientById(id: number): Promise<boolean> {
    const updated = await this.prisma.client.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'ACTIVE' },
    });
    return updated.count === 1;
  }

  async rejectClientById(id: number): Promise<boolean> {
    const updated = await this.prisma.client.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'INACTIVE' },
    });
    return updated.count === 1;
  }
}
