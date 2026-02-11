import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import {
  AdminData,
  AdminProfile,
  IAdminRepository,
} from '../../domain/interfaces/admin.repository.interface.js';

@Injectable()
export class PrismaAdminRepository implements IAdminRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AdminData | null> {
    return this.prisma.adminUser.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<AdminData | null> {
    return this.prisma.adminUser.findUnique({ where: { id } });
  }

  async findProfileById(id: number): Promise<AdminProfile | null> {
    return this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateRefreshToken(id: number, refreshToken: string | null): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async getRefreshToken(id: number): Promise<string | null> {
    const result = await this.prisma.adminUser.findUnique({
      where: { id },
      select: { refreshToken: true },
    });
    return result?.refreshToken ?? null;
  }
}
