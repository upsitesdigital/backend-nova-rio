import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAdminProfileSelfRepository } from '../../../domain/interfaces/admin-profile.repository.interface.js';
import type { UpdateAdminProfileDto } from '../../../dto/profile/update-admin-profile.dto.js';

@Injectable()
export class UpdateAdminProfileUseCase {
  constructor(
    @Inject(DiTokens.adminProfileSelfRepository)
    private adminProfileRepository: IAdminProfileSelfRepository,
  ) {}

  async updateAdminProfile(adminId: number, dto: UpdateAdminProfileDto) {
    const admin = await this.adminProfileRepository.findAdminProfileById(adminId);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return this.adminProfileRepository.updateProfile(adminId, dto);
  }
}
