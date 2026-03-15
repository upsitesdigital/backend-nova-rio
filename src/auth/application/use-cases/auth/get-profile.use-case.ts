import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../../../shared/types/auth-user.type.js';
import {
  ADMIN_PROFILE_REPOSITORY,
  type IAdminProfileRepository,
} from '../../../domain/interfaces/admin.repository.interface.js';
import {
  CLIENT_PROFILE_REPOSITORY,
  type IClientProfileRepository,
} from '../../../domain/interfaces/client.repository.interface.js';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(CLIENT_PROFILE_REPOSITORY) private clientProfileRepository: IClientProfileRepository,
    @Inject(ADMIN_PROFILE_REPOSITORY) private adminProfileRepository: IAdminProfileRepository,
  ) {}

  async getProfile(user: AuthUser) {
    if (user.type === 'client') {
      const profile = await this.clientProfileRepository.findProfileById(user.id);

      if (!profile) {
        throw new NotFoundException('Client not found');
      }

      return profile;
    }

    const profile = await this.adminProfileRepository.findProfileById(user.id);

    if (!profile) {
      throw new NotFoundException('Admin not found');
    }

    return profile;
  }
}
