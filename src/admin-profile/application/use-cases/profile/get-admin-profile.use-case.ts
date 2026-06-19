import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAdminProfileSelfRepository } from '../../../domain/interfaces/admin-profile.repository.interface.js';

@Injectable()
export class GetAdminProfileUseCase {
  constructor(
    @Inject(DiTokens.adminProfileSelfRepository)
    private adminProfileRepository: IAdminProfileSelfRepository,
  ) {}

  async getAdminProfile(adminId: number) {
    const profile = await this.adminProfileRepository.findAdminProfileById(adminId);

    if (!profile) {
      throw new NotFoundException('Admin not found');
    }

    return profile;
  }
}
