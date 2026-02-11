import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import {
  ClientData,
  ClientProfile,
  CreateClientData,
  IClientRepository,
} from '../../domain/interfaces/client.repository.interface.js';

@Injectable()
export class PrismaClientRepository implements IClientRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<ClientData | null> {
    return this.prisma.client.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<ClientData | null> {
    return this.prisma.client.findUnique({ where: { id } });
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
}
