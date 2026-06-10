import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IClientProfileRepository } from '../../../domain/interfaces/client-profile.repository.interface.js';

@Injectable()
export class GetClientProfileUseCase {
  constructor(
    @Inject(DiTokens.profileRepository) private profileRepository: IClientProfileRepository,
  ) {}

  async getClientProfile(clientId: number) {
    const profile = await this.profileRepository.findClientProfileById(clientId);

    if (!profile) {
      throw new NotFoundException('Client not found');
    }

    return profile;
  }
}
