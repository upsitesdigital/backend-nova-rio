import { ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { ADMIN_USER_REPOSITORY } from '../../../domain/interfaces/admin-user.repository.interface.js';
import type {
  AdminUserSafe,
  IAdminUserRepository,
} from '../../../domain/interfaces/admin-user.repository.interface.js';
import { CreateAdminUserDto } from '../../../dto/admin-user/create-admin-user.dto.js';

@Injectable()
export class CreateAdminUserUseCase {
  constructor(
    @Inject(ADMIN_USER_REPOSITORY) private adminUserRepository: IAdminUserRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
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
