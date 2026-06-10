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

  async reserveLoginAttempt(id: number): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE admin_users
        SET "failedLoginAttempts" = 0, "lockedUntil" = NULL
        WHERE id = ${id}
          AND "lockedUntil" IS NOT NULL
          AND "lockedUntil" <= NOW()
      `;

      const rows = await tx.$queryRaw<Array<{ failedLoginAttempts: number }>>`
        UPDATE admin_users
        SET
          "failedLoginAttempts" = "failedLoginAttempts" + 1,
          "lockedUntil" = CASE
            WHEN "failedLoginAttempts" + 1 >= ${LOCKOUT_THRESHOLD}
            THEN NOW() + (${LOCKOUT_DURATION_MS} * INTERVAL '1 millisecond')
            ELSE "lockedUntil"
          END
        WHERE id = ${id}
          AND ("lockedUntil" IS NULL OR "lockedUntil" <= NOW())
          AND "failedLoginAttempts" < ${LOCKOUT_THRESHOLD}
        RETURNING "failedLoginAttempts"
      `;

      return rows.length === 1;
    });
  }

  async incrementFailedLoginAttempts(id: number): Promise<void> {
    await this.reserveLoginAttempt(id);
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
    currentRefreshToken?: string,
  ): Promise<boolean> {
    const updated = await this.prisma.adminUser.updateMany({
      where: { id, ...(currentRefreshToken ? { refreshToken: currentRefreshToken } : {}) },
      data: { refreshToken, tokenFamily },
    });
    return updated.count === 1;
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
