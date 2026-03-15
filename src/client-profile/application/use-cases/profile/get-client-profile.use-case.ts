import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_PROFILE_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientProfileRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';

@Injectable()
export class GetClientProfileUseCase {
  constructor(
    @Inject(CLIENT_PROFILE_REPOSITORY) private clientRepository: IClientProfileRepository,
  ) {}

  async getClientProfile(clientId: number) {
    const profile = await this.clientRepository.findProfileById(clientId);

    if (!profile) {
      throw new NotFoundException('Client not found');
    }

    return profile;
  }
}
