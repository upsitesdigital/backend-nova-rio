import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { ClientProfile } from '../../../auth/domain/interfaces/client.repository.interface.js';
import type {
  IClientProfileRepository,
  UpdateProfileData,
} from '../../domain/interfaces/client-profile.repository.interface.js';

@Injectable()
export class PrismaClientProfileRepository implements IClientProfileRepository {
  constructor(private prisma: PrismaService) {}

  async findClientProfileById(id: number): Promise<ClientProfile | null> {
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

  async updateProfile(id: number, data: UpdateProfileData): Promise<ClientProfile> {
    return this.prisma.client.update({
      where: { id },
      data,
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
}
