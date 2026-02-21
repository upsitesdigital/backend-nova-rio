import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  AdminUserSafe,
  CreateAdminUserData,
  IAdminUserRepository,
  ListAdminUsersFilters,
} from '../../domain/interfaces/admin-user.repository.interface.js';

const ADMIN_USER_SAFE_SELECT = {
  id: true,
  uuid: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
} satisfies Prisma.AdminUserSelect;

@Injectable()
export class PrismaAdminUserRepository implements IAdminUserRepository {
  constructor(private prisma: PrismaService) {}

  async createAdminUser(data: CreateAdminUserData): Promise<AdminUserSafe> {
    return this.prisma.adminUser.create({
      data,
      select: ADMIN_USER_SAFE_SELECT,
    });
  }

  async findAdminUserByEmail(email: string): Promise<AdminUserSafe | null> {
    return this.prisma.adminUser.findUnique({
      where: { email },
      select: ADMIN_USER_SAFE_SELECT,
    });
  }

  async findAdminUserById(id: number): Promise<AdminUserSafe | null> {
    return this.prisma.adminUser.findFirst({
      where: { id, status: 'ACTIVE' },
      select: ADMIN_USER_SAFE_SELECT,
    });
  }

  async listAdminUsers(filters: ListAdminUsersFilters): Promise<PaginatedResponse<AdminUserSafe>> {
    const where: Prisma.AdminUserWhereInput = {};
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where,
        select: ADMIN_USER_SAFE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.adminUser.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async deactivateAdminUserById(id: number): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
