import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  AdminData,
  AdminProfile,
  IAdminRepository,
} from '../../domain/interfaces/admin.repository.interface.js';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

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

  async incrementFailedLoginAttempts(id: number): Promise<void> {
    const admin = await this.prisma.adminUser.update({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });

    if (admin.failedLoginAttempts >= LOCKOUT_THRESHOLD) {
      await this.prisma.adminUser.update({
        where: { id },
        data: { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) },
      });
    }
  }

  async resetFailedLoginAttempts(id: number): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  async updateRefreshTokenWithFamily(
    id: number,
    refreshToken: string,
    tokenFamily: string,
  ): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { refreshToken, tokenFamily },
    });
  }

  async getRefreshTokenAndFamily(
    id: number,
  ): Promise<{ refreshToken: string | null; tokenFamily: string | null }> {
    const result = await this.prisma.adminUser.findUnique({
      where: { id },
      select: { refreshToken: true, tokenFamily: true },
    });
    return {
      refreshToken: result?.refreshToken ?? null,
      tokenFamily: (result?.tokenFamily as string | null) ?? null,
    };
  }

  async revokeTokenFamily(id: number): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { refreshToken: null, tokenFamily: null },
    });
  }
}
