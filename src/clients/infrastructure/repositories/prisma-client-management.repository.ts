import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
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

  async listClients(filters: ListClientsFilters): Promise<ClientSafe[]> {
    const where: Prisma.ClientWhereInput = {};

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

    return this.prisma.client.findMany({
      where,
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findClientById(id: number): Promise<ClientSafe | null> {
    return this.prisma.client.findFirst({
      where: { id },
      select: CLIENT_SAFE_SELECT,
    });
  }

  async approveClientById(id: number): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async rejectClientById(id: number): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
