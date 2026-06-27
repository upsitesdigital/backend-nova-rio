import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error.js';
import { VerificationType } from '../../domain/constants/verification-type.constant.js';
import type {
  ClientData,
  ClientForPayment,
  ClientProfile,
  CreateClientData,
  IClientRepository,
  VerificationCodeRecord,
} from '../../domain/interfaces/client.repository.interface.js';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class PrismaClientRepository implements IClientRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<ClientData | null> {
    return this.prisma.client.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<ClientData | null> {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async findStatusById(id: number): Promise<{ status: string } | null> {
    return this.prisma.client.findUnique({
      where: { id },
      select: { status: true },
    });
  }

  async findClientForPayment(id: number): Promise<ClientForPayment | null> {
    return this.prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpfCnpj: true,
        phone: true,
        vindiCustomerId: true,
      },
    });
  }

  async updateVindiCustomerId(id: number, vindiCustomerId: number): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { vindiCustomerId },
    });
  }

  async findProfileById(id: number): Promise<ClientProfile | null> {
    return this.prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        company: true,
        cpfCnpj: true,
        address: true,
        preferredRecurrence: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async create(data: CreateClientData): Promise<ClientData> {
    try {
      return await this.prisma.client.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailAlreadyInUseError();
      }
      throw error;
    }
  }

  async updateRefreshToken(id: number, refreshToken: string | null): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async getRefreshToken(id: number): Promise<string | null> {
    const result = await this.prisma.client.findUnique({
      where: { id },
      select: { refreshToken: true },
    });
    return result?.refreshToken ?? null;
  }

  async reserveLoginAttempt(id: number): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE clients
        SET "failedLoginAttempts" = 0, "lockedUntil" = NULL
        WHERE id = ${id}
          AND "lockedUntil" IS NOT NULL
          AND "lockedUntil" <= NOW()
      `;

      const rows = await tx.$queryRaw<Array<{ failedLoginAttempts: number }>>`
        UPDATE clients
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
    await this.prisma.client.update({
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
    const updated = await this.prisma.client.updateMany({
      where: { id, ...(currentRefreshToken ? { refreshToken: currentRefreshToken } : {}) },
      data: { refreshToken, tokenFamily },
    });
    return updated.count === 1;
  }

  async getRefreshTokenAndFamily(
    id: number,
  ): Promise<{ refreshToken: string | null; tokenFamily: string | null }> {
    const result = await this.prisma.client.findUnique({
      where: { id },
      select: { refreshToken: true, tokenFamily: true },
    });
    return {
      refreshToken: result?.refreshToken ?? null,
      tokenFamily: (result?.tokenFamily as string | null) ?? null,
    };
  }

  async revokeTokenFamily(id: number): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { refreshToken: null, tokenFamily: null },
    });
  }

  async createVerificationCode(
    clientId: number,
    code: string,
    type: string,
    channel: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.verificationCode.create({
      data: { code, type, channel, expiresAt, clientId },
    });
  }

  async deleteVerificationCodesByClientId(clientId: number, type: string): Promise<void> {
    await this.prisma.verificationCode.deleteMany({
      where: { clientId, type },
    });
  }

  async findActiveVerificationCodes(
    clientId: number,
    type: string,
  ): Promise<VerificationCodeRecord[]> {
    return this.prisma.verificationCode.findMany({
      where: {
        clientId,
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, code: true, expiresAt: true },
    });
  }

  async markVerificationCodeAsUsed(id: number): Promise<boolean> {
    const updated = await this.prisma.verificationCode.updateMany({
      where: { id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return updated.count === 1;
  }

  async updateEmail(id: number, email: string): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { email },
    });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { password },
    });
  }

  async completePasswordReset(
    clientId: number,
    verificationCodeId: number,
    hashedPassword: string,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const consumed = await tx.verificationCode.updateMany({
        where: {
          id: verificationCodeId,
          clientId,
          type: VerificationType.passwordChange,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      if (consumed.count !== 1) {
        return false;
      }

      await tx.client.update({
        where: { id: clientId },
        data: { password: hashedPassword, refreshToken: null, tokenFamily: null },
      });
      await tx.verificationCode.deleteMany({
        where: { clientId, type: VerificationType.passwordChange, id: { not: verificationCodeId } },
      });
      return true;
    });
  }

  async getResetAttempts(
    clientId: number,
  ): Promise<{ failedResetAttempts: number; resetLockedUntil: Date | null }> {
    const result = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { failedResetAttempts: true, resetLockedUntil: true },
    });
    return {
      failedResetAttempts: result?.failedResetAttempts ?? 0,
      resetLockedUntil: result?.resetLockedUntil ?? null,
    };
  }

  async reserveResetAttempt(
    clientId: number,
  ): Promise<{ allowed: boolean; failedResetAttempts: number }> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE clients
        SET "failedResetAttempts" = 0, "resetLockedUntil" = NULL
        WHERE id = ${clientId}
          AND "resetLockedUntil" IS NOT NULL
          AND "resetLockedUntil" <= NOW()
      `;

      const rows = await tx.$queryRaw<Array<{ failedResetAttempts: number }>>`
        UPDATE clients
        SET
          "failedResetAttempts" = "failedResetAttempts" + 1,
          "resetLockedUntil" = CASE
            WHEN "failedResetAttempts" + 1 >= ${LOCKOUT_THRESHOLD}
            THEN NOW() + (${LOCKOUT_DURATION_MS} * INTERVAL '1 millisecond')
            ELSE "resetLockedUntil"
          END
        WHERE id = ${clientId}
          AND ("resetLockedUntil" IS NULL OR "resetLockedUntil" <= NOW())
          AND "failedResetAttempts" < ${LOCKOUT_THRESHOLD}
        RETURNING "failedResetAttempts"
      `;

      return {
        allowed: rows.length === 1,
        failedResetAttempts: rows[0]?.failedResetAttempts ?? LOCKOUT_THRESHOLD,
      };
    });
  }

  async incrementResetAttempts(
    clientId: number,
    maxAttempts: number,
    lockoutWindowMs: number,
  ): Promise<void> {
    const lockoutThreshold = maxAttempts;
    const rows = await this.prisma.$queryRaw<Array<{ failedResetAttempts: number }>>`
      UPDATE clients
      SET
        "failedResetAttempts" = "failedResetAttempts" + 1,
        "resetLockedUntil" = CASE
          WHEN "failedResetAttempts" + 1 >= ${lockoutThreshold}
          THEN NOW() + (${lockoutWindowMs} * INTERVAL '1 millisecond')
          ELSE "resetLockedUntil"
        END
      WHERE id = ${clientId}
      RETURNING "failedResetAttempts"
    `;
    void rows;
  }

  async clearResetAttempts(clientId: number): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: { failedResetAttempts: 0, resetLockedUntil: null },
    });
  }

  async deactivateClient(id: number): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { status: UserStatus.INACTIVE, refreshToken: null, tokenFamily: null },
    });
  }
}
