import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
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
        status: true,
        createdAt: true,
      },
    });
  }

  async create(data: CreateClientData): Promise<ClientData> {
    return this.prisma.client.create({ data });
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

  async incrementFailedLoginAttempts(id: number): Promise<void> {
    const client = await this.prisma.client.update({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });

    if (client.failedLoginAttempts >= LOCKOUT_THRESHOLD) {
      await this.prisma.client.update({
        where: { id },
        data: { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) },
      });
    }
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
  ): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { refreshToken, tokenFamily },
    });
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

  async markVerificationCodeAsUsed(id: number): Promise<void> {
    await this.prisma.verificationCode.update({
      where: { id },
      data: { usedAt: new Date() },
    });
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
    hashedPassword: string,
    matchedCodeId: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.client.update({
        where: { id: clientId },
        data: { password: hashedPassword },
      });
      await tx.verificationCode.update({
        where: { id: matchedCodeId },
        data: { usedAt: new Date() },
      });
      await tx.verificationCode.deleteMany({
        where: { clientId, type: 'PASSWORD_CHANGE' },
      });
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

  async incrementResetAttempts(clientId: number, lockUntil: Date | null): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        failedResetAttempts: { increment: 1 },
        ...(lockUntil ? { resetLockedUntil: lockUntil } : {}),
      },
    });
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
      data: { status: 'INACTIVE', refreshToken: null, tokenFamily: null },
    });
  }
}
