import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminUserSafe,
  IAdminUserRepository,
} from '../../../domain/interfaces/admin-user.repository.interface.js';

@Injectable()
export class GetAdminUserUseCase {
  constructor(
    @Inject(DiTokens.adminUserRepository) private adminUserRepository: IAdminUserRepository,
  ) {}

  async getAdminUserById(id: number): Promise<AdminUserSafe> {
    const adminUser = await this.adminUserRepository.findAdminUserById(id);

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    return adminUser;
  }
}
