import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { PROFILE_REPOSITORY } from '../../../domain/interfaces/client-profile.repository.interface.js';
import type { IClientProfileRepository } from '../../../domain/interfaces/client-profile.repository.interface.js';
import type { UpdateProfileDto } from '../../../dto/profile/update-profile.dto.js';

@Injectable()
export class UpdateClientProfileUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(PROFILE_REPOSITORY) private profileRepository: IClientProfileRepository,
  ) {}

  async updateClientProfile(clientId: number, dto: UpdateProfileDto) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.profileRepository.updateProfile(clientId, dto);
  }
}
