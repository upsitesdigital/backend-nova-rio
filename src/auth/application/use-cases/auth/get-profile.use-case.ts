import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../../../shared/types/auth-user.type.js';
import { ADMIN_REPOSITORY } from '../../../domain/interfaces/admin.repository.interface.js';
import type { IAdminRepository } from '../../../domain/interfaces/admin.repository.interface.js';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface.js';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(ADMIN_REPOSITORY) private adminRepository: IAdminRepository,
  ) {}

  async getProfile(user: AuthUser) {
    if (user.type === 'client') {
      const profile = await this.clientRepository.findProfileById(user.id);

      if (!profile) {
        throw new NotFoundException('Client not found');
      }

      return profile;
    }

    const profile = await this.adminRepository.findProfileById(user.id);

    if (!profile) {
      throw new NotFoundException('Admin not found');
    }

    return profile;
  }
}
