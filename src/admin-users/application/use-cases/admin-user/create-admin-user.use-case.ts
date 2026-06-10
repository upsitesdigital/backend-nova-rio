import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type {
  AdminUserSafe,
  IAdminUserRepository,
} from '../../../domain/interfaces/admin-user.repository.interface.js';
import { CreateAdminUserDto } from '../../../dto/admin-user/create-admin-user.dto.js';

@Injectable()
export class CreateAdminUserUseCase {
  constructor(
    @Inject(DiTokens.adminUserRepository) private adminUserRepository: IAdminUserRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
  ) {}

  async createAdminUser(
    dto: CreateAdminUserDto,
    callerId: number,
    callerRole: string,
  ): Promise<AdminUserSafe> {
    const role = dto.role ?? AdminRole.ADMIN_BASIC;

    if (role === AdminRole.ADMIN_MASTER && callerRole !== AdminRole.ADMIN_MASTER) {
      throw new ForbiddenException('Only ADMIN_MASTER can create another ADMIN_MASTER');
    }

    const existing = await this.adminUserRepository.findAdminUserByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    return this.adminUserRepository.createAdminUser({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role,
      createdById: callerId,
    });
  }
}
