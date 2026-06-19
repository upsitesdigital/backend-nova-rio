import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  AdminData,
  AdminProfile,
} from '../../../auth/domain/interfaces/admin.repository.interface.js';
import type {
  AdminVerificationCodeRecord,
  IAdminProfileSelfRepository,
  UpdateAdminProfileData,
} from '../../domain/interfaces/admin-profile.repository.interface.js';

@Injectable()
export class PrismaAdminProfileRepository implements IAdminProfileSelfRepository {
  constructor(private prisma: PrismaService) {}

  async findAdminById(id: number): Promise<AdminData | null> {
    return this.prisma.adminUser.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<AdminData | null> {
    return this.prisma.adminUser.findUnique({ where: { email } });
  }

  async findAdminProfileById(id: number): Promise<AdminProfile | null> {
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

  async updateProfile(id: number, data: UpdateAdminProfileData): Promise<AdminProfile> {
    return this.prisma.adminUser.update({
      where: { id },
      data,
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

  async updateEmail(id: number, email: string): Promise<void> {
    await this.prisma.adminUser.update({ where: { id }, data: { email } });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await this.prisma.adminUser.update({ where: { id }, data: { password } });
  }

  async createVerificationCode(
    adminId: number,
    code: string,
    type: string,
    channel: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.adminVerificationCode.create({
      data: { adminId, code, type, channel, expiresAt },
    });
  }

  async deleteVerificationCodesByAdminId(adminId: number, type: string): Promise<void> {
    await this.prisma.adminVerificationCode.deleteMany({ where: { adminId, type } });
  }

  async findActiveVerificationCodes(
    adminId: number,
    type: string,
  ): Promise<AdminVerificationCodeRecord[]> {
    return this.prisma.adminVerificationCode.findMany({
      where: { adminId, type, usedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, code: true, expiresAt: true },
    });
  }

  async markVerificationCodeAsUsed(id: number): Promise<boolean> {
    const updated = await this.prisma.adminVerificationCode.updateMany({
      where: { id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return updated.count === 1;
  }
}
