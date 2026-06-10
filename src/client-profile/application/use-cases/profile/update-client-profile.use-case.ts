import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IClientProfileRepository } from '../../../domain/interfaces/client-profile.repository.interface.js';
import type { UpdateProfileDto } from '../../../dto/profile/update-profile.dto.js';

@Injectable()
export class UpdateClientProfileUseCase {
  constructor(
    @Inject(DiTokens.profileRepository) private profileRepository: IClientProfileRepository,
  ) {}

  async updateClientProfile(clientId: number, dto: UpdateProfileDto) {
    const client = await this.profileRepository.findClientProfileById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.profileRepository.updateProfile(clientId, dto);
  }
}
