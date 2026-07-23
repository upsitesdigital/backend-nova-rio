import { DiTokens } from '../../../../shared/di/di-tokens.js';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type {
  AdminUserSafe,
  IAdminUserRepository,
  UpdateAdminUserData,
} from '../../../domain/interfaces/admin-user.repository.interface.js';
import { UpdateAdminUserDto } from '../../../dto/admin-user/update-admin-user.dto.js';

@Injectable()
export class UpdateAdminUserUseCase {
  constructor(
    @Inject(DiTokens.adminUserRepository) private adminUserRepository: IAdminUserRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
  ) {}

  async updateAdminUser(
    id: number,
    dto: UpdateAdminUserDto,
    callerRole: string,
  ): Promise<AdminUserSafe> {
    const existing = await this.adminUserRepository.findAdminUserById(id);

    if (!existing) {
      throw new NotFoundException('Admin user not found');
    }

    const touchesAdminMaster =
      existing.role === AdminRole.ADMIN_MASTER || dto.role === AdminRole.ADMIN_MASTER;

    if (touchesAdminMaster && callerRole !== AdminRole.ADMIN_MASTER) {
      throw new ForbiddenException('Only ADMIN_MASTER can edit an ADMIN_MASTER');
    }

    if (dto.email && dto.email !== existing.email) {
      const emailOwner = await this.adminUserRepository.findAdminUserByEmail(dto.email);

      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: UpdateAdminUserData = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.password !== undefined
        ? { password: await this.hashService.hash(dto.password) }
        : {}),
    };

    return this.adminUserRepository.updateAdminUserById(id, data);
  }
}
