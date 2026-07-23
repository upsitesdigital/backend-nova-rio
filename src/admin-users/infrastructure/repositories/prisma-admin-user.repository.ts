import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  AdminUserSafe,
  CreateAdminUserData,
  IAdminUserRepository,
  ListAdminUsersFilters,
  UpdateAdminUserData,
} from '../../domain/interfaces/admin-user.repository.interface.js';
import { AdminUserSelect } from './admin-user.select.js';

@Injectable()
export class PrismaAdminUserRepository implements IAdminUserRepository {
  constructor(private prisma: PrismaService) {}

  async createAdminUser(data: CreateAdminUserData): Promise<AdminUserSafe> {
    return this.prisma.adminUser.create({
      data,
      select: AdminUserSelect.safe,
    });
  }

  async findAdminUserByEmail(email: string): Promise<AdminUserSafe | null> {
    return this.prisma.adminUser.findUnique({
      where: { email },
      select: AdminUserSelect.safe,
    });
  }

  async findAdminUserById(id: number): Promise<AdminUserSafe | null> {
    return this.prisma.adminUser.findFirst({
      where: { id, status: UserStatus.ACTIVE },
      select: AdminUserSelect.safe,
    });
  }

  async listAdminUsers(filters: ListAdminUsersFilters): Promise<PaginatedResponse<AdminUserSafe>> {
    const page = filters.page;
    const limit = filters.limit;

    const where: Prisma.AdminUserWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' as const } },
              { email: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where,
        select: AdminUserSelect.safe,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.adminUser.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async updateAdminUserById(id: number, data: UpdateAdminUserData): Promise<AdminUserSafe> {
    return this.prisma.adminUser.update({
      where: { id },
      data,
      select: AdminUserSelect.safe,
    });
  }

  async deactivateAdminUserById(id: number): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    });
  }
}
