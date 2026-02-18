import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { ADMIN_USER_REPOSITORY } from '../../../domain/interfaces/admin-user.repository.interface.js';
import type { IAdminUserRepository } from '../../../domain/interfaces/admin-user.repository.interface.js';

@Injectable()
export class DeleteAdminUserUseCase {
  constructor(@Inject(ADMIN_USER_REPOSITORY) private adminUserRepository: IAdminUserRepository) {}

  async deactivateAdminUserById(id: number, callerId: number, callerRole: string): Promise<void> {
    if (id === callerId) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    const existing = await this.adminUserRepository.findAdminUserById(id);

    if (!existing) {
      throw new NotFoundException('Admin user not found');
    }

    if (existing.role === AdminRole.ADMIN_MASTER && callerRole !== AdminRole.ADMIN_MASTER) {
      throw new ForbiddenException('Only ADMIN_MASTER can deactivate another ADMIN_MASTER');
    }

    await this.adminUserRepository.deactivateAdminUserById(id);
  }
}
