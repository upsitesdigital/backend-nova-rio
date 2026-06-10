import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../../../shared/types/auth-user.type.js';
import { type IAdminProfileRepository } from '../../../domain/interfaces/admin.repository.interface.js';
import { type IClientProfileRepository } from '../../../domain/interfaces/client.repository.interface.js';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(DiTokens.clientProfileRepository)
    private clientProfileRepository: IClientProfileRepository,
    @Inject(DiTokens.adminProfileRepository)
    private adminProfileRepository: IAdminProfileRepository,
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
